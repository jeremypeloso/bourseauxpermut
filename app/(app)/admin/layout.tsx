import { redirect } from 'next/navigation';
import { adminRequis } from '@/lib/admin';
import AdminNav from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await adminRequis();
  if (!me) redirect('/annonces');
  return (
    <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
