'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

/**
 * Simulateur indicatif. Les valeurs du barème sont volontairement des variables :
 * à recaler sur le barème officiel de chaque institution avant lancement.
 */
const BAREME = { anneeAdmin: 30, poste: 72, conjoint: 60, enfant: 20, quartierDifficile: 100, cimm: 150, reconduit: 20 };
const HISTO = [
  { ville: 'Nice', dep: 'Alpes-Maritimes', pts: 438 }, { ville: 'Toulon', dep: 'Var', pts: 415 },
  { ville: 'Marseille', dep: 'Bouches-du-Rhône', pts: 362 }, { ville: 'Perpignan', dep: 'Pyrénées-Orientales', pts: 340 },
  { ville: 'La Réunion', dep: 'Outre-mer · CIMM prioritaire', pts: 512 }, { ville: 'Guadeloupe', dep: 'Outre-mer · CIMM prioritaire', pts: 430 },
];

export default function Points() {
  const [anc, setAnc] = useState(8);
  const [f, setF] = useState({ conjoint: true, enfant: true, qd: false, cimm: false });
  const total = useMemo(() => anc * BAREME.anneeAdmin + BAREME.poste + BAREME.reconduit + (f.conjoint ? BAREME.conjoint : 0) + (f.enfant ? BAREME.enfant : 0) + (f.qd ? BAREME.quartierDifficile : 0) + (f.cimm ? BAREME.cimm : 0), [anc, f]);
  const Sw = ({ k }: { k: keyof typeof f }) => <button onClick={() => setF({ ...f, [k]: !f[k] })} className={`w-[46px] h-[27px] rounded-full relative transition ${f[k] ? 'bg-bleu' : 'bg-[#D5D9E2]'}`}><span className={`absolute top-[3px] w-[21px] h-[21px] rounded-full bg-white shadow transition-all ${f[k] ? 'left-[22px]' : 'left-[3px]'}`} /></button>;
  return (
    <>
      <Link href="/accueil" className="text-bleu font-semibold text-[14px]">‹ Accueil</Link>
      <h1 className="h1 mt-2">Mes points</h1>
      <p className="sub mt-1">Estimation indicative à partir de vos déclarations. Bougez les réglages pour simuler.</p>
      <div className="rounded-xl3 p-5 mt-4 text-white bg-gradient-to-br from-navy2 to-navy flex justify-between items-end">
        <div><div className="text-[44px] font-extrabold tracking-tighter leading-none">{total}</div><div className="text-[#A9B7D6] text-[12px]">points estimés</div></div>
        <div className="text-right"><div className="text-[18px] font-extrabold">{Math.max(1, Math.round(118 - (total - 412) * 1.6))}e</div><div className="text-[#A9B7D6] text-[12px]">sur 640 vœux Nice</div></div>
      </div>
      <div className="card mt-3">
        <div className="kv border-t-0"><span>Ancienneté administrative · <b>{anc}</b> ans</span><b>{anc * BAREME.anneeAdmin}</b></div>
        <input type="range" min={1} max={25} value={anc} onChange={e => setAnc(+e.target.value)} className="w-full accent-bleu" />
        <div className="kv"><span>Ancienneté dans le poste</span><b>{BAREME.poste}</b></div>
        <div className="kv"><span>Rapprochement de conjoint</span><Sw k="conjoint" /></div>
        <div className="kv"><span>Enfant à charge</span><Sw k="enfant" /></div>
        <div className="kv"><span>Quartier difficile, 5 ans</span><Sw k="qd" /></div>
        <div className="kv"><span>CIMM (outre-mer)</span><Sw k="cimm" /></div>
        <div className="kv"><span>Vœu reconduit, 2 ans</span><b>{BAREME.reconduit}</b></div>
      </div>
      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Dernier entrant par ville, 2025</h2>
      <div className="card">
        {HISTO.map(h => <div key={h.ville} className="flex items-center gap-3 py-2.5 border-t border-[#E6E9F0] first:border-t-0">
          <span className={`w-10 h-10 rounded-xl text-white font-extrabold flex items-center justify-center ${total >= h.pts ? 'bg-mint' : total >= h.pts - 30 ? 'bg-amber' : 'bg-coral'}`}>{h.ville.slice(0, 1)}</span>
          <span className="flex-1"><b className="block text-[14px] text-navy">{h.ville}</b><small className="sub">{h.dep}</small></span><b className="text-[15px]">{h.pts}</b>
        </div>)}
      </div>
      <p className="text-center text-[11.5px] text-[#A3AAB8] mt-2">Données déclarées par les membres, non officielles.</p>
    </>
  );
}
