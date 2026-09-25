import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
export const runtime = 'nodejs';
/** POST { annonce_id, motif, commentaire? } */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!['identifiante', 'hors_sujet', 'doublon', 'autre'].includes(b.motif)) return NextResponse.json({ ok: false, message: 'Motif invalide.' }, { status: 400 });
  const admin = supabaseAdmin();
  const { data: deja } = await admin.from('signalements').select('id').eq('annonce_id', b.annonce_id).eq('par', user.id).maybeSingle();
  if (deja) return NextResponse.json({ ok: true, deja: true });
  const { error } = await admin.from('signalements').insert({ annonce_id: b.annonce_id, par: user.id, motif: b.motif, commentaire: String(b.commentaire ?? '').slice(0, 300) || null });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
