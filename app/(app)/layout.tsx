import TabBar from '@/components/TabBar';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/supabase-server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/');
  return (
    <div className="mx-auto max-w-[430px] min-h-screen flex flex-col">
      <div className="flex-1 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-5">{children}</div>
      <TabBar />
    </div>
  );
}
