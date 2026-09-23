'use client';
import { useEffect, useState } from 'react';
import AnnonceCard from '@/components/AnnonceCard';
import Paywall from '@/components/Paywall';

export default function Favoris() {
  const [d, setD] = useState<any>(null); const [pay, setPay] = useState(false);
  const charger = () => fetch('/api/favoris').then(x => x.json()).then(setD);
  useEffect(() => { charger(); }, []);
  const favori = async (id: string) => { await fetch('/api/favoris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) }); charger(); };
  return (
    <div className="max-w-[860px]">
      <h1 className="text-[22px] font-extrabold tracking-tight text-navy mb-3.5">Annonces sauvegardées</h1>
      <div className="flex flex-col gap-3">
        {(d?.annonces ?? []).map((a: any) => <AnnonceCard key={a.id} a={{ ...a, flou: false }} onPaywall={() => setPay(true)} onFavori={favori} />)}
        {d && !d.annonces?.length && <div className="card"><b className="text-navy">Aucune annonce sauvegardée</b><div className="sub mt-1">Le cœur sur une annonce la garde ici.</div></div>}
      </div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
