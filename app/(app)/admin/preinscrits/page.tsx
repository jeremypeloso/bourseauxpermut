import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from '../Actions';
import { Table, d, Pill } from '../Table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Pre() {
  const a = supabaseAdmin();
  const { data: rows } = await a.from('preinscriptions').select('id, email, institution, departement, canal, invite_le, created_at').order('created_at', { ascending: false });
  const canaux = Object.entries((rows ?? []).reduce((acc: Record<string, number>, r) => { const k = r.canal ?? 'direct'; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {}));
  const R = (rows ?? []).map(r => [<b key="e" className="text-navy">{r.email}</b>, <span key="i">{r.institution ?? '—'} · {r.departement ?? '—'}</span>, <span key="c">{r.canal ?? 'direct'}</span>, <span key="d">{d(r.created_at)}</span>, <Pill key="v" ok={!!r.invite_le} t={r.invite_le ? `Invité le ${d(r.invite_le)}` : 'À inviter'} />, <Bouton key="ac" action="supprimer_preinscrit" id={r.id} label="Supprimer" danger confirm="Supprimer cette pré-inscription ?" />]);
  return <><div className="flex flex-wrap items-end justify-between gap-3 mb-4"><div><h1 className="text-[22px] font-extrabold text-navy">Pré-inscrits <span className="text-[14px] font-semibold text-[#6F7789]">{(rows ?? []).length}</span></h1><p className="text-[13px] text-[#6F7789]">Par canal : {canaux.map(([k, n]) => `${k} ${n}`).join(' · ') || '—'}</p></div><a href={`data:text/csv;charset=utf-8,${encodeURIComponent('email;institution;departement;canal;date\n' + (rows ?? []).map(r => [r.email, r.institution, r.departement, r.canal, r.created_at].join(';')).join('\n'))}`} download="preinscrits.csv" className="btn-ghost !w-auto !py-2 px-4 text-[13px]">Exporter CSV</a></div><Table cols={['Email', 'Institution · dép.', 'Canal', 'Date', 'Invitation', '']} rows={R} /></>;
}
