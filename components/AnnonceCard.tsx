'use client';
import Link from 'next/link';
import Vignette from './Vignette';

export type Annonce = any;
const rel = (d: string) => { const h = Math.floor((Date.now() - new Date(d).getTime()) / 36e5); return h < 1 ? "à l'instant" : h < 24 ? `il y a ${h} h` : `il y a ${Math.floor(h / 24)} j`; };
export const titre = (a: Annonce) => `${a.grade ?? 'Agent'} · ${a.ville ?? '?'} → ${(a.cibles_villes ?? []).join(', ') || '?'}`;

export default function AnnonceCard({ a, onPaywall, onFavori, onProposer }: { a: Annonce; onPaywall: () => void; onFavori?: (id: string) => void; onProposer?: (id: string) => void }) {
  const meta = <div className="text-[12.5px] text-[#6F7789] flex gap-1.5 mt-2"><span>{a.departement ? `(${a.departement})` : ''}</span><span>·</span><span>{rel(a.created_at)}</span></div>;
  if (a.flou) return (
    <button onClick={onPaywall} className="w-full text-left grid grid-cols-[96px_1fr] md:grid-cols-[130px_1fr] gap-4 bg-white border border-[#E6E9F0] rounded-2xl p-3.5 relative hover:shadow-[0_10px_28px_-16px_rgba(15,27,51,.3)]">
      <Vignette de={{ lat: a.lat, lng: a.lng, departement: a.departement }} vers={a.cibles_geo ?? []} className="w-[96px] h-[94px] md:w-[130px] md:h-[128px] rounded-xl" />
      <div className="min-w-0"><div className="text-[14.5px] md:text-[16px] font-extrabold text-[#3B4457] tracking-tight pr-20">{titre(a)}{a.demo && <span className="ml-2 pill bg-[#F0F3F8] text-[#6F7789]">Exemple</span>}</div>
        <div className="my-2 space-y-1.5" aria-hidden><i className="block h-2.5 rounded bg-[#E6E9F0] w-3/4 blur-[2px]" /><i className="block h-2.5 rounded bg-[#E6E9F0] w-1/2 blur-[2px]" /></div>{meta}</div>
      <span className="absolute right-3.5 top-3.5 pill-bleu">🔒 Premium</span>
    </button>
  );
  return (
    <Link href={`/annonces/${a.id}`} className="grid grid-cols-[96px_1fr] md:grid-cols-[130px_1fr_auto] gap-4 bg-white border border-[#E6E9F0] rounded-2xl p-3.5 hover:shadow-[0_10px_28px_-16px_rgba(15,27,51,.3)]">
      <Vignette de={{ lat: a.lat, lng: a.lng, departement: a.departement }} vers={a.cibles_geo ?? []} className="w-[96px] h-[94px] md:w-[130px] md:h-[128px] rounded-xl" />
      <div className="min-w-0">
        <div className="flex gap-1.5 flex-wrap">{a.mise_en_avant && <span className="pill-amber">Mise en avant</span>}{a.score >= 70 && !a.mienne && <span className="pill-mint">Compatible {a.score} %</span>}{a.mienne && <span className="pill-bleu">Votre annonce</span>}{a.demo && <span className="pill bg-[#F0F3F8] text-[#6F7789]">Exemple</span>}{a.deux_fois && <span className="pill bg-paper text-[#6F7789]">Vérifié deux fois</span>}</div>
        <div className="text-[14.5px] md:text-[16px] font-extrabold text-navy tracking-tight mt-1">{titre(a)}</div>
        <div className="text-[13.5px] text-[#3B4457]">{[a.type_service, a.anciennete_poste_mois != null && `${Math.floor(a.anciennete_poste_mois / 12)} ans dans le poste`, a.depart_des && `départ dès ${new Date(a.depart_des).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`].filter(Boolean).join(' · ')}</div>
        {meta}
      </div>
      <div className="col-span-2 md:col-span-1 flex md:flex-col justify-end md:justify-start items-end gap-2">
        {!a.mienne && !a.demo && onProposer && <button onClick={e => { e.preventDefault(); onProposer(a.id); }} className="bg-bleu text-white font-bold text-[13px] px-3.5 py-2 rounded-xl">Proposer</button>}
        {!a.mienne && !a.demo && onFavori && <button onClick={e => { e.preventDefault(); onFavori(a.id); }} className="w-9 h-9 rounded-xl border border-[#E6E9F0] bg-white text-[#6F7789]" aria-label="Sauvegarder">♡</button>}
      </div>
    </Link>
  );
}
