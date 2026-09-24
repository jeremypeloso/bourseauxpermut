import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { decrypt, encrypt } from '@/lib/crypto';

export const runtime = 'nodejs';

/** GET → mon contact (déchiffré pour moi seul). POST { telephone, email } → enregistre, chiffré. */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const { data: i } = await supabaseAdmin().from('identites').select('telephone_enc, contact_email_enc').eq('profil_id', user.id).maybeSingle();
  return NextResponse.json({ ok: true, telephone: i?.telephone_enc ? decrypt(i.telephone_enc) : '', email: i?.contact_email_enc ? decrypt(i.contact_email_enc) : (user.email ?? '') });
}
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const tel = String(b.telephone ?? '').replace(/[\s.\-]/g, '');
  const email = String(b.email ?? '').trim().toLowerCase();
  if (!/^(\+33|0)[1-9]\d{8}$/.test(tel)) return NextResponse.json({ ok: false, message: 'Numéro invalide (format 06 12 34 56 78 ou +33…).' }, { status: 400 });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, message: 'Email invalide.' }, { status: 400 });
  const admin = supabaseAdmin();
  const { data: ex } = await admin.from('identites').select('profil_id').eq('profil_id', user.id).maybeSingle();
  const champs = { telephone_enc: encrypt(tel), contact_email_enc: encrypt(email || user.email || '') };
  const { error } = ex ? await admin.from('identites').update(champs).eq('profil_id', user.id) : await admin.from('identites').insert({ profil_id: user.id, ...champs });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
