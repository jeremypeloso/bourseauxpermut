'use client';
import { useState } from 'react';
import { FRANCE_D, FRANCE_H, projeter } from '@/lib/france-path';

type Pt = { lat: number; lng: number; label?: string; cls: 'me' | 'wish' | 'other' };
type Halo = { lat: number; lng: number; n: number; nom?: string };

/**
 * Carte SVG inline, aucune dépendance.
 * Halos = collègues en recherche par ville (jamais qui), animés en vagues décalées.
 * Cycle = tracés qui se dessinent en boucle. Survol d'une ville = nombre de collègues.
 */
export default function CarteFrance({ points, halos, cycle, anime = true }: { points: Pt[]; halos: Halo[]; cycle?: [number, number][]; anime?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const col = { me: '#1E6BFF', wish: '#22B573', other: '#E8232B' };
  const curve = (a: readonly [number, number], b: readonly [number, number], off: number) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return `M${a[0]} ${a[1]} Q${(mx - dy / L * off).toFixed(1)} ${(my + dx / L * off).toFixed(1)} ${b[0]} ${b[1]}`;
  };
  const cyc = (cycle ?? []).map(([lng, lat]) => projeter(lng, lat));
  const h = hover !== null ? halos[hover] : null;
  const hp = h ? projeter(h.lng, h.lat) : null;

  return (
    <svg viewBox={`0 0 340 ${FRANCE_H}`} className="w-full block select-none">
      <defs>
        <marker id="mk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#1E6BFF" /></marker>
        <filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0F1B33" floodOpacity=".18" /></filter>
        <style>{`
          @keyframes hb-wave { 0% { transform: scale(.6); opacity: .55 } 100% { transform: scale(2.1); opacity: 0 } }
          @keyframes hb-draw { 0% { stroke-dashoffset: 400; opacity: 0 } 10% { opacity: 1 } 60% { stroke-dashoffset: 0; opacity: 1 } 85% { opacity: 1 } 100% { stroke-dashoffset: 0; opacity: 0 } }
          @keyframes hb-dash { to { stroke-dashoffset: -26 } }
          .hb-wave { transform-box: fill-box; transform-origin: center; animation: hb-wave 3.2s ease-out infinite }
          .hb-draw { stroke-dasharray: 400; animation: hb-draw 6s ease-in-out infinite }
          .hb-dash { stroke-dasharray: 5 6; animation: hb-dash 1.6s linear infinite }
          @media (prefers-reduced-motion: reduce) { .hb-wave, .hb-draw, .hb-dash { animation: none } .hb-draw { stroke-dasharray: 5 6; opacity: 1 } }
        `}</style>
      </defs>
      <path d={FRANCE_D} fill="#fff" stroke="#CBD3E3" strokeWidth="1.2" strokeLinejoin="round" filter="url(#sh)" />

      {halos.map((hl, i) => {
        const [x, y] = projeter(hl.lng, hl.lat); const r = 6 + Math.sqrt(hl.n) / 2.2;
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
            <circle cx={x} cy={y} r={r} fill="#1E6BFF" opacity=".10" />
            {anime && <circle className="hb-wave" cx={x} cy={y} r={r * .7} fill="none" stroke="#1E6BFF" strokeWidth="1.2" style={{ animationDelay: `${(i * .55) % 3.2}s` }} />}
            {anime && <circle className="hb-wave" cx={x} cy={y} r={r * .7} fill="none" stroke="#1E6BFF" strokeWidth="1.2" style={{ animationDelay: `${((i * .55) % 3.2) + 1.6}s` }} />}
            <circle cx={x} cy={y} r={hover === i ? 3.2 : 2.2} fill="#1E6BFF" opacity=".8" />
            <circle cx={x} cy={y} r={Math.max(r, 12)} fill="transparent" />
          </g>
        );
      })}

      {cyc.map((p, i) => cyc.length > 1 && (
        <path key={i} className={anime ? 'hb-draw' : 'hb-dash'} style={{ animationDelay: `${i * .4}s` }} d={curve(p, cyc[(i + 1) % cyc.length], i % 2 ? 30 : -22)} fill="none" stroke="#1E6BFF" strokeWidth="2" markerEnd="url(#mk)" />
      ))}

      {points.map((p, i) => { const [x, y] = projeter(p.lng, p.lat); const c = col[p.cls]; return (
        <g key={i}>
          <circle cx={x} cy={y} r="11" fill={c} opacity=".18" />
          {anime && <circle className="hb-wave" cx={x} cy={y} r="9" fill="none" stroke={c} strokeWidth="1.5" style={{ animationDelay: `${i * 1.1}s`, animationDuration: '2.6s' }} />}
          <circle cx={x} cy={y} r="5" fill={c} stroke="#fff" strokeWidth="2.5" />
          {p.label && <><rect x={x - 27} y={y + 8} width="54" height="14" rx="7" fill={c === '#1E6BFF' ? '#0F1B33' : c} /><text x={x} y={y + 18} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Helvetica,Arial">{p.label}</text></>}
        </g>
      ); })}

      {h && hp && (
        <g pointerEvents="none">
          <rect x={hp[0] - 44} y={hp[1] - 36} width="88" height="24" rx="8" fill="#0F1B33" />
          <text x={hp[0]} y={hp[1] - 26} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fff" fontFamily="Helvetica,Arial">{h.nom ?? ''}</text>
          <text x={hp[0]} y={hp[1] - 17} textAnchor="middle" fontSize="8" fill="#8FF0C0" fontFamily="Helvetica,Arial">{h.n} en recherche</text>
        </g>
      )}
    </svg>
  );
}
