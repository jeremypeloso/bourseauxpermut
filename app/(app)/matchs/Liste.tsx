'use client';
import { useState } from 'react';
import Link from 'next/link';
import Paywall from '@/components/Paywall';

const AV = ['bg-gradient-to-br from-[#4C86FF] to-[#1B4FD6]', 'bg-gradient-to-br from-[#F4555C] to-[#E8232B]', 'bg-gradient-to-br from-[#3ED18B] to-[#149A5E]', 'bg-gradient-to-br from-[#A66BFF] to-[#6C3BC9]'];
const TYPE = { directe: 'Permutation directe', cycle3: 'Cycle à 3', cycle4: 'Cycle à 4' } as const;
export function Anneau({ p }: { p: number }) {
  const c = p >= 80 ? '#22B573' : '#F2A900';
  return <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-[12px] font-extrabold text-navy shrink-0" style={{ background: `conic-gradient(${c} ${p}%, #E6E9F0 0)` }}><span className="absolute inset-1 rounded-full bg-white" /><span className="relative">{p}%</span></div>;
}

export default function ListeMatchs({ corrs, premium, verifie }: { corrs: any[]; premium: boolean; verifie: boolean }) {
  const [pay, setPay] = useState(false);
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div><h1 className="text-[22px] font-extrabold tracking-tight text-navy">Mes matchs</h1><div className="text-[13px] text-[#6F7789]">Le matching intelligent recroise vos souhaits toutes les heures. {corrs.length} correspondance{corrs.length > 1 ? 's' : ''}.</div></div>
        <Link href="/annonces" className="btn-ghost !w-auto !py-2.5 px-4 text-[14px]">Retour aux annonces</Link>
      </div>
      {!verifie && <div className="card mb-4"><b className="text-navy">Compte à vérifier</b><div className="sub mt-1">Le matching ne prend que les agents vérifiés.</div><Link href="/onboarding" className="btn mt-3 !w-auto">Vérifier mon compte</Link></div>}
      {verifie && corrs.length === 0 && <div className="card mb-4"><b className="text-navy">Pas encore de correspondance</b><div className="sub mt-1">Plus vos souhaits sont larges (plusieurs villes, cycles acceptés), plus vite ça se ferme. En attendant, <Link href="/annonces" className="text-bleu font-semibold">parcourez les annonces</Link> ou <Link href="/deposer" className="text-bleu font-semibold">publiez la vôtre</Link>.</div></div>}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {corrs.map((c, idx) => {
          const top = idx === 0 && c.score >= 80;
          const inner = (
            <div className={`bg-white border rounded-2xl p-4 h-full ${top ? 'border-[#BFE9D3] bg-gradient-to-b from-[#F3FBF6] to-white' : 'border-[#E6E9F0]'}`}>
              <div className="flex justify-between items-center mb-2.5"><div><b className="text-[16px] text-navy">{TYPE[c.type as keyof typeof TYPE]}</b><small className="block text-[12px] text-[#6F7789]">{c.detail?.souhaits ?? ''}</small></div><Anneau p={c.score} /></div>
              <div className="flex items-center overflow-x-auto [scrollbar-width:none]">
                {c.membres.map((m: any, i: number) => (
                  <div key={i} className="flex items-center"><div className="flex flex-col items-center gap-1 min-w-[72px]"><div className={`w-[34px] h-[34px] rounded-xl text-white font-extrabold text-[13px] flex items-center justify-center ${AV[i % 4]}`}>{(m.ville_actuelle ?? '?').slice(0, 1)}</div><b className="text-[12px] text-navy">{m.ville_actuelle}</b><small className="text-[10px] text-[#6F7789]">{m.est_moi ? 'Vous' : `${m.grade} · ${Math.floor((m.anciennete_poste_mois ?? 0) / 12)} ans`}</small></div><div className="w-5 h-0.5 -mt-6 bg-[repeating-linear-gradient(90deg,#B9C3D8_0_4px,transparent_4px_7px)]" /></div>
                ))}
                <div className="flex flex-col items-center gap-1 min-w-[72px] opacity-40"><div className={`w-[34px] h-[34px] rounded-xl text-white font-extrabold text-[13px] flex items-center justify-center ${AV[0]}`}>{(c.membres[0]?.ville_actuelle ?? '?').slice(0, 1)}</div><b className="text-[12px] text-navy">{c.membres[0]?.ville_actuelle}</b><small className="text-[10px]">retour</small></div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5 text-[11px] font-semibold"><span className="rounded-full px-2 py-1 bg-[#DFF7EB] text-[#16804F]">Même grade</span>{c.detail?.service && <span className={`rounded-full px-2 py-1 ${c.detail.service.includes('↔') ? 'bg-[#FFE6E8] text-[#C8323B]' : 'bg-[#DFF7EB] text-[#16804F]'}`}>{c.detail.service}</span>}{c.detail?.depart && <span className="rounded-full px-2 py-1 bg-[#FFF3D6] text-[#9A6A00]">{c.detail.depart}</span>}</div>
              <span className={`block text-center mt-3 rounded-xl py-2.5 text-[13px] font-bold ${top ? 'bg-bleu text-white' : 'border border-[#E6E9F0] text-navy'}`}>{top ? 'Proposer la mise en relation' : 'Voir le détail'}</span>
            </div>
          );
          return premium || idx === 0 ? <Link key={c.id} href={`/matchs/${c.id}`}>{inner}</Link> : <button key={c.id} className="text-left" onClick={() => setPay(true)}>{inner}</button>;
        })}
      </div>
      <div className="mt-4 bg-white border border-[#E6E9F0] rounded-2xl px-4 py-3 text-[12.5px] text-[#6F7789]">🔒 Identités masquées jusqu&apos;à l&apos;accord de tous. Policiers, gendarmes et pénitentiaires ne sont jamais mélangés dans un cycle. Gratuit : alertes à +48 h. Premium : immédiates.</div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </>
  );
}
