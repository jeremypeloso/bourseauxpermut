'use client';
import { useState } from 'react';
import Link from 'next/link';
import Paywall from '@/components/Paywall';

const AV = ['bg-gradient-to-br from-[#4C86FF] to-[#1B4FD6]', 'bg-gradient-to-br from-[#F4555C] to-[#E8232B]', 'bg-gradient-to-br from-[#3ED18B] to-[#149A5E]', 'bg-gradient-to-br from-[#A66BFF] to-[#6C3BC9]'];
const TYPE = { directe: 'Permutation directe', cycle3: 'Cycle à 3', cycle4: 'Cycle à 4' } as const;

export function Anneau({ p }: { p: number }) {
  const c = p >= 80 ? '#22B573' : '#F2A900';
  return <div className="relative w-[54px] h-[54px] rounded-full flex items-center justify-center text-[14px] font-extrabold text-navy" style={{ background: `conic-gradient(${c} ${p}%, #E6E9F0 0)` }}><span className="absolute inset-[5px] rounded-full bg-white" /><span className="relative">{p}%</span></div>;
}

export default function ListeCorrespondances({ corrs, premium }: { corrs: any[]; premium: boolean }) {
  const [filtre, setFiltre] = useState<'all' | 'directe' | 'cycle'>('all');
  const [pay, setPay] = useState(false);
  const visibles = corrs.filter(c => filtre === 'all' || (filtre === 'directe' ? c.type === 'directe' : c.type !== 'directe'));
  return (
    <>
      <div className="flex justify-between items-center mb-3"><h1 className="h1">Correspondances</h1><span className="sub">{corrs.length}</span></div>
      <div className="flex gap-1.5 mb-3">
        {(['all', 'directe', 'cycle'] as const).map(f => <button key={f} onClick={() => setFiltre(f)} className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${filtre === f ? 'bg-navy text-white' : 'bg-white text-[#6F7789]'}`}>{f === 'all' ? 'Toutes' : f === 'directe' ? 'Directes' : 'Cycles'}</button>)}
      </div>
      {visibles.length === 0 && <div className="card"><b className="text-navy">Pas encore de correspondance</b><div className="sub mt-1">Le matching tourne toutes les heures sur les profils vérifiés. Plus vos souhaits sont larges (département, souhaits 2 et 3, cycles), plus vite ça se ferme.</div></div>}
      {visibles.map((c, idx) => {
        const top = idx === 0 && c.score >= 80;
        const inner = (
          <div className={`card mb-3 border ${top ? 'border-[#BFE9D3] bg-gradient-to-b from-[#F3FBF6] to-white' : 'border-transparent'}`}>
            <div className="flex justify-between items-center mb-3">
              <div><b className="text-[16px] text-navy tracking-tight">{TYPE[c.type as keyof typeof TYPE]}</b><small className="block sub">{c.detail?.souhaits ?? ''}</small></div>
              <Anneau p={c.score} />
            </div>
            <div className="flex items-center overflow-x-auto [scrollbar-width:none]">
              {c.membres.map((m: any, i: number) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 min-w-[74px]">
                    <div className={`w-9 h-9 rounded-xl text-white font-extrabold text-[14px] flex items-center justify-center ${AV[i % 4]}`}>{(m.ville_actuelle ?? '?').slice(0, 1)}</div>
                    <b className="text-[12px] text-navy">{m.ville_actuelle}</b>
                    <small className="text-[10px] text-[#6F7789]">{m.est_moi ? 'Vous' : m.grade} {m.est_moi ? '' : `· ${Math.floor((m.anciennete_poste_mois ?? 0) / 12)} ans`}</small>
                  </div>
                  <div className="w-6 h-0.5 -mt-6 bg-[repeating-linear-gradient(90deg,#B9C3D8_0_4px,transparent_4px_7px)]" />
                </div>
              ))}
              <div className="flex flex-col items-center gap-1 min-w-[74px] opacity-40"><div className={`w-9 h-9 rounded-xl text-white font-extrabold text-[14px] flex items-center justify-center ${AV[0]}`}>{(c.membres[0]?.ville_actuelle ?? '?').slice(0, 1)}</div><b className="text-[12px] text-navy">{c.membres[0]?.ville_actuelle}</b><small className="text-[10px]">retour</small></div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3 text-[11.5px] font-semibold">
              <span className="rounded-full px-2.5 py-1 bg-[#DFF7EB] text-[#16804F]">Même grade</span>
              {c.detail?.souhaits && <span className="rounded-full px-2.5 py-1 bg-[#DFF7EB] text-[#16804F]">{c.detail.souhaits}</span>}
              {c.detail?.service && <span className={`rounded-full px-2.5 py-1 ${c.detail.service.includes('↔') ? 'bg-[#FFE6E8] text-[#C8323B]' : 'bg-[#DFF7EB] text-[#16804F]'}`}>{c.detail.service}</span>}
              {c.detail?.depart && <span className="rounded-full px-2.5 py-1 bg-[#FFF3D6] text-[#9A6A00]">{c.detail.depart}</span>}
            </div>
          </div>
        );
        return premium || idx === 0 ? <Link key={c.id} href={`/permut/${c.id}`}>{inner}</Link> : <button key={c.id} className="text-left w-full" onClick={() => setPay(true)}>{inner}</button>;
      })}
      <div className="flex items-center gap-2.5 bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#6F7789]">🔒 Identités masquées, révélées uniquement quand tous ont accepté. Policiers, gendarmes et pénitentiaires ne sont jamais mélangés dans un cycle.</div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </>
  );
}
