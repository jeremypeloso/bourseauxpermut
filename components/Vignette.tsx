/** Vignette "trajet" d'une annonce : départ → première cible. SVG inline, aucune image. */
export default function Vignette({ de, vers, cycle = false, className = '' }: { de: string; vers: string; cycle?: boolean; className?: string }) {
  const s = (t: string) => (t ?? '').slice(0, 11);
  return (
    <svg viewBox="0 0 120 90" className={className}>
      <rect width="120" height="90" rx="10" fill="#EEF2F8" />
      <path d="M28 58 Q60 18 92 58" fill="none" stroke="#1E6BFF" strokeWidth="2.5" strokeDasharray="4 4" />
      {cycle && <path d="M92 58 Q60 78 28 58" fill="none" stroke="#E8232B" strokeWidth="2" strokeDasharray="3 4" />}
      <circle cx="28" cy="58" r="7" fill="#0F1B33" stroke="#fff" strokeWidth="2.5" /><circle cx="92" cy="58" r="7" fill="#22B573" stroke="#fff" strokeWidth="2.5" />
      <text x="28" y="80" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0F1B33" fontFamily="Helvetica,Arial">{s(de)}</text>
      <text x="92" y="80" textAnchor="middle" fontSize="8" fontWeight="700" fill="#16804F" fontFamily="Helvetica,Arial">{s(vers)}</text>
    </svg>
  );
}
