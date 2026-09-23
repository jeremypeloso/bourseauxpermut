'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/accueil', label: 'Accueil', d: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { href: '/permut', label: "Permut'", d: 'M4 7h11l-3-3M20 17H9l3 3M4 17a2 2 0 1 0 0 .1M20 7a2 2 0 1 0 0 .1' },
  { href: '/ecoute', label: 'Écoute', d: 'M4 12a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-6h4M4 12v4a2 2 0 0 0 2 2h2v-6H4' },
  { href: '/apres', label: "L'après", d: 'M4 20V6a2 2 0 0 1 2-2h8v16M14 12h6M17 9l3 3-3 3' },
  { href: '/profil', label: 'Profil', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
];

export default function TabBar() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 bg-white/85 backdrop-blur border-t border-[#E6E9F0] flex justify-around px-2 pt-2.5 pb-[max(14px,env(safe-area-inset-bottom))]">
      {TABS.map(t => {
        const on = path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-1 w-16 text-[11px] font-semibold ${on ? 'text-bleu' : 'text-[#A3AAB8]'}`}>
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={t.d} /></svg>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
