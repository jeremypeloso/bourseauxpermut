'use client';
import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

/**
 * Compteur public en temps réel, lu dans stats_publiques (jamais dans profils).
 * Animation du chiffre quand il change. Repli sur la valeur initiale si Realtime est indisponible.
 */
export default function CompteurLive({ cle = 'en_recherche', initial = 0, className = '' }: { cle?: string; initial?: number; className?: string }) {
  const [val, setVal] = useState(initial);
  const [affiche, setAffiche] = useState(initial);
  const raf = useRef<number>();

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from('stats_publiques').select('valeur').eq('cle', cle).single().then(({ data }) => { if (data) setVal(data.valeur); });
    const ch = sb.channel(`stats_${cle}_${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stats_publiques', filter: `cle=eq.${cle}` }, (p: any) => setVal(p.new.valeur)).subscribe();
    return () => { try { sb.removeChannel(ch); } catch {} };
  }, [cle]);

  useEffect(() => {
    const from = affiche, to = val, t0 = performance.now(), d = 900;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / d); setAffiche(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val]);

  return <span className={className}>{affiche.toLocaleString('fr-FR')}</span>;
}
