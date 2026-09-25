import { NextRequest, NextResponse } from 'next/server';
import { mailAdmin } from '@/lib/email';

export const runtime = 'nodejs';
const recents = new Map<string, number[]>();   // anti-spam simple : 3 messages / 10 min / IP

/** POST { institution, email?, message } → mail vers la boîte de contact. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'ip';
  const now = Date.now(); const l = (recents.get(ip) ?? []).filter(t => now - t < 600e3);
  if (l.length >= 3) return NextResponse.json({ ok: false, message: 'Trop de messages, réessayez dans quelques minutes.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const message = String(b.message ?? '').trim().slice(0, 2000);
  const email = String(b.email ?? '').trim().slice(0, 120);
  if (message.length < 10) return NextResponse.json({ ok: false, message: 'Message trop court.' }, { status: 400 });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, message: 'Email invalide.' }, { status: 400 });
  if (b.piege) return NextResponse.json({ ok: true });   // champ caché rempli par les robots
  recents.set(ip, [...l, now]);
  try {
    await mailAdmin('Message depuis le site', [`Institution : ${String(b.institution ?? '—').slice(0, 60)}`, `Réponse à : ${email || 'non communiquée'}`, '', ...message.split('\n').map(x => x.replace(/</g, '&lt;'))]);
  } catch (e: any) { return NextResponse.json({ ok: false, message: 'Envoi impossible pour le moment.' }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
