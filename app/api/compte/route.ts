import { NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

/** Suppression totale : profil, souhaits, identité, empreinte, correspondances (cascade), puis l'utilisateur Auth. */
export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  await admin.from('profils').delete().eq('id', user.id);        // cascade sur tout le reste
  await admin.auth.admin.deleteUser(user.id);
  return NextResponse.json({ ok: true });
}
