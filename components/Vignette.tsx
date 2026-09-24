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
  const om = [de, ...vers].filter(p => estOutreMer(p.departement)).map(p => OUTRE_MER_CODES[p.departement!] ?? p.departement);
  const P = (c: [number, number]) => projeter(c[0], c[1]);
  const curve = (a: readonly [number, number], b: readonly [number, number]) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; const off = Math.min(28, L * 0.25); return `M${a[0]} ${a[1]} Q${mx - dy / L * off} ${my + dx / L * off} ${b[0]} ${b[1]}`; };
  return (
    <svg viewBox={`0 0 340 ${FRANCE_H}`} className={className} aria-hidden>
      <rect width="340" height={FRANCE_H} rx="26" fill="#EEF2F8" />
      <path d={FRANCE_D} fill="#fff" stroke="#CBD3E3" strokeWidth="1.5" strokeLinejoin="round" />
      {o && cibles.map(({ c }, i) => c && <path key={i} d={curve(P(o), P(c))} fill="none" stroke="#1E6BFF" strokeWidth="3" strokeDasharray="6 6" opacity={i === 0 ? 1 : 0.55} />)}
      {cibles.map(({ c }, i) => c && <circle key={i} cx={P(c)[0]} cy={P(c)[1]} r={i === 0 ? 11 : 9} fill="#22B573" stroke="#fff" strokeWidth="3.5" />)}
      {o && <circle cx={P(o)[0]} cy={P(o)[1]} r="12" fill="#0F1B33" stroke="#fff" strokeWidth="3.5" />}
      {om.length > 0 && <g><rect x="8" y={FRANCE_H - 40} width={Math.min(324, 22 + om.join(' · ').length * 7.2)} height="30" rx="15" fill="#0F1B33" /><circle cx="24" cy={FRANCE_H - 25} r="6" fill="#22B573" /><text x="38" y={FRANCE_H - 20} fontSize="13" fontWeight="700" fill="#fff" fontFamily="Helvetica,Arial">{om.join(' · ')}</text></g>}
    </svg>
  );
}
