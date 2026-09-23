'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const I = {
  ann: 'M4 5h16v14H4zM8 9h8M8 13h5', match: 'M4 7h11l-3-3M20 17H9l3 3M4 17a2 2 0 1 0 0 .1M20 7a2 2 0 1 0 0 .1',
  fav: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', plus: 'M12 5v14M5 12h14',
};
const Ico = ({ d, cls = 'w-[22px] h-[22px]' }: { d: string; cls?: string }) => <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

export default function TopBar({ nbMatchs, institution }: { nbMatchs: number; institution?: string | null }) {
  const path = usePathname(); const r = useRouter();
  const [q, setQ] = useState('');
  const on = (h: string) => path === h || path.startsWith(h + '/');
  const NavA = ({ h, t, d, badge }: { h: string; t: string; d: string; badge?: number }) => (
    <Link href={h} className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold ${on(h) ? 'text-bleu' : 'text-[#6F7789] hover:bg-paper'}`}>
      {!!badge && <i className="absolute top-0 right-1 w-4 h-4 rounded-full bg-coral text-white text-[10px] font-extrabold not-italic flex items-center justify-center">{badge}</i>}<Ico d={d} />{t}
    </Link>
  );
  const chips = [['/annonces', 'Toutes'], ['/annonces?inst=PN', 'Police nationale'], ['/annonces?inst=GN', 'Gendarmerie'], ['/annonces?inst=AP', 'Pénitentiaire'], ['/annonces?vers=moi', 'Vers mon département'], ['/annonces?depuis=cible', 'Depuis ma ville cible'], ['/annonces?om=1', 'Outre-mer · CIMM'], ['/annonces?boost=1', 'Mises en avant']];
  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#E6E9F0]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-5 h-[60px] md:h-[68px] flex items-center gap-3 md:gap-4">
          <Link href="/annonces" className="shrink-0"><img src="/logo.png" alt="La Bourse aux permut'" className="h-7 md:h-[34px] w-auto" /></Link>
          <Link href="/deposer" className="shrink-0 inline-flex items-center gap-2 bg-bleu text-white font-bold text-[14px] px-3 md:px-4 py-2.5 rounded-xl"><Ico d={I.plus} cls="w-4 h-4" /><span className="hidden md:inline">Déposer une annonce</span></Link>
          <form onSubmit={e => { e.preventDefault(); r.push(`/annonces?q=${encodeURIComponent(q)}`); }} className="flex-1 flex items-center gap-2 bg-paper border border-[#E6E9F0] rounded-2xl pl-3.5 pr-1.5 h-10 md:h-[46px] max-w-[620px]">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Une ville, un département, un service…" className="flex-1 bg-transparent outline-none text-[14px] min-w-0" />
            <button className="bg-navy text-white rounded-xl w-8 h-8 md:w-9 md:h-9 flex items-center justify-center" aria-label="Rechercher"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg></button>
          </form>
          <nav className="hidden md:flex gap-1 ml-auto">
            <NavA h="/annonces" t="Annonces" d={I.ann} /><NavA h="/matchs" t="Mes matchs" d={I.match} badge={nbMatchs} /><NavA h="/favoris" t="Favoris" d={I.fav} /><NavA h="/compte" t="Compte" d={I.user} />
          </nav>
        </div>
        <div className="border-t border-[#E6E9F0] bg-white"><div className="max-w-[1200px] mx-auto px-4 md:px-5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] py-2.5">
          {chips.filter(([h]) => !h.includes('inst=') || !institution || h.endsWith(institution)).map(([h, t]) => <Link key={h} href={h} className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold border ${h === '/annonces' && path === '/annonces' ? 'bg-navy text-white border-navy' : 'bg-white text-[#3B4457] border-[#E6E9F0]'}`}>{t}</Link>)}
        </div></div>
      </header>
      <nav className="md:hidden fixed left-0 right-0 bottom-0 z-30 bg-white border-t border-[#E6E9F0] flex justify-around px-1.5 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
        {[['/annonces', 'Annonces', I.ann], ['/matchs', 'Matchs', I.match], ['/deposer', 'Déposer', I.plus], ['/favoris', 'Favoris', I.fav], ['/compte', 'Compte', I.user]].map(([h, t, d]) => <Link key={h} href={h} className={`flex flex-col items-center gap-0.5 w-16 text-[10.5px] font-semibold ${on(h) ? 'text-bleu' : 'text-[#A3AAB8]'}`}><Ico d={d} />{t}</Link>)}
      </nav>
    </>
  );
}
