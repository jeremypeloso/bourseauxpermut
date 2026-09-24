'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AnnonceCard, { titre } from '@/components/AnnonceCard';
import Paywall from '@/components/Paywall';

export default function Detail() {
  const { id } = useParams<{ id: string }>(); const r = useRouter();
  const [d, setD] = useState<any>(null);
  const [pay, setPay] = useState(false);
  const [fav, setFav] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { fetch(`/api/annonces/${id}`).then(x => x.json()).then(j => { setD(j); setFav(!!j.favori); }); }, [id]);
  const a = d?.annonce;
  const favori = async () => { const j = await fetch('/api/favoris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) }).then(x => x.json()); setFav(j.favori); };
  const proposer = async () => {
    const res = await fetch('/api/annonces/repondre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) });
    if (res.status === 402) return setPay(true);
    const j = await res.json(); if (j.ok) r.push(`/matchs/${j.correspondance_id}`); else setMsg(j.message ?? j.error);
  };
  if (!d) return <div className="card"><div className="sub">Chargement…</div></div>;
  if (!d.ok) return <div className="card"><b className="text-navy">Annonce introuvable</b><div className="sub mt-1">Elle a peut-être été retirée ou a abouti.</div><Link href="/annonces" className="btn mt-3 !w-auto">Retour aux annonces</Link></div>;
  const Kv = ({ k, v }: { k: string; v: any }) => <div className="kv"><span>{k}</span><b>{v ?? '—'}</b></div>;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div>
        <div className="text-[13px] text-[#6F7789] mb-3"><Link href="/annonces" className="text-bleu font-semibold">Annonces</Link> › {a.institution} › {a.departement ? `Département ${a.departement}` : ''}</div>
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5 md:p-6">
          <div className="flex gap-1.5 flex-wrap">{a.mise_en_avant && <span className="pill-amber">Mise en avant</span>}{!a.flou && a.score >= 70 && !a.mienne && <span className="pill-mint">Compatible {a.score} % avec vos souhaits</span>}{a.deux_fois && <span className="pill bg-paper text-[#6F7789]">Vérifié deux fois</span>}</div>
          <h1 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-navy mt-2">{titre(a)}</h1>
          <div className="text-[13px] text-[#6F7789] mt-1">Publiée {new Date(a.created_at).toLocaleDateString('fr-FR')} · agent vérifié</div>
          {a.flou ? (
            <div className="mt-5 bg-paper rounded-2xl p-5 text-center"><b className="text-navy">Le détail de cette annonce est réservé au Premium</b><div className="sub mt-1">Gratuit : les 3 annonces les plus pertinentes en clair. Premium : toutes, et réponse illimitée.</div><button className="btn mt-3 !w-auto" onClick={() => setPay(true)}>Passer en Premium · 9,99 €/mois</button></div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2.5 mt-4">
                <span className="flex items-center gap-2 bg-paper rounded-xl px-3.5 py-2.5 font-bold text-[14px] text-navy"><i className="w-2.5 h-2.5 rounded-full bg-navy" />{a.ville}</span><span className="text-[#A3AAB8] text-lg">→</span>
                {(a.cibles ?? []).map((c: any, i: number) => <span key={i} className="flex items-center gap-2 bg-paper rounded-xl px-3.5 py-2.5 font-bold text-[14px] text-navy"><i className="w-2.5 h-2.5 rounded-full bg-mint" />{c.ville ?? c.departement}</span>)}
              </div>
              <div className="mt-4">
                <Kv k="Corps · grade" v={`${a.corps ?? ''} · ${a.grade ?? ''}`} /><Kv k="Type de service" v={a.type_service} /><Kv k="Ancienneté dans le poste" v={a.anciennete_poste_mois != null ? `${Math.floor(a.anciennete_poste_mois / 12)} ans` : null} /><Kv k="Départ possible dès" v={a.depart_des ? new Date(a.depart_des).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null} /><Kv k="Accepte les cycles à 3 ou 4" v={a.accepte_cycles ? 'Oui' : 'Non'} />
              </div>
            </>
          )}
          <div className="mt-4 bg-paper rounded-xl px-4 py-3 text-[12.5px] text-[#3B4457]">🔒 Aucun nom, aucun texte libre : une annonce décrit un poste et des souhaits, jamais une personne. L&apos;identité n&apos;est révélée qu&apos;après accord mutuel.</div>
        </div>
        {d.similaires?.length > 0 && <><h2 className="text-[17px] font-extrabold text-navy mt-6 mb-3">Annonces similaires</h2><div className="flex flex-col gap-3">{d.similaires.map((s: any) => <AnnonceCard key={s.id} a={s} onPaywall={() => setPay(true)} />)}</div></>}
      </div>
      <aside className="lg:sticky lg:top-[84px] flex flex-col gap-3.5">
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4">
          <b className="text-[18px] text-navy tracking-tight">{a.mienne ? 'Votre annonce' : 'Proposer une permutation'}</b>
          {a.mienne ? (
            <><div className="sub mt-1">Visible par les agents vérifiés de votre institution.</div><Link href="/deposer" className="btn mt-3">Modifier ou mettre en avant</Link></>
          ) : a.demo ? (
            <><div className="sub mt-1">Annonce d&apos;exemple : elle montre le format en attendant les premières vraies annonces. Déposez la vôtre, le matching fera le reste.</div><Link href="/deposer" className="btn mt-3">Déposer mon annonce</Link></>
          ) : (
            <><div className="sub mt-1">Une proposition ouvre une mise en relation. L&apos;identité est révélée quand les deux ont accepté.</div><button className="btn mt-3" onClick={proposer}>Proposer une permutation</button><button className="btn-ghost mt-2" onClick={favori}>{fav ? '♥ Sauvegardée' : '♡ Sauvegarder'}</button></>
          )}
          {msg && <p className="sub mt-2">{msg}</p>}
        </div>
        {!a.mienne && !a.flou && a.score >= 70 && <Link href="/matchs" className="block rounded-2xl p-4 text-white bg-gradient-to-br from-navy2 to-navy"><b className="block text-[14px]">Compatible avec vos souhaits</b><span className="text-[12px] text-[#A9B7D6]">Le matching automatique peut aussi la placer dans un cycle à 3 ou 4.</span><span className="block text-[13px] font-bold mt-3 bg-white text-navy rounded-xl px-3 py-2.5 text-center">Voir mes matchs</span></Link>}
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4"><b className="text-[13px] text-navy">Signaler</b><div className="sub mt-1">Annonce identifiante ou hors sujet ? <a href="mailto:contact@labourseauxpermut.fr" className="text-bleu font-semibold">Écrivez-nous</a>, elle sera retirée sous 24 h.</div></div>
      </aside>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
