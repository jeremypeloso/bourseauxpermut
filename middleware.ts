import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC = ['/', '/login', '/auth', '/api/stripe/webhook', '/api/cron', '/api/preinscription'];
const PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH === '1';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  // Prélancement : l'app n'est ouverte qu'aux comptes existants (toi et les tests) ; l'inscription publique est fermée
  if (PRELAUNCH && !user && path === '/login') return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin));
  if (!user && !PUBLIC.some(p => path === p || path.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin));
  }
  return res;
}

// Tout sauf les assets Next et les fichiers statiques (images, icônes, etc.)
export const config = { matcher: ['/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)'] };
