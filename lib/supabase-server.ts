import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/** Client lié à la session de l'utilisateur (RLS actif). */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list: { name: string; value: string; options?: any }[]) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {} },
      },
    }
  );
}

/** Client service_role : uniquement côté serveur, pour identités, empreintes, codes, matching. */
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
    // Jamais de cache Next/Vercel sur les appels administrateur (listes de comptes, stats) : toujours la base en direct
    global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
  });
}

export async function currentUser() {
  const { data } = await supabaseServer().auth.getUser();
  return data.user;
}
