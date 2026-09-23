#!/usr/bin/env bash
set -e
mkdir -p "app/(app)/annonces"
cat > "app/(app)/annonces/page.tsx" << 'HB_EOF'
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Paywall from '@/components/Paywall';

type A = any;
type Data = { ok?: boolean; error?: string; message?: string; annonces?: A[]; total?: number; en_clair?: number; premium?: boolean; verifie?: boolean };

export default function Annonces() {
  const r = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [dep, setDep] = useState('');
  const [pay, setPay] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const charger = async (d = dep) => {
    try {
      const res = await fetch(`/api/annonces${d ? `?departement=${encodeURIComponent(d)}` : ''}`);
      const j = await res.json();
      setData({ annonces: [], total: 0, en_clair: 0, premium: false, verifie: false, ...j });
    } catch (e: any) { setData({ ok: false, error: e.message, annonces: [] }); }
  };
  useEffect(() => { charger(''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const annonces: A[] = data?.annonces ?? [];
  const mienne = annonces.find(a => a.mienne);
  const publier = async () => { setBusy(true); const j = await fetch('/api/annonces', { method: 'POST' }).then(x => x.json()); setBusy(false); setMsg(j.ok ? 'Annonce publiée à partir de votre profil et de vos souhaits.' : j.message ?? j.error); charger(); };
  const retirer = async () => { await fetch('/api/annonces', { method: 'DELETE' }); setMsg('Annonce retirée.'); charger(); };
  const booster = async () => { const j = await fetch('/api/stripe/boost', { method: 'POST' }).then(x => x.json()); if (j.url) location.href = j.url; else setMsg(j.message ?? j.error); };
  const repondre = async (id: string) => {
    const res = await fetch('/api/annonces/repondre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) });
    if (res.status === 402) return setPay(true);
    const j = await res.json(); if (j.ok) r.push(`/permut/${j.correspondance_id}`); else setMsg(j.message ?? j.error);
  };
  const total = data?.total ?? 0, enClair = data?.en_clair ?? 0;

  return (
    <>
      <div className="flex gap-1.5 mb-3 bg-white rounded-2xl p-1 lg:max-w-sm">
        <Link href="/permut" className="flex-1 text-center py-2 rounded-xl text-[13px] font-bold text-[#6F7789]">Correspondances</Link>
        <span className="flex-1 text-center py-2 rounded-xl text-[13px] font-bold bg-navy text-white">Annonces</span>
      </div>
      <div className="flex justify-between items-end mb-3"><h1 className="h1">Annonces</h1>{data?.ok && <span className="sub">{total} active{total > 1 ? 's' : ''}</span>}</div>

      {!data && <div className="card"><div className="sub">Chargement…</div></div>}

      {data && !data.ok && (
        <div className="card border border-[#FFD3D6]"><b className="text-[#C8323B]">Impossible de charger les annonces</b><div className="sub mt-1">{data.error ?? data.message ?? 'Erreur inconnue'}</div>
          {(data.error ?? '').includes('profil') && <a href="/onboarding" className="btn mt-3">Créer mon profil</a>}
        </div>
      )}

      {data?.ok && !data.verifie && <div className="card"><b className="text-navy">Compte à vérifier</b><div className="sub mt-1">Les annonces sont réservées aux agents vérifiés (carte pro ou mail pro).</div><a href="/onboarding" className="btn mt-3">Vérifier mon compte</a></div>}

      {data?.ok && data.verifie && (
        <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-4 lg:items-start">
          <div className="card mb-3">
            {mienne ? (
              <>
                <div className="flex justify-between items-center"><b className="text-[14px] text-navy">Mon annonce</b>{mienne.mise_en_avant ? <span className="pill-mint">Mise en avant</span> : <span className="pill-bleu">En ligne</span>}</div>
                <div className="sub mt-1">{mienne.grade} · {mienne.ville} → {(mienne.cibles_villes ?? []).join(', ')}</div>
                <div className="flex gap-2 mt-3">{!mienne.mise_en_avant && <button className="btn !py-2.5" onClick={booster}>Mettre en avant · 4,99 € / 7 j</button>}<button className="btn-ghost !py-2.5" onClick={retirer}>Retirer</button></div>
              </>
            ) : (
              <>
                <b className="text-[14px] text-navy">Publier mon annonce</b>
                <div className="sub mt-1">Anonyme : grade, affectation, type de service, ancienneté et villes souhaitées, repris de votre profil. Aucun nom, aucun texte libre. Gratuit.</div>
                <button className="btn mt-3" onClick={publier} disabled={busy}>{busy ? 'Publication…' : 'Publier à partir de mon profil'}</button>
              </>
            )}
            {msg && <p className="sub mt-2">{msg}</p>}
          </div>
          <div className="flex gap-2 mb-3 lg:w-80">
            <input className="field !py-2.5" placeholder="Département (06, 31, 974…)" value={dep} onChange={e => setDep(e.target.value)} />
            <button className="btn-ghost !w-auto !py-2.5 px-4" onClick={() => charger()}>OK</button>
          </div>
        </div>
      )}

      {data?.ok && data.verifie && !data.premium && total > enClair && (
        <div className="bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#3B4457] border-l-[3px] border-bleu mb-3"><b className="text-bleud">{total - enClair} autre{total - enClair > 1 ? 's' : ''} annonce{total - enClair > 1 ? 's' : ''}</b> correspondent à vos souhaits. Les 3 plus pertinentes sont en clair, le reste est réservé au Premium.</div>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-4">
      {annonces.map(a => a.flou ? (
        <button key={a.id} onClick={() => setPay(true)} className="card w-full text-left mb-3 lg:mb-0 relative overflow-hidden">
          <div className="flex justify-between items-center"><b className="text-[14px] text-navy">{a.grade} · {a.ville} → {(a.cibles_villes ?? []).join(', ')}</b>{a.mise_en_avant && <span className="pill-amber">Mise en avant</span>}</div>
          <div className="mt-2 space-y-2 select-none" aria-hidden><div className="h-3 rounded bg-[#E6E9F0] w-4/5 blur-[3px]" /><div className="h-3 rounded bg-[#E6E9F0] w-3/5 blur-[3px]" /><div className="h-8 rounded-xl bg-[#E6E9F0] w-2/5 blur-[3px] mt-3" /></div>
          <span className="absolute right-3 bottom-3 pill-bleu">🔒 Premium</span>
        </button>
      ) : (
        <div key={a.id} className={`card mb-3 lg:mb-0 ${a.mise_en_avant ? 'border border-[#F2A900]' : ''}`}>
          <div className="flex justify-between items-center"><b className="text-[15px] text-navy">{a.grade} · {a.ville}</b>{a.mienne ? <span className="pill-mint">Vous</span> : a.mise_en_avant ? <span className="pill-amber">Mise en avant</span> : null}</div>
          <div className="sub mt-1">{a.corps} · {a.type_service ?? 'service non précisé'} · {Math.floor((a.anciennete_poste_mois ?? 0) / 12)} ans dans le poste{a.depart_des ? ` · départ dès ${new Date(a.depart_des).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` : ''}</div>
          <div className="flex flex-wrap gap-1.5 mt-3">{(a.cibles ?? []).map((c: any, i: number) => <span key={i} className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold bg-[#DFF7EB] text-[#16804F]">→ {c.ville ?? c.departement}</span>)}</div>
          {!a.mienne && <button className="btn mt-3 !py-3" onClick={() => repondre(a.id)}>Proposer une permutation</button>}
        </div>
      ))}
      </div>
      {data?.ok && data.verifie && annonces.length === 0 && <div className="card"><b className="text-navy">Aucune annonce pour l&apos;instant</b><div className="sub mt-1">Publiez la vôtre : c&apos;est gratuit, anonyme, et c&apos;est ce qui fait venir les autres.</div></div>}
      <div className="mt-3 flex items-center gap-2.5 bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#6F7789]">🔒 Une annonce montre un poste et des souhaits, jamais une personne. Réponse = même flux que le matching : acceptation, puis révélation.</div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </>
  );
}
HB_EOF
echo "Page annonces corrigée."