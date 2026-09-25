import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from '../Actions';
import { Table, d, Pill } from '../Table';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Annonces() {
  const a = supabaseAdmin();
  const { data: rows } = await a.from('annonces').select('id, profil_id, institution, grade, type_service, statut, demo, mise_en_avant_jusqua, cibles, created_at, services(ville, departement)').order('created_at', { ascending: false }).limit(300);
  const { data: { users } } = await a.auth.admin.listUsers({ perPage: 1000 });
  const mail = (id: string) => users.find(u => u.id === id)?.email ?? id.slice(0, 8);
  const R = (rows ?? []).map((x: any) => [
    <span key="t"><b className="text-navy">{x.grade} · {x.services?.ville ?? '?'} ({x.services?.departement ?? '?'}) → {(x.cibles ?? []).map((c: any) => c.ville ?? c.departement).join(', ')}</b><br /><small className="text-[#6F7789]">{x.type_service ?? '—'} · {x.institution} · {d(x.created_at)}</small></span>,
    <span key="o" className="text-[12px]">{x.demo ? <Pill ok={false} t="Exemple" /> : mail(x.profil_id)}</span>,
    <span key="s" className="flex flex-col gap-1"><Pill ok={x.statut === 'active'} t={x.statut} warn={x.statut !== 'active'} />{x.mise_en_avant_jusqua && new Date(x.mise_en_avant_jusqua) > new Date() && <Pill ok t={`Boost → ${d(x.mise_en_avant_jusqua)}`} />}</span>,
    <span key="ac" className="flex flex-wrap gap-1">
      <Link href={`/annonces/${x.id}`} className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-[#E6E9F0] bg-white text-navy">Voir</Link>
      {x.statut === 'active' ? <Bouton action="retirer_annonce" id={x.id} label="Retirer" /> : <Bouton action="reactiver_annonce" id={x.id} label="Réactiver" />}
      <Bouton action="boost_annonce" id={x.id} label="Boost 7 j" />
      <Bouton action="supprimer_annonce" id={x.id} label="Supprimer" danger confirm="Supprimer définitivement cette annonce ?" />
    </span>,
  ]);
  return <><h1 className="text-[22px] font-extrabold text-navy mb-4">Annonces <span className="text-[14px] font-semibold text-[#6F7789]">{(rows ?? []).length}</span></h1><Table cols={['Annonce', 'Propriétaire', 'Statut', 'Actions']} rows={R} /></>;
}
