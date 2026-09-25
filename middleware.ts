import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC = ['/', '/login', '/auth', '/legal', '/api/stripe/webhook', '/api/cron', '/api/preinscription', '/api/notif'];
const PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH === '1';
const estPublic = (path: string) => PUBLIC.some(p => path === p || path.startsWith(p + '/'));

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const base = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sans configuration Supabase (variable manquante) : les pages publiques restent servies, le reste renvoie à l'accueil
  if (!url || !key) return estPublic(path) ? NextResponse.next() : NextResponse.redirect(new URL('/', base));

  const res = NextResponse.next({ request: req });
  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: { name: string; value: string; options?: any }[]) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (PRELAUNCH && !user && path === '/login') return NextResponse.redirect(new URL('/', base));
    if (!user && !estPublic(path)) return NextResponse.redirect(new URL('/', base));
    return res;
  } catch {
    return estPublic(path) ? NextResponse.next() : NextResponse.redirect(new URL('/', base));
  }
}

export const config = { matcher: ['/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)'] };
