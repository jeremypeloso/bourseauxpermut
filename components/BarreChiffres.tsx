'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import CompteurLive from './CompteurLive';

const SEUIL = 100; // la barre n'apparaît qu'à partir de 100 agents vérifiés en recherche

/** Bandeau des chiffres sous le hero : masqué tant que la base n'est pas assez alimentée pour être parlante. */
export default function BarreChiffres({ prelaunch, offre, ouverture }: { prelaunch: boolean; offre: boolean; ouverture: string }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => { supabaseBrowser().from('stats_publiques').select('valeur').eq('cle', 'en_recherche').single().then(({ data }) => setN(data?.valeur ?? 0)); }, []);
  if (n === null || n < SEUIL) return null;
  const items: [React.ReactNode, string][] = [
    prelaunch ? [new Date(ouverture).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), 'ouverture, à 8 h'] : [<CompteurLive key="c" cle="en_recherche" initial={n} />, 'collègues en recherche en ce moment'],
    [<CompteurLive key="a" cle="annonces_actives" initial={0} />, 'annonces actives'],
    [<CompteurLive key="f" cle="cycles_fermes" initial={0} />, 'permutations abouties'],
    offre ? [<span key="o"><CompteurLive cle="premium_offerts" initial={0} /><span className="text-[18px]"> / 100</span></span>, 'places Premium offertes déjà prises'] : ['0', "nom visible avant l'accord de tous"],
  ];
  return (
    <div className="bg-navy text-white"><div className="max-w-[1140px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-y-3 py-5">
      {items.map(([v, t], i) => <div key={i} className="md:border-l md:border-white/10 md:pl-5 first:border-0 first:pl-0"><b className="block text-[30px] font-extrabold tracking-[-1px] text-[#8FF0C0] leading-none">{v}</b><span className="text-[12.5px] text-[#A9B7D6]">{t}</span></div>)}
    </div></div>
  );
}
