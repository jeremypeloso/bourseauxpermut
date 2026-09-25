'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AnnonceCard from '@/components/AnnonceCard';
import Paywall from '@/components/Paywall';
import { useDialog } from '@/components/Dialog';

function Filtres({ onChange }: { onChange: (k: string, v: string) => void }) {
  const sp = useSearchParams();
  const Panel = ({ t, children }: { t: string; children: React.ReactNode }) => <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4"><h4 className="text-[13px] font-extrabold text-navy mb-2">{t}</h4>{children}</div>;
  return (
    <>
      <Panel t="Poste actuel">
        <label className="block text-[12px] text-[#6F7789]">Département<input className="field mt-1 !py-2" defaultValue={sp.get('departement') ?? ''} placeholder="06, 31, 974…" onBlur={e => onChange('departement', e.target.value)} /></label>
      </Panel>
      <Panel t="Recherche">
        <label className="block text-[12px] text-[#6F7789]">Ville, service, grade…<input className="field mt-1 !py-2" defaultValue={sp.get('q') ?? ''} placeholder="Toulouse, BAC, GPX…" onBlur={e => onChange('q', e.target.value)} /></label>
      </Panel>
      <Panel t="Afficher">
        {[['vers', 'moi', 'Qui veulent venir dans mon département'], ['depuis', 'cible', 'Qui partent de là où je veux aller'], ['boost', '1', 'Mises en avant seulement'], ['om', '1', 'Outre-mer · CIMM']].map(([k, v, t]) => (
          <label key={k} className="flex items-center gap-2 text-[13px] text-[#3B4457] py-1"><input type="checkbox" className="w-4 h-4 accent-bleu" defaultChecked={sp.get(k) === v} onChange={e => onChange(k, e.target.checked ? v : '')} />{t}</label>
        ))}
      </Panel>
    </>
  );
}

function Liste() {
  const sp = useSearchParams(); const r = useRouter();
  const [data, setData] = useState<any>(null);
  const [pay, setPay] = useState(false);
  const [filtres, setFiltres] = useState(false);
  const { notifier } = useDialog();

  useEffect(() => { fetch(`/api/annonces?${sp.toString()}`).then(x => x.json()).then(j => setData({ annonces: [], total: 0, en_clair: 0, ...j })).catch(e => setData({ ok: false, error: e.message, annonces: [] })); }, [sp]);
  const setParam = (k: string, v: string) => { const n = new URLSearchParams(sp.toString()); v ? n.set(k, v) : n.delete(k); r.push(`/annonces?${n.toString()}`); };
  const favori = async (id: string) => { const j = await fetch('/api/favoris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) }).then(x => x.json()); notifier(j.favori ? 'Annonce sauvegardée' : 'Retirée des favoris'); };
  const proposer = async (id: string) => {
    const res = await fetch('/api/annonces/repondre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) });
    if (res.status === 402) return setPay(true);
    const j = await res.json(); if (j.ok) r.push(`/matchs/${j.correspondance_id}`); else notifier(j.message ?? j.error, 'erreur');
  };
  const annonces: any[] = data?.annonces ?? []; const total = data?.total ?? 0; const enClair = data?.en_clair ?? 0;
  const nbMatchs = 0;

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <aside className={`lg:sticky lg:top-[84px] lg:self-start flex-col gap-3.5 ${filtres ? 'flex' : 'hidden lg:flex'}`}>
        <Link href="/matchs" className="block rounded-2xl p-4 text-white bg-gradient-to-br from-navy2 to-navy"><b className="block text-[14px]">Matching intelligent</b><span className="text-[12px] text-[#A9B7D6]">Vos souhaits sont recroisés toutes les heures avec ceux des autres agents.</span><span className="block text-[13px] font-bold mt-3 bg-white text-navy rounded-xl px-3 py-2.5 text-center">Voir mes matchs</span></Link>
        <Filtres onChange={setParam} />
      </aside>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <div><h1 className="text-[22px] font-extrabold tracking-tight text-navy">La Bourse aux permut&apos;</h1><div className="text-[13px] text-[#6F7789]">{data?.ok ? `${total} annonce${total > 1 ? 's' : ''} · triées par pertinence pour vous` : ' '}</div></div>
          <button className="lg:hidden inline-flex items-center gap-1.5 border border-[#E6E9F0] bg-white rounded-xl px-3 py-2 text-[13px] font-semibold" onClick={() => setFiltres(!filtres)}>⚲ Filtres</button>
        </div>

        {!data && <div className="card"><div className="sub">Chargement…</div></div>}
        {data && !data.ok && <div className="card border border-[#FFD3D6]"><b className="text-[#C8323B]">Impossible de charger les annonces</b><div className="sub mt-1">{data.error}</div>{String(data.error ?? '').includes('profil') && <Link href="/onboarding" className="btn mt-3">Créer mon profil</Link>}</div>}
        {data?.ok && !data.verifie && <div className="card"><b className="text-navy">Compte à vérifier</b><div className="sub mt-1">Les annonces sont réservées aux agents vérifiés (carte pro ou mail pro).</div><Link href="/onboarding" className="btn mt-3">Vérifier mon compte</Link></div>}

        {data?.ok && data.verifie && (data.exemples ?? 0) > 0 && <div className="bg-white border border-[#E6E9F0] rounded-2xl px-4 py-3 text-[12.5px] text-[#6F7789] mb-3">Les annonces marquées <b className="text-navy">Exemple</b> montrent le format en attendant les premières vraies. Elles disparaissent une à une à chaque nouvelle annonce déposée par un collègue vérifié.</div>}
        <div className="flex flex-col gap-3">
          {annonces.map(a => <AnnonceCard key={a.id} a={a} onPaywall={() => setPay(true)} onFavori={favori} onProposer={proposer} />)}
          {data?.ok && data.verifie && !data.premium && total > enClair && (
            <div className="bg-white border-[1.5px] border-dashed border-bleu rounded-2xl p-4 flex flex-wrap items-center gap-4"><div><b className="text-navy">{total - enClair} autre{total - enClair > 1 ? 's' : ''} annonce{total - enClair > 1 ? 's' : ''} correspondent à vos souhaits.</b><br /><span className="text-[13px] text-[#6F7789]">Les {enClair} plus pertinentes sont en clair. Passez en Premium pour tout voir et répondre sans limite.</span></div><button className="btn !w-auto ml-auto" onClick={() => setPay(true)}>Passer en Premium · 9,99 €/mois</button></div>
          )}
          {data?.ok && data.verifie && annonces.length === 0 && <div className="card"><b className="text-navy">Aucune annonce pour ces critères</b><div className="sub mt-1">Élargissez les filtres, ou <Link href="/deposer" className="text-bleu font-semibold">déposez la vôtre</Link> : c&apos;est gratuit et anonyme.</div></div>}
        </div>
      </div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
export default function Page() { return <Suspense><Liste /></Suspense>; }
