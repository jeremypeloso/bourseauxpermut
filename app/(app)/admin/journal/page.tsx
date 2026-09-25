import { supabaseAdmin } from '@/lib/supabase-server';
import { Table } from '../Table';
export const dynamic = 'force-dynamic';
export default async function Journal() {
  const a = supabaseAdmin();
  const { data: rows } = await a.from('journal_identites').select('id, profil_id, par_fonction, correspondance_id, created_at').order('created_at', { ascending: false }).limit(300);
  const { data: { users } } = await a.auth.admin.listUsers({ perPage: 1000 });
  const mail = (id: string) => users.find(u => u.id === id)?.email ?? id.slice(0, 8);
  const F: Record<string, string> = { reveler_identites: 'Révélation des identités', courrier_pdf: 'Courrier PDF généré' };
  return <><h1 className="text-[22px] font-extrabold text-navy mb-1">Journal des accès aux identités</h1><p className="text-[13px] text-[#6F7789] mb-4">Chaque révélation et chaque courrier généré sont tracés (RGPD : preuve d&apos;accès légitime).</p>
    <Table cols={['Date', 'Agent', 'Action', 'Correspondance']} rows={(rows ?? []).map(r => [<span key="d">{new Date(r.created_at).toLocaleString('fr-FR')}</span>, <span key="a">{mail(r.profil_id)}</span>, <span key="f">{F[r.par_fonction] ?? r.par_fonction}</span>, <code key="c" className="text-[11px]">{r.correspondance_id?.slice(0, 8)}</code>])} /></>;
}
