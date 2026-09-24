'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Paywall from '@/components/Paywall';
import { Anneau } from '../Liste';

export default function Detail({ id, rows, premium }: { id: string; rows: any[]; premium: boolean }) {
  const r = useRouter();
  const [pay, setPay] = useState(false); const [agents, setAgents] = useState<any[] | null>(null); const [msg, setMsg] = useState<string | null>(null);
  const c = rows[0]; const moi = rows.find(x => x.est_moi); const tous = rows.every(x => x.reponse === 'accepte');
  const act = async (action: string) => {
    const res = await fetch('/api/correspondances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    if (res.status === 402) return setPay(true);
    const j = await res.json();
    if (action === 'reveler') return setAgents(j.agents ?? []);
    if (action === 'ignorer') return r.push('/matchs');
    setMsg(j.statut === 'confirmee' ? 'Tous les agents ont accepté.' : 'Réponse enregistrée. Les autres agents sont prévenus par mail ; vous recevrez un mail dès qu\'ils auront répondu.');
    setTimeout(() => location.reload(), 900);
  };
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div>
        <div className="text-[13px] text-[#6F7789] mb-3"><Link href="/matchs" className="text-bleu font-semibold">Mes matchs</Link> › {c.type === 'directe' ? 'Permutation directe' : `Cycle à ${c.type === 'cycle3' ? 3 : 4}`}</div>
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5 md:p-6">
          <div className="flex justify-between items-start gap-4"><div><h1 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-navy">{c.type === 'directe' ? 'Échange direct' : `Cycle à ${c.type === 'cycle3' ? 3 : 4} agents`}{moi ? ` · vous allez à ${moi.ville_cible}` : ''}</h1><p className="sub mt-1">{c.type === 'directe' ? 'Vous prenez le poste de l\'autre agent, il prend le vôtre.' : 'Chaque agent rejoint le poste de l\'agent suivant.'} Rien n&apos;est engagé tant que tout le monde n&apos;a pas accepté ; un refus referme la correspondance.</p></div><Anneau p={c.score} /></div>
          <div className="mt-4">{rows.map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-t border-[#E6E9F0] first:border-t-0">
              <span className="w-8 h-8 rounded-lg bg-navy text-white text-[12px] font-extrabold flex items-center justify-center">{m.position}</span>
              <span className="flex-1"><b className="block text-[14px] text-navy">{m.est_moi ? 'Vous' : `Agent de ${m.ville_actuelle}`}</b><small className="sub">{m.grade} · {m.type_service ?? '—'}{!m.est_moi && m.anciennete_poste_mois ? ` · ${Math.floor(m.anciennete_poste_mois / 12)} ans dans le poste` : ''} · {m.ville_actuelle} → <b className="text-[#16804F]">{m.ville_cible}</b></small></span>
              <span className={`pill ${m.reponse === 'accepte' ? 'bg-[#DFF7EB] text-[#16804F]' : m.reponse === 'refuse' ? 'bg-[#FFE6E8] text-[#C8323B]' : 'bg-paper text-[#6F7789]'}`}>{m.reponse === 'accepte' ? 'Accepté' : m.reponse === 'refuse' ? 'Refusé' : m.est_moi ? 'À vous de répondre' : 'En attente'}</span>
            </div>))}</div>
          {agents && <div className="mt-4 rounded-2xl p-4 bg-gradient-to-b from-[#DFF7EB] to-white border border-[#CDEFDC]"><b className="text-[#16804F]">Cycle confirmé, identités visibles</b>{agents.map(a => <div key={a.position} className="py-3 border-t border-[#CDEFDC] first:border-t-0"><b className="block text-[15px] text-navy">Agent {a.position} · {a.prenom} {a.nom}</b><div className="flex flex-wrap gap-2 mt-1.5 text-[13.5px]">{a.telephone && <a href={`tel:${a.telephone}`} className="bg-white border border-[#CDEFDC] rounded-xl px-3 py-1.5 font-semibold text-navy">📞 {a.telephone.replace(/(\d{2})(?=\d)/g, '$1 ')}</a>}{a.email && <a href={`mailto:${a.email}`} className="bg-white border border-[#CDEFDC] rounded-xl px-3 py-1.5 font-semibold text-navy">✉️ {a.email}</a>}{!a.telephone && !a.email && <span className="text-[#6F7789]">Contact non renseigné par cet agent.</span>}</div></div>)}
              <p className="text-[12px] text-[#3B4457] mt-3">Contactez-vous, mettez-vous d&apos;accord, puis chacun dépose sa demande de mutation en mentionnant l&apos;autre. La permutation n&apos;est pas un droit : l&apos;administration décide.</p></div>}
        </div>
      </div>
      <aside className="flex flex-col gap-3.5">
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4">
          <b className="text-[14px] text-navy">Compatibilité</b>
          {Object.entries(c.detail ?? {}).map(([k, v]) => <div key={k} className="kv"><span className="capitalize">{k}</span><b>{String(v)}</b></div>)}
          <div className="mt-3">
            {agents ? null : tous ? <button className="btn bg-mint" onClick={() => act('reveler')}>Voir les identités</button>
              : moi?.reponse === 'attente' ? <><p className="text-[12.5px] text-[#6F7789] mb-2">Accepter ne vous engage pas : les identités ne seront révélées que si tous acceptent.</p><button className="btn" onClick={() => act('accepter')}>J&apos;accepte la mise en relation</button><button className="btn-ghost mt-2" onClick={() => act('ignorer')}>Non merci, ignorer</button></>
              : <p className="sub">Vous avez accepté. En attente des autres agents ; vous serez prévenu par mail.</p>}
            {msg && <p className="sub mt-2">{msg}</p>}
          </div>
        </div>
        <div className="bg-[#FFF3D6]/60 rounded-2xl px-4 py-3 text-[12.5px] text-[#3B4457] border-l-[3px] border-amber"><b className="text-[#9A6A00]">Rappel.</b> La permutation n&apos;est pas un droit. Chaque agent dépose ensuite une demande de mutation classique en mentionnant les autres. L&apos;app prépare les courriers.</div>
      </aside>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
