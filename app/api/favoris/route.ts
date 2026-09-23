import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { entete } from '@/lib/annonces';

export const runtime = 'nodejs';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const { data } = await admin.from('favoris').select('annonce_id, annonces(*, services(ville, departement))').eq('profil_id', user.id).order('created_at', { ascending: false });
  return NextResponse.json({ ok: true, annonces: (data ?? []).map((f: any) => f.annonces).filter((a: any) => a && a.statut === 'active').map(entete) });
}
/** POST { annonce_id } → bascule. */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const { annonce_id } = await req.json();
  const admin = supabaseAdmin();
  const { data: dm } = await admin.from('annonces').select('demo').eq('id', annonce_id).maybeSingle();
  if (dm?.demo) return NextResponse.json({ ok: false, message: 'Annonce d\'exemple, non sauvegardable.' }, { status: 400 });
  const { data: ex } = await admin.from('favoris').select('annonce_id').eq('profil_id', user.id).eq('annonce_id', annonce_id).maybeSingle();
  if (ex) { await admin.from('favoris').delete().eq('profil_id', user.id).eq('annonce_id', annonce_id); return NextResponse.json({ ok: true, favori: false }); }
  await admin.from('favoris').insert({ profil_id: user.id, annonce_id });
  return NextResponse.json({ ok: true, favori: true });
}
