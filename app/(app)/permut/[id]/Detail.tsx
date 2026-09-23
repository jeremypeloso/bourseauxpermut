'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Paywall from '@/components/Paywall';
import { Anneau } from '../Liste';

export default function Detail({ id, rows, premium }: { id: string; rows: any[]; premium: boolean }) {
  const r = useRouter();
  const [pay, setPay] = useState(false);
  const [agents, setAgents] = useState<any[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const c = rows[0];
  const moi = rows.find(x => x.est_moi);
  const tous = rows.every(x => x.reponse === 'accepte');

  const act = async (action: string) => {
    const res = await fetch('/api/correspondances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    if (res.status === 402) return setPay(true);
    const j = await res.json();
    if (action === 'reveler') return setAgents(j.agents ?? []);
    if (action === 'ignorer') return r.push('/permut');
    setMsg(j.statut === 'confirmee' ? 'Tous les agents ont accepté.' : 'Réponse enregistrée. Vous serez prévenu des réponses des autres.');
    r.refresh();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-3"><Link href="/permut" className="text-bleu font-semibold text-[14px]">‹ Retour</Link><span className={c.score >= 80 ? 'pill-mint' : 'pill-amber'}>{c.score} % compatible</span></div>
      <h1 className="h1">{c.type === 'directe' ? 'Permutation directe' : `Cycle à ${c.type === 'cycle3' ? 3 : 4} agents`}</h1>
      <p className="sub mt-1">Chaque agent rejoint le poste de l&apos;agent suivant. Rien n&apos;est engagé tant que tout le monde n&apos;a pas accepté.</p>

      <div className="card mt-4">
        {rows.map((m, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-t border-[#E6E9F0] first:border-t-0">
            <span className="w-7 h-7 rounded-lg bg-navy text-white text-[12px] font-extrabold flex items-center justify-center">{m.position}</span>
            <span className="flex-1"><b className="block text-[14px] text-navy">{m.est_moi ? 'Vous' : 'Agent vérifié'} · {m.ville_actuelle}</b><small className="sub">{m.grade} · {m.type_service ?? '—'} · va à {m.ville_cible}</small></span>
            <span className={`pill ${m.reponse === 'accepte' ? 'bg-[#DFF7EB] text-[#16804F]' : m.reponse === 'refuse' ? 'bg-[#FFE6E8] text-[#C8323B]' : 'bg-[#F5F7FB] text-[#6F7789]'}`}>{m.reponse === 'accepte' ? 'A accepté' : m.reponse === 'refuse' ? 'A refusé' : 'En attente'}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex justify-between items-center"><b className="text-[14px] text-navy">Pourquoi ce score</b><Anneau p={c.score} /></div>
        {Object.entries(c.detail ?? {}).map(([k, v]) => <div key={k} className="kv"><span className="capitalize">{k}</span><b>{String(v)}</b></div>)}
      </div>

      <div className="bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#3B4457] border-l-[3px] border-amber"><b className="text-[#9A6A00]">Rappel.</b> La permutation n&apos;est pas un droit. Chaque agent dépose ensuite une demande de mutation classique en mentionnant les autres. L&apos;app prépare les courriers.</div>

      {agents ? (
        <div className="card mt-3 bg-gradient-to-b from-[#DFF7EB] to-white border border-[#CDEFDC]">
          <b className="text-[#16804F]">Cycle confirmé, identités visibles</b>
          {agents.map(a => <div key={a.position} className="kv"><span>Agent {a.position} · {a.prenom} {a.nom}</span><b>{a.telephone ?? a.mail_pro}</b></div>)}
        </div>
      ) : tous ? (
        <button className="btn mt-3 bg-mint" onClick={() => act('reveler')}>Voir les identités</button>
      ) : moi?.reponse === 'attente' ? (
        <>
          <button className="btn mt-3" onClick={() => act('accepter')}>Proposer la mise en relation</button>
          <button className="btn-ghost mt-2" onClick={() => act('ignorer')}>Ignorer cette correspondance</button>
        </>
      ) : <p className="sub text-center mt-3">Votre réponse : {moi?.reponse}. En attente des autres.</p>}
      {msg && <p className="sub text-center mt-3">{msg}</p>}
      <Paywall open={pay} onClose={() => setPay(false)} />
    </>
  );
}
