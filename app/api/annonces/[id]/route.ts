import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/supabase-server';
import { clair, contexte, entete } from '@/lib/annonces';

export const runtime = 'nodejs';

/** GET détail : en clair si Premium, si c'est la mienne, ou si elle fait partie de mes 3 plus pertinentes. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const ctx = await contexte(user.id);
  if (!ctx) return NextResponse.json({ ok: false, error: 'profil manquant' }, { status: 400 });
  const { admin, moi, premium, verifie, score } = ctx;
  if (!verifie) return NextResponse.json({ ok: true, verifie: false });
  const { data: a } = await admin.from('annonces').select('*, services(ville, departement)').eq('id', params.id).eq('institution', moi.institution).eq('statut', 'active').maybeSingle();
  if (!a) return NextResponse.json({ ok: false, error: 'introuvable' }, { status: 404 });
  const mienne = a.profil_id === user.id;
  let visible = premium || mienne;
  if (!visible) {
    const { data: rows } = await admin.from('annonces').select('*, services(ville, departement)').eq('institution', moi.institution).eq('statut', 'active');
    const top = (rows ?? []).sort((x, y) => score(y) - score(x)).slice(0, 3).map(x => x.id);
    visible = top.includes(a.id);
  }
  const { data: sim } = await admin.from('annonces').select('*, services(ville, departement)').eq('institution', moi.institution).eq('statut', 'active').neq('id', a.id).limit(20);
  const similaires = (sim ?? []).filter(s => s.services?.departement === a.services?.departement || (s.cibles ?? []).some((c: any) => (a.cibles ?? []).some((d: any) => d.departement === c.departement))).slice(0, 3).map(entete);
  const { data: fav } = await admin.from('favoris').select('annonce_id').eq('profil_id', user.id).eq('annonce_id', a.id).maybeSingle();
  return NextResponse.json({ ok: true, verifie: true, premium, annonce: visible ? clair(a, mienne, score(a)) : entete(a), favori: !!fav, similaires });
}
