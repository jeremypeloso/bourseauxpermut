'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const NAV = [['/admin', 'Tableau de bord'], ['/admin/comptes', 'Comptes'], ['/admin/annonces', 'Annonces'], ['/admin/signalements', 'Signalements'], ['/admin/correspondances', 'Correspondances'], ['/admin/paiements', 'Paiements'], ['/admin/services', 'Affectations'], ['/admin/preinscrits', 'Pré-inscrits'], ['/admin/journal', 'Journal'], ['/admin/parametres', 'Paramètres']];
export default function AdminNav() {
  const p = usePathname();
  return (
    <nav className="bg-navy text-white rounded-2xl p-2 lg:sticky lg:top-[84px] flex lg:flex-col gap-1 overflow-x-auto">
      <span className="hidden lg:block text-[10.5px] font-bold tracking-[.6px] uppercase text-[#8FB4FF] px-3 pt-2 pb-1">Administration</span>
      {NAV.map(([h, t]) => <Link key={h} href={h} className={`shrink-0 px-3 py-2 rounded-xl text-[13px] font-semibold ${p === h ? 'bg-white text-navy' : 'text-[#DCE4F5] hover:bg-white/10'}`}>{t}</Link>)}
    </nav>
  );
}
