import TopBar from '@/components/TopBar';
import { DialogProvider } from '@/components/Dialog';
import { redirect } from 'next/navigation';
import { currentUser, supabaseServer } from '@/lib/supabase-server';
import { estAdmin } from '@/lib/admin';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/');
  const sb = supabaseServer();
  const [{ data: profil }, { data: m }] = await Promise.all([
    sb.from('profils').select('institution').eq('id', user.id).maybeSingle(),
    sb.from('v_mes_correspondances').select('id').eq('est_moi', true).eq('reponse', 'attente').neq('statut', 'refusee'),
  ]);
  // Pas encore de profil (compte tout juste créé ou session d'un ancien compte) : l'onboarding d'abord
  if (!profil) redirect('/onboarding');
  return (
    <DialogProvider>
    <div className="min-h-screen bg-[#F4F6FA] pb-20 md:pb-0">
      <TopBar nbMatchs={new Set((m ?? []).map(x => x.id)).size} institution={profil?.institution} admin={estAdmin(user.email)} />
      <main className="max-w-[1200px] mx-auto px-4 md:px-5 py-5 md:py-6">{children}</main>
    </div>
    </DialogProvider>
  );
}
