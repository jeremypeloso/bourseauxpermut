export function Table({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="bg-white border border-[#E6E9F0] rounded-2xl overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead><tr className="text-left text-[11px] uppercase tracking-wider text-[#A3AAB8] bg-paper">{cols.map(c => <th key={c} className="px-3 py-2.5 font-bold whitespace-nowrap">{c}</th>)}</tr></thead>
        <tbody>{rows.length === 0 ? <tr><td className="px-3 py-6 text-[#6F7789]" colSpan={cols.length}>Rien pour l&apos;instant.</td></tr> : rows.map((r, i) => <tr key={i} className="border-t border-[#F0F2F6] align-top">{r.map((c, j) => <td key={j} className="px-3 py-2.5">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
export const d = (s?: string | null) => s ? new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
export const Pill = ({ ok, t, warn = false }: { ok: boolean; t: string; warn?: boolean }) => <span className={ok ? 'pill-mint' : warn ? 'pill-amber' : 'pill bg-paper text-[#6F7789]'}>{t}</span>;
