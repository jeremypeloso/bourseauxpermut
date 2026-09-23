import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';
const CLAIR_GRATUIT = 3;

type Annonce = any;
const entete = (a: Annonce) => ({
  id: a.id, grade: a.grade, ville: a.services?.ville ?? null, departement: a.services?.departement ?? null,
  cibles_villes: (a.cibles ?? []).map((c: any) => c.ville).slice(0, 3),
  mise_en_avant: !!a.mise_en_avant_jusqua && new Date(a.mise_en_avant_jusqua) > new Date(),
  flou: true,
});
const clair = (a: Annonce, mienne: boolean) => ({
  ...entete(a), flou: false, mienne,
  corps: a.corps, type_service: a.type_service, anciennete_poste_mois: a.anciennete_poste_mois, depart_des: a.depart_des,
  cibles: a.cibles, commentaire_structure: a.commentaire_structure, created_at: a.created_at, statut: a.statut,
});

/** GET ?departement=06  → liste filtrée selon le plan. */
export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: moi } = await admin.from('profils').select('institution, premium_jusqua, verifie_carte, verifie_mail_pro, service_id, services(departement), souhaits(service_id, departement, services(departement))').eq('id', user.id).single();
  if (!moi) return NextResponse.json({ error: 'profil manquant' }, { status: 400 });
  const premium = !!moi.premium_jusqua && new Date(moi.premium_jusqua) > new Date();
  const verifie = moi.verifie_carte || moi.verifie_mail_pro;
  if (!verifie) return NextResponse.json({ ok: true, verifie: false, premium, annonces: [], total: 0 });

  const dep = req.nextUrl.searchParams.get('departement');
  let q = admin.from('annonces').select('*, services(ville, departement)').eq('institution', moi.institution).eq('statut', 'active').order('mise_en_avant_jusqua', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
  const { data: rows } = await q;
  let liste: Annonce[] = rows ?? [];
  if (dep) liste = liste.filter(a => (a.cibles ?? []).some((c: any) => c.departement === dep) || a.services?.departement === dep);

  // Pertinence : l'annonce vise mon département (elle veut venir chez moi) ou part de là où je veux aller
  const monDep = (moi as any).services?.departement;
  const mesDeps = new Set<string>(((moi as any).souhaits ?? []).map((s: any) => s.departement ?? s.services?.departement).filter(Boolean));
  const score = (a: Annonce) => ((a.cibles ?? []).some((c: any) => c.departement === monDep) ? 2 : 0) + (mesDeps.has(a.services?.departement) ? 2 : 0) + (a.mise_en_avant_jusqua && new Date(a.mise_en_avant_jusqua) > new Date() ? 1 : 0);
  liste.sort((a, b) => score(b) - score(a) || (b.created_at > a.created_at ? 1 : -1));

  const out = liste.map((a, i) => {
    const mienne = a.profil_id === user.id;
    if (premium || mienne || i < CLAIR_GRATUIT) return clair(a, mienne);
    return entete(a); // le corps n'est jamais envoyé : le flou n'est pas contournable
  });
  return NextResponse.json({ ok: true, verifie: true, premium, annonces: out, total: liste.length, en_clair: premium ? liste.length : Math.min(CLAIR_GRATUIT, liste.length) });
}

/** POST → publie (ou met à jour) mon annonce à partir de mon profil et de mes souhaits. Gratuit. */
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: p } = await admin.from('profils').select('institution, corps, grade, service_id, type_service, anciennete_poste_mois, depart_des, verifie_carte, verifie_mail_pro, souhaits(rang, service_id, departement, services(ville, departement))').eq('id', user.id).single();
  if (!p || !(p.verifie_carte || p.verifie_mail_pro)) return NextResponse.json({ ok: false, message: 'Compte non vérifié.' }, { status: 403 });
  if (!p.service_id || !(p.souhaits ?? []).length) return NextResponse.json({ ok: false, message: 'Renseignez votre affectation et au moins un souhait dans votre profil.' }, { status: 400 });
  const cibles = (p.souhaits as any[]).sort((a, b) => a.rang - b.rang).map(s => ({ service_id: s.service_id, ville: s.services?.ville ?? null, departement: s.departement ?? s.services?.departement ?? null }));
  const base = { profil_id: user.id, institution: p.institution, corps: p.corps, grade: p.grade, service_id: p.service_id, type_service: p.type_service, anciennete_poste_mois: p.anciennete_poste_mois, depart_des: p.depart_des, cibles, statut: 'active', updated_at: new Date().toISOString() };
  const { data: existante } = await admin.from('annonces').select('id').eq('profil_id', user.id).eq('statut', 'active').maybeSingle();
  const { error } = existante ? await admin.from('annonces').update(base).eq('id', existante.id) : await admin.from('annonces').insert(base);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE → retire mon annonce. */
export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  await supabaseAdmin().from('annonces').update({ statut: 'retiree', updated_at: new Date().toISOString() }).eq('profil_id', user.id).eq('statut', 'active');
  return NextResponse.json({ ok: true });
}
