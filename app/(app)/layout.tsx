import TopBar from '@/components/TopBar';
import { redirect } from 'next/navigation';
import { currentUser, supabaseServer } from '@/lib/supabase-server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/');
  const sb = supabaseServer();
  const { data: profil } = await sb.from('profils').select('institution').eq('id', user.id).maybeSingle();
  const { data: m } = await sb.from('v_mes_correspondances').select('id').eq('est_moi', true);
  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-20 md:pb-0">
      <TopBar nbMatchs={new Set((m ?? []).map(x => x.id)).size} institution={profil?.institution} />
      <main className="max-w-[1200px] mx-auto px-4 md:px-5 py-5 md:py-6">{children}</main>
    </div>
  );
}
