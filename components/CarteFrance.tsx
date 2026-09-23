import { FRANCE_D, FRANCE_H, projeter } from '@/lib/france-path';

type Pt = { lat: number; lng: number; label?: string; cls: 'me' | 'wish' | 'other' };
type Halo = { lat: number; lng: number; n: number };

/** Carte SVG inline, aucune dépendance. Halos = collègues en recherche par ville (jamais qui). */
export default function CarteFrance({ points, halos, cycle }: { points: Pt[]; halos: Halo[]; cycle?: [number, number][] }) {
  const col = { me: '#1E6BFF', wish: '#22B573', other: '#E8232B' };
  const curve = (a: readonly [number, number], b: readonly [number, number], off: number) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return `M${a[0]} ${a[1]} Q${(mx - dy / L * off).toFixed(1)} ${(my + dx / L * off).toFixed(1)} ${b[0]} ${b[1]}`;
  };
  const cyc = (cycle ?? []).map(([lng, lat]) => projeter(lng, lat));
  return (
    <svg viewBox={`0 0 340 ${FRANCE_H}`} className="w-full block">
      <defs>
        <marker id="mk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#1E6BFF" /></marker>
        <filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0F1B33" floodOpacity=".18" /></filter>
      </defs>
      <path d={FRANCE_D} fill="#fff" stroke="#CBD3E3" strokeWidth="1.2" strokeLinejoin="round" filter="url(#sh)" />
      {halos.map((h, i) => { const [x, y] = projeter(h.lng, h.lat); const r = 6 + Math.sqrt(h.n) / 2.2; return (
        <g key={i}><circle cx={x} cy={y} r={r} fill="#1E6BFF" opacity=".10" /><circle cx={x} cy={y} r={r * .55} fill="#1E6BFF" opacity=".10" /><circle cx={x} cy={y} r="2.2" fill="#1E6BFF" opacity=".7" /></g>
      ); })}
      {cyc.map((p, i) => cyc.length > 1 && <path key={i} d={curve(p, cyc[(i + 1) % cyc.length], i % 2 ? 30 : -22)} fill="none" stroke="#1E6BFF" strokeWidth="2" strokeDasharray="5 6" markerEnd="url(#mk)" />)}
      {points.map((p, i) => { const [x, y] = projeter(p.lng, p.lat); const c = col[p.cls]; return (
        <g key={i}><circle cx={x} cy={y} r="11" fill={c} opacity=".18" /><circle cx={x} cy={y} r="5" fill={c} stroke="#fff" strokeWidth="2.5" />
          {p.label && <><rect x={x - 27} y={y + 8} width="54" height="14" rx="7" fill={c === '#1E6BFF' ? '#0F1B33' : c} /><text x={x} y={y + 18} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Helvetica,Arial">{p.label}</text></>}
        </g>
      ); })}
    </svg>
  );
}
