import { FRANCE_D, FRANCE_H, projeter } from '@/lib/france-path';
import { DEPARTEMENTS, OUTRE_MER_CODES, estOutreMer } from '@/lib/departements';

type Pt = { lat?: number | null; lng?: number | null; departement?: string | null; ville?: string | null };
const coord = (p: Pt): [number, number] | null => {
  if (p.lng != null && p.lat != null) return [Number(p.lng), Number(p.lat)];
  const d = p.departement ? DEPARTEMENTS[p.departement.toUpperCase()] : undefined;
  return d ?? null;
};

/** Vignette d'annonce : carte de France, point de départ (bleu nuit) et souhaits (vert), flèches courbes. L'outre-mer apparaît en pastille. */
export default function Vignette({ de, vers, className = '' }: { de: Pt; vers: Pt[]; className?: string }) {
  const o = estOutreMer(de.departement) ? null : coord(de);
  const cibles = vers.map(v => ({ v, c: estOutreMer(v.departement) ? null : coord(v) }));
  const omDe = estOutreMer(de.departement) ? (OUTRE_MER_CODES[de.departement!] ?? de.departement) : null;
  const omVers = vers.filter(v => estOutreMer(v.departement)).map(v => OUTRE_MER_CODES[v.departement!] ?? v.departement);
  const P = (c: [number, number]) => projeter(c[0], c[1]);
  const curve = (a: readonly [number, number], b: readonly [number, number]) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; const off = Math.min(28, L * 0.25); return `M${a[0]} ${a[1]} Q${mx - dy / L * off} ${my + dx / L * off} ${b[0]} ${b[1]}`; };
  return (
    <svg viewBox={`-6 -6 356 ${FRANCE_H + 18}`} className={className} aria-hidden>
      <rect x="-6" y="-6" width="356" height={FRANCE_H + 18} rx="26" fill="#EEF2F8" />
      <path d={FRANCE_D} fill="#fff" stroke="#CBD3E3" strokeWidth="1.5" strokeLinejoin="round" />
      {o && cibles.map(({ c }, i) => c && <path key={i} d={curve(P(o), P(c))} fill="none" stroke="#1E6BFF" strokeWidth="3" strokeDasharray="6 6" opacity={i === 0 ? 1 : 0.55} />)}
      {cibles.map(({ c }, i) => c && <circle key={i} cx={P(c)[0]} cy={P(c)[1]} r={i === 0 ? 11 : 9} fill="#22B573" stroke="#fff" strokeWidth="3.5" />)}
      {o && <circle cx={P(o)[0]} cy={P(o)[1]} r="12" fill="#0F1B33" stroke="#fff" strokeWidth="3.5" />}
      {/* Outre-mer : pastilles en haut à gauche (départ en bleu nuit, souhaits en vert), largeur calculée sur le texte */}
      {[...(omDe ? [{ t: omDe, c: '#0F1B33' }] : []), ...omVers.map(t => ({ t, c: '#22B573' }))].map((o, i) => { const w = 34 + o.t.length * 8.2; return (
        <g key={i} transform={`translate(6 ${6 + i * 34})`}><rect width={w} height="28" rx="14" fill="#fff" stroke="#CBD3E3" strokeWidth="1.2" /><circle cx="15" cy="14" r="6" fill={o.c} stroke="#fff" strokeWidth="2" /><text x="27" y="19" fontSize="13" fontWeight="700" fill="#0F1B33" fontFamily="Helvetica,Arial">{o.t}</text></g>
      ); })}
    </svg>
  );
}
