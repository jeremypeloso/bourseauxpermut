'use client';
import { useEffect, useState } from 'react';

/** Compte à rebours jusqu'à l'ouverture. Rendu identique serveur/client au premier affichage (évite le décalage d'hydratation). */
export default function Compteur({ date, dark = true }: { date: string; dark?: boolean }) {
  const cible = new Date(date).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, cible - (now ?? cible));
  const j = Math.floor(diff / 86400e3), h = Math.floor(diff / 3600e3) % 24, m = Math.floor(diff / 60e3) % 60, s = Math.floor(diff / 1e3) % 60;
  const box = dark ? 'bg-white/10 border border-white/15 text-white' : 'bg-white border border-[#E6E9F0] text-navy';
  const lab = dark ? 'text-white/55' : 'text-[#6F7789]';
  return (
    <div className="flex gap-2">
      {[[j, 'jours'], [h, 'heures'], [m, 'min'], [s, 'sec']].map(([v, l]) => (
        <div key={l as string} className={`rounded-xl px-3 py-2 min-w-[62px] text-center ${box}`}>
          <b className="block text-[24px] font-extrabold tracking-tight leading-none tabular-nums">{now === null ? '–' : String(v).padStart(2, '0')}</b>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${lab}`}>{l}</span>
        </div>
      ))}
    </div>
  );
}
