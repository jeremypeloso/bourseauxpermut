import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from '../Actions';
import { Table, d, Pill } from '../Table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Corrs() {
  const a = supabaseAdmin();
  const { data: rows } = await a.from('correspondances').select('id, type, score, statut, detail, created_at, correspondance_membres(position, reponse, profil_id, profils(services!profils_service_id_fkey(ville)))').order('created_at', { ascending: false }).limit(200);
  const { data: { users } } = await a.auth.admin.listUsers({ perPage: 1000 });
  const mail = (id: string) => users.find(u => u.id === id)?.email ?? id.slice(0, 8);
  const R = (rows ?? []).map((c: any) => [
    <span key="t"><b className="text-navy">{c.type === 'directe' ? 'Échange direct' : c.type} · {c.score} %</b><br /><small className="text-[#6F7789]">{d(c.created_at)} · {c.detail?.souhaits ?? ''}</small></span>,
    <span key="m" className="text-[12px]">{[...(c.correspondance_membres ?? [])].sort((x: any, y: any) => x.position - y.position).map((m: any) => <span key={m.position} className="block">{m.position}. {m.profils?.services?.ville ?? '?'} · {mail(m.profil_id)} · <b>{m.reponse}</b></span>)}</span>,
    <Pill key="s" ok={c.statut === 'confirmee'} t={c.statut} warn={c.statut === 'refusee'} />,
    <span key="ac">{c.statut !== 'refusee' && <Bouton action="fermer_corr" id={c.id} label="Fermer" danger confirm="Fermer cette correspondance pour tous ?" />}</span>,
  ]);
  return <><h1 className="text-[22px] font-extrabold text-navy mb-4">Correspondances <span className="text-[14px] font-semibold text-[#6F7789]">{(rows ?? []).length}</span></h1><Table cols={['Correspondance', 'Agents', 'Statut', 'Actions']} rows={R} /></>;
}
