import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/** Retour du lien magique : échange le code contre une session, puis redirige (next) ou onboarding/accueil. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = req.nextUrl.searchParams.get('next');
  const sb = supabaseServer();
  if (code) await sb.auth.exchangeCodeForSession(code);
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/', req.url));
  const { data: profil } = await sb.from('profils').select('verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
  if (next && next.startsWith('/')) return NextResponse.redirect(new URL(next, req.url));
  return NextResponse.redirect(new URL(profil ? '/accueil' : '/onboarding', req.url));
}
