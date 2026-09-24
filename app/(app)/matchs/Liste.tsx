'use client';
import { useState } from 'react';
import Link from 'next/link';
import Paywall from '@/components/Paywall';

export function Anneau({ p }: { p: number }) {
  const c = p >= 80 ? '#22B573' : '#F2A900';
  return <div className="relative w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: `conic-gradient(${c} ${p}%, #E6E9F0 0)` }}><span className="absolute inset-1 rounded-full bg-white" /><span className="relative text-center leading-none"><b className="block text-[13px] text-navy">{p} %</b><small className="text-[8.5px] text-[#6F7789] uppercase tracking-wide">compat.</small></span></div>;
}

/** État lisible d'une correspondance pour l'agent connecté. */
export function etat(c: any) {
  const moi = c.membres.find((m: any) => m.est_moi);
  if (c.statut === 'confirmee') return { t: 'Confirmée · identités visibles', cls: 'bg-[#DFF7EB] text-[#16804F]', urgent: false };
  if (c.statut === 'refusee') return { t: 'Refusée par un agent', cls: 'bg-[#FFE6E8] text-[#C8323B]', urgent: false };
  if (moi?.reponse === 'attente') return { t: 'À vous de répondre', cls: 'bg-bleu text-white', urgent: true };
  if (moi?.reponse === 'refuse') return { t: 'Vous avez décliné', cls: 'bg-paper text-[#6F7789]', urgent: false };
  const restants = c.membres.filter((m: any) => m.reponse === 'attente').length;
  return { t: `Vous avez accepté · en attente de ${restants} agent${restants > 1 ? 's' : ''}`, cls: 'bg-[#FFF3D6] text-[#9A6A00]', urgent: false };
}

export default function ListeMatchs({ corrs, premium, verifie }: { corrs: any[]; premium: boolean; verifie: boolean }) {
  const [pay, setPay] = useState(false); const [voirCloses, setVoirCloses] = useState(false);
  const actives = corrs.filter(c => c.statut !== 'refusee'); const closes = corrs.filter(c => c.statut === 'refusee');
  const Carte = ({ c, idx }: { c: any; idx: number }) => {
    const e = etat(c); const moi = c.membres.find((m: any) => m.est_moi);
    const n = c.membres.length;
    const inner = (
      <div className={`bg-white border rounded-2xl p-5 h-full flex flex-col ${e.urgent ? 'border-bleu shadow-[0_12px_30px_-18px_rgba(30,107,255,.5)]' : 'border-[#E6E9F0]'}`}>
        <div className="flex items-start justify-between gap-3">
          <div><span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${e.cls}`}>{e.t}</span><h3 className="text-[17px] font-extrabold text-navy mt-2">{n === 2 ? 'Échange direct' : `Cycle à ${n} agents`}{moi ? ` · vous allez à ${moi.ville_cible}` : ''}</h3><p className="text-[12.5px] text-[#6F7789]">{c.detail?.souhaits === 'proposition manuelle' ? 'Créé à partir d\'une annonce' : 'Trouvé par le matching automatique'}</p></div>
          <Anneau p={c.score} />
        </div>
        <ol className="mt-4 space-y-2">
          {c.membres.map((m: any, i: number) => (
            <li key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${m.est_moi ? 'bg-[#E6EEFF]' : 'bg-paper'}`}>
              <span className={`w-8 h-8 rounded-lg text-white text-[12px] font-extrabold flex items-center justify-center shrink-0 ${m.est_moi ? 'bg-bleu' : 'bg-navy'}`}>{m.position}</span>
              <span className="flex-1 min-w-0 text-[13px]"><b className="text-navy">{m.est_moi ? 'Vous' : `Agent de ${m.ville_actuelle}`}</b><span className="text-[#6F7789]"> · {m.grade}{m.type_service ? ` · ${m.type_service}` : ''}{!m.est_moi && m.anciennete_poste_mois ? ` · ${Math.floor(m.anciennete_poste_mois / 12)} ans` : ''}</span><span className="block text-[12.5px] text-[#3B4457]">{m.ville_actuelle} <span className="text-[#A3AAB8]">→</span> <b className="text-[#16804F]">{m.ville_cible}</b></span></span>
              <span className={`text-[10.5px] font-bold px-2 py-1 rounded-full shrink-0 ${m.reponse === 'accepte' ? 'bg-[#DFF7EB] text-[#16804F]' : m.reponse === 'refuse' ? 'bg-[#FFE6E8] text-[#C8323B]' : 'bg-white border border-[#E6E9F0] text-[#6F7789]'}`}>{m.reponse === 'accepte' ? 'Accepté' : m.reponse === 'refuse' ? 'Refusé' : 'En attente'}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-1.5 mt-3 text-[11px] font-semibold">
          <span className="rounded-full px-2 py-1 bg-[#DFF7EB] text-[#16804F]">Même grade</span>
          {c.detail?.service && <span className={`rounded-full px-2 py-1 ${String(c.detail.service).includes('↔') ? 'bg-[#FFF3D6] text-[#9A6A00]' : 'bg-[#DFF7EB] text-[#16804F]'}`}>{String(c.detail.service).includes('↔') ? `Services différents (${c.detail.service})` : c.detail.service}</span>}
          {c.detail?.depart && <span className="rounded-full px-2 py-1 bg-[#FFF3D6] text-[#9A6A00]">{c.detail.depart}</span>}
        </div>
        <span className={`block text-center mt-4 rounded-xl py-3 text-[14px] font-bold ${e.urgent ? 'bg-bleu text-white' : c.statut === 'confirmee' ? 'bg-mint text-white' : 'border border-[#E6E9F0] text-navy'}`}>{e.urgent ? 'Voir et répondre' : c.statut === 'confirmee' ? 'Voir les identités' : 'Voir le détail'}</span>
      </div>
    );
    return premium || idx === 0 ? <Link href={`/matchs/${c.id}`}>{inner}</Link> : <button className="text-left" onClick={() => setPay(true)}>{inner}</button>;
  };
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div><h1 className="text-[22px] font-extrabold tracking-tight text-navy">Mes matchs</h1><div className="text-[13px] text-[#6F7789]">{actives.length ? `${actives.length} correspondance${actives.length > 1 ? 's' : ''} en cours. ` : 'Aucune correspondance en cours. '}Le matching recroise vos souhaits toutes les heures ; vous êtes prévenu par mail à chaque étape.</div></div>
        <Link href="/annonces" className="btn-ghost !w-auto !py-2.5 px-4 text-[14px]">Retour aux annonces</Link>
      </div>
      {!verifie && <div className="card mb-4"><b className="text-navy">Compte à vérifier</b><div className="sub mt-1">Le matching ne prend que les agents vérifiés.</div><Link href="/onboarding" className="btn mt-3 !w-auto">Vérifier mon compte</Link></div>}
      {verifie && actives.length === 0 && <div className="card mb-4"><b className="text-navy">Pas encore de correspondance</b><div className="sub mt-1">Plus vos souhaits sont larges (plusieurs villes, cycles acceptés), plus vite ça se ferme. En attendant, <Link href="/annonces" className="text-bleu font-semibold">parcourez les annonces</Link> ou <Link href="/deposer" className="text-bleu font-semibold">publiez la vôtre</Link>.</div></div>}
      <div className="grid md:grid-cols-2 gap-4">{actives.map((c, i) => <Carte key={c.id} c={c} idx={i} />)}</div>
      {closes.length > 0 && (
        <div className="mt-6">
          <button className="text-[13px] font-semibold text-[#6F7789] hover:text-navy" onClick={() => setVoirCloses(!voirCloses)}>{voirCloses ? 'Masquer' : 'Voir'} les correspondances refermées ({closes.length})</button>
          {voirCloses && <div className="grid md:grid-cols-2 gap-4 opacity-70 mt-3">{closes.map((c, i) => <Carte key={c.id} c={c} idx={i + actives.length} />)}</div>}
        </div>
      )}
      <div className="mt-6 bg-white border border-[#E6E9F0] rounded-2xl px-4 py-3 text-[12.5px] text-[#6F7789]">🔒 Les identités ne sont visibles qu&apos;une fois que tous les agents ont accepté. Un refus referme la correspondance pour tout le monde.</div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </>
  );
}
