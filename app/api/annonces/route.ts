import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { clair, contexte, entete, estBoost } from '@/lib/annonces';

export const runtime = 'nodejs';
const CLAIR_GRATUIT = 3;
const MAX_EXEMPLES = 12; // les annonces d'exemple s'effacent une par une à mesure que les vraies arrivent
/** GET ?inst=PN&departement=06&vers=moi&depuis=cible&om=1&boost=1&q=nice */
export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const ctx = await contexte(user.id);
  if (!ctx) return NextResponse.json({ ok: false, error: 'profil manquant' }, { status: 400 });
  const { admin, moi, premium, verifie, monDep, mesDeps, score } = ctx;
  if (!verifie) return NextResponse.json({ ok: true, verifie: false, premium, annonces: [], total: 0, en_clair: 0 });

  const p = req.nextUrl.searchParams;
  const { data: rows } = await admin.from('annonces').select('*, services(ville, departement, outre_mer)').eq('institution', p.get('inst') || moi.institution).eq('statut', 'active').order('created_at', { ascending: false });
  let liste: any[] = rows ?? [];
  const dep = p.get('departement'); const q = (p.get('q') ?? '').toLowerCase();
  if (dep) liste = liste.filter(a => (a.cibles ?? []).some((c: any) => c.departement === dep) || a.services?.departement === dep);
  if (p.get('vers') === 'moi' && monDep) liste = liste.filter(a => (a.cibles ?? []).some((c: any) => c.departement === monDep));
  if (p.get('depuis') === 'cible') liste = liste.filter(a => mesDeps.has(a.services?.departement));
  if (p.get('om')) liste = liste.filter(a => a.services?.outre_mer || (a.cibles ?? []).some((c: any) => /^97/.test(c.departement ?? '')));
  if (p.get('boost')) liste = liste.filter(estBoost);
  if (q) liste = liste.filter(a => [a.services?.ville, a.services?.departement, a.type_service, a.grade, ...(a.cibles ?? []).map((c: any) => `${c.ville} ${c.departement}`)].join(' ').toLowerCase().includes(q));

  // Exemples : au plus MAX_EXEMPLES moins le nombre de vraies annonces actives, et jamais mis en avant
  const vraies = liste.filter(a => !a.demo); const exemples = liste.filter(a => a.demo).slice(0, Math.max(0, MAX_EXEMPLES - vraies.length));
  liste = [...vraies, ...exemples];
  liste.sort((a, b) => (Number(!a.demo) - Number(!b.demo)) * -1 || (Number(estBoost(b)) - Number(estBoost(a))) || (score(b) - score(a)) || (b.created_at > a.created_at ? 1 : -1));
  const out = liste.map((a, i) => { const mienne = a.profil_id === user.id && !a.demo; return premium || mienne || i < CLAIR_GRATUIT ? clair(a, mienne, score(a)) : entete(a); });
  return NextResponse.json({ ok: true, verifie: true, premium, annonces: out, total: liste.length, exemples: liste.filter(a => a.demo).length, en_clair: premium ? liste.length : Math.min(CLAIR_GRATUIT, liste.length) });
}

/** POST { visibilite?: 'simple'|'boost' } → publie ou met à jour mon annonce depuis mon profil. */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: p } = await admin.from('profils').select('institution, corps, grade, service_id, type_service, anciennete_poste_mois, depart_des, accepte_cycles, verifie_carte, verifie_mail_pro, souhaits(rang, service_id, departement, services(ville, departement))').eq('id', user.id).single();
  if (!p || !(p.verifie_carte || p.verifie_mail_pro)) return NextResponse.json({ ok: false, message: 'Compte non vérifié.' }, { status: 403 });
  if (!p.service_id || !(p.souhaits ?? []).length) return NextResponse.json({ ok: false, message: 'Renseignez votre affectation et au moins un souhait.' }, { status: 400 });
  const cibles = (p.souhaits as any[]).sort((a, b) => a.rang - b.rang).map(s => ({ service_id: s.service_id, ville: s.services?.ville ?? null, departement: s.departement ?? s.services?.departement ?? null }));
  const base = { profil_id: user.id, institution: p.institution, corps: p.corps, grade: p.grade, service_id: p.service_id, type_service: p.type_service, anciennete_poste_mois: p.anciennete_poste_mois, depart_des: p.depart_des, cibles, commentaire_structure: { accepte_cycles: p.accepte_cycles, deux_fois: !!(p.verifie_carte && p.verifie_mail_pro) }, statut: 'active', updated_at: new Date().toISOString() };
  const { data: ex } = await admin.from('annonces').select('id').eq('profil_id', user.id).eq('statut', 'active').eq('demo', false).maybeSingle();
  const { data: row, error } = ex ? await admin.from('annonces').update(base).eq('id', ex.id).select('id').single() : await admin.from('annonces').insert(base).select('id').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: row!.id });
}

export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  await supabaseAdmin().from('annonces').update({ statut: 'retiree', updated_at: new Date().toISOString() }).eq('profil_id', user.id).eq('statut', 'active').eq('demo', false);
  return NextResponse.json({ ok: true });
}
