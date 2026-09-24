import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import type { EmailOtpType } from '@supabase/supabase-js';

const base = (req: NextRequest) => process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

/**
 * Lien reçu par mail : /auth/confirm?token_hash=…&type=signup|magiclink|recovery|email_change&next=/…
 * Vérifie le jeton côté serveur (fonctionne depuis n'importe quel appareil), pose la session, puis oriente.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const token_hash = p.get('token_hash'); const type = p.get('type') as EmailOtpType | null; const next = p.get('next');
  if (!token_hash || !type) return NextResponse.redirect(new URL('/?erreur=lien', base(req)));
  const sb = supabaseServer();
  // signup et magiclink se vérifient tous deux avec le type 'email' ; on tente le type reçu puis 'email' en secours
  let { error } = await sb.auth.verifyOtp({ token_hash, type });
  if (error && (type === 'signup' || type === 'magiclink')) ({ error } = await sb.auth.verifyOtp({ token_hash, type: 'email' }));
  if (error) return NextResponse.redirect(new URL(`/?erreur=lien_expire&d=${encodeURIComponent(error.message.slice(0, 80))}`, base(req)));
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/', base(req)));
  if (type === 'recovery') return NextResponse.redirect(new URL('/compte/mot-de-passe', base(req)));
  const { data: profil } = await sb.from('profils').select('verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
  if (!profil) return NextResponse.redirect(new URL(next && next.startsWith('/onboarding') ? next : '/onboarding', base(req)));
  if (!user.user_metadata?.mdp) return NextResponse.redirect(new URL('/onboarding', base(req)));
  if (next && next.startsWith('/')) return NextResponse.redirect(new URL(next, base(req)));
  return NextResponse.redirect(new URL('/annonces', base(req)));
}
