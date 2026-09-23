#!/usr/bin/env bash
#!/usr/bin/env bash
# Hors Boîte — app responsive desktop (barre latérale) + mobile (barre du bas), redirections proxy
set -e

mkdir -p "components"
cat > "components/SideNav.tsx" << 'HB_EOF'
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

const NAV = [
  { href: '/accueil', label: 'Accueil', d: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { href: '/permut', label: 'Correspondances', d: 'M4 7h11l-3-3M20 17H9l3 3M4 17a2 2 0 1 0 0 .1M20 7a2 2 0 1 0 0 .1' },
  { href: '/annonces', label: 'Annonces', d: 'M4 5h16v14H4zM8 9h8M8 13h5' },
  { href: '/points', label: 'Mes points', d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { href: '/ecoute', label: 'Écoute', d: 'M4 12a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-6h4M4 12v4a2 2 0 0 0 2 2h2v-6H4' },
  { href: '/apres', label: "L'après", d: 'M4 20V6a2 2 0 0 1 2-2h8v16M14 12h6M17 9l3 3-3 3' },
];

export default function SideNav({ premium, institution }: { premium: boolean; institution?: string | null }) {
  const path = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-0 h-screen bg-white border-r border-[#E6E9F0] px-4 py-6">
      <Link href="/accueil" className="px-2 mb-6"><img src="/logo.png" alt="Hors Boîte" className="h-9 w-auto" /></Link>
      <nav className="flex flex-col gap-0.5">
        {NAV.map(n => { const on = path.startsWith(n.href); return (
          <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold ${on ? 'bg-[#E6EEFF] text-bleud' : 'text-[#6F7789] hover:bg-[#F5F7FB] hover:text-navy'}`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={n.d} /></svg>{n.label}
          </Link>
        ); })}
        <span className="text-[10.5px] font-bold tracking-[.6px] uppercase text-[#A3AAB8] mt-5 mb-1 px-3">Compte</span>
        <Link href="/profil" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold ${path.startsWith('/profil') ? 'bg-[#E6EEFF] text-bleud' : 'text-[#6F7789] hover:bg-[#F5F7FB] hover:text-navy'}`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" /></svg>Profil et souhaits
        </Link>
        <button onClick={async () => { await supabaseBrowser().auth.signOut(); location.href = '/'; }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-[#6F7789] hover:bg-[#F5F7FB] hover:text-navy text-left">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M10 17l5-5-5-5M15 12H3M13 4h6v16h-6" /></svg>Se déconnecter
        </button>
      </nav>
      <div className="mt-auto rounded-2xl bg-[#F5F7FB] p-3 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4C86FF] to-[#1B4FD6] text-white text-[12px] font-extrabold flex items-center justify-center">{institution ?? '?'}</span>
        <span><b className="block text-[13px] text-navy">{premium ? 'Premium' : 'Gratuit'}</b><span className="text-[11px] text-[#6F7789]">{premium ? 'Tout est ouvert' : 'Passer en Premium'}</span></span>
      </div>
    </aside>
  );
}
HB_EOF

mkdir -p "app/(app)"
cat > "app/(app)/layout.tsx" << 'HB_EOF'
import TabBar from '@/components/TabBar';
import SideNav from '@/components/SideNav';
import { redirect } from 'next/navigation';
import { currentUser, supabaseServer } from '@/lib/supabase-server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/');
  const { data: profil } = await supabaseServer().from('profils').select('institution, premium_jusqua').eq('id', user.id).maybeSingle();
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();
  return (
    <div className="min-h-screen flex">
      <SideNav premium={premium} institution={profil?.institution} />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 w-full max-w-[430px] lg:max-w-[1100px] mx-auto px-4 lg:px-8 pt-[max(12px,env(safe-area-inset-top))] lg:pt-8 pb-5 lg:pb-12">{children}</main>
        <div className="lg:hidden sticky bottom-0"><TabBar /></div>
      </div>
    </div>
  );
}
HB_EOF

mkdir -p "app/(app)/accueil"
cat > "app/(app)/accueil/page.tsx" << 'HB_EOF'
import Link from 'next/link';
import Image from 'next/image';
import CarteFrance from '@/components/CarteFrance';
import CompteurLive from '@/components/CompteurLive';
import { supabaseServer, currentUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function Accueil() {
  const sb = supabaseServer();
  const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('institution, premium_jusqua, services(ville, lat, lng), souhaits(rang, services(ville, lat, lng))').eq('id', user.id).single();
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();
  const { data: corrs } = await sb.from('v_mes_correspondances').select('id, type, score, created_at, est_moi, ville_actuelle, ville_cible').order('score', { ascending: false });
  const dernier = corrs?.find(c => c.est_moi);
  const nb = new Set((corrs ?? []).map(c => c.id)).size;
  const { data: cal } = await sb.from('calendriers').select('libelle, cloture').eq('institution', profil?.institution).order('cloture').limit(2);
  const { data: refs } = await sb.from('referents').select('id').eq('disponible', true);
  // Halos : comptage par ville des profils vérifiés (vue agrégée à ajouter en v1.1 ; ici les souhaits de démo)
  const me: any = (profil as any)?.services; const wish: any = (profil as any)?.souhaits?.find((s: any) => s.rang === 1)?.services;
  const points = [me && { lat: me.lat, lng: me.lng, label: me.ville, cls: 'me' as const }, wish && { lat: wish.lat, lng: wish.lng, label: wish.ville, cls: 'wish' as const }].filter(Boolean) as any[];
  const halos = [{ lat: 48.86, lng: 2.35, n: 1240 }, { lat: 45.76, lng: 4.83, n: 310 }, { lat: 43.30, lng: 5.37, n: 180 }, { lat: 50.63, lng: 3.06, n: 260 }, { lat: 44.84, lng: -0.58, n: 95 }, { lat: 47.22, lng: -1.55, n: 120 }, { lat: 48.58, lng: 7.75, n: 140 }];

  return (
    <>
      <div className="flex items-center justify-between mb-3 lg:mb-6">
        <Image src="/logo.png" alt="Hors Boîte" width={150} height={40} priority className="lg:hidden" />
        <h1 className="h1 hidden lg:block">Bouger, tenir, partir. <span className="text-[#6F7789]">Ici, personne ne le sait.</span></h1>
        <span className={premium ? 'pill-mint' : 'pill-bleu'}>{premium ? 'Premium' : 'Gratuit'}</span>
      </div>
      <div className="lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-6 lg:items-start">
      <div>
      <Link href="/permut" className="block relative rounded-xl3 lg:mt-0 overflow-hidden bg-gradient-to-b from-[#DCE5F5] to-[#E9EEF7] p-3 pb-2 shadow-[0_14px_34px_-16px_rgba(15,27,51,.22)]">
        <div className="absolute left-3 top-3 bg-white/90 rounded-xl px-2.5 py-1.5 text-[10.5px] text-[#6F7789] leading-relaxed z-10">
          <i className="inline-block w-2 h-2 rounded-full bg-bleu mr-1.5 align-middle" />Vous<br /><i className="inline-block w-2 h-2 rounded-full bg-mint mr-1.5 align-middle" />Votre souhait
        </div>
        <div className="absolute right-3 top-3 bg-navy text-white rounded-xl px-2.5 py-1.5 text-[10.5px] text-right leading-tight z-10"><b className="block text-[16px] text-[#8FF0C0]"><CompteurLive initial={halos.reduce((s, h) => s + h.n, 0)} /></b>collègues en recherche<br />en ce moment</div>
        <CarteFrance points={points} halos={halos} cycle={me && wish ? [[me.lng, me.lat], [wish.lng, wish.lat]] : undefined} />
      </Link>
      </div>
      <div>
      {dernier ? (
        <Link href={`/permut/${dernier.id}`} className="card block mt-3 lg:mt-0">
          <div className="flex justify-between items-center"><b className="text-[15px] text-navy">{dernier.type === 'directe' ? 'Une permutation directe est possible' : `Un cycle à ${dernier.type === 'cycle3' ? 3 : 4} s'est fermé pour vous`}</b><span className="pill-mint">{dernier.score} %</span></div>
          <div className="sub mt-1">{dernier.ville_actuelle} → {dernier.ville_cible} · {nb} correspondance{nb > 1 ? 's' : ''} au total</div>
          {!premium && <span className="pill-amber mt-2">Reçu avec 48 h de retard · les Premium sont prévenus en premier</span>}
        </Link>
      ) : (
        <div className="card mt-3 lg:mt-0"><b className="text-[15px] text-navy">Rien de neuf</b><div className="sub mt-1">Vos souhaits sont actifs. Le matching tourne toutes les heures.</div></div>
      )}

      <div className="flex gap-2.5 mt-3">
        <Link href="/ecoute" className="flex-1 rounded-2xl px-3 py-3.5 text-white font-bold bg-gradient-to-br from-[#3ED18B] to-[#149A5E] shadow-lg leading-tight">Parler<small className="block text-[10.5px] font-semibold opacity-85">{refs?.length ?? 0} collègue{(refs?.length ?? 0) > 1 ? 's' : ''} dispo</small></Link>
        <Link href="/apres" className="flex-1 rounded-2xl px-3 py-3.5 text-white font-bold bg-gradient-to-br from-[#A66BFF] to-[#6C3BC9] shadow-lg leading-tight">L&apos;après<small className="block text-[10.5px] font-semibold opacity-85">Préparer sans le dire</small></Link>
      </div>
      <Link href="/annonces" className="flex justify-between items-center mt-3 bg-white rounded-2xl px-3.5 py-3 text-[12.5px] text-[#6F7789]"><span>Annonces de permutation</span><b className="text-navy">Parcourir ›</b></Link>
      <Link href="/points" className="flex justify-between items-center mt-2 bg-white rounded-2xl px-3.5 py-3 text-[12.5px] text-[#6F7789]"><span>Mes points de mutation</span><b className="text-navy">Simuler ›</b></Link>
      {(cal ?? []).map(c => <div key={c.libelle} className="flex justify-between items-center mt-2 bg-white rounded-2xl px-3.5 py-3 text-[12.5px] text-[#6F7789]"><span>{c.libelle}</span><b className="text-navy">Clôture le {new Date(c.cloture).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</b></div>)}
      </div>
      </div>
    </>
  );
}
HB_EOF

mkdir -p "app/(app)/annonces"
cat > "app/(app)/annonces/page.tsx" << 'HB_EOF'
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Paywall from '@/components/Paywall';

type A = any;

export default function Annonces() {
  const r = useRouter();
  const [data, setData] = useState<{ annonces: A[]; total: number; en_clair: number; premium: boolean; verifie: boolean } | null>(null);
  const [dep, setDep] = useState('');
  const [pay, setPay] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const charger = async (d = dep) => { const j = await fetch(`/api/annonces${d ? `?departement=${d}` : ''}`).then(x => x.json()); setData(j); };
  useEffect(() => { charger(''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mienne = data?.annonces.find(a => a.mienne);
  const publier = async () => { setBusy(true); const j = await fetch('/api/annonces', { method: 'POST' }).then(x => x.json()); setBusy(false); setMsg(j.ok ? 'Annonce publiée à partir de votre profil et de vos souhaits.' : j.message); charger(); };
  const retirer = async () => { await fetch('/api/annonces', { method: 'DELETE' }); setMsg('Annonce retirée.'); charger(); };
  const booster = async () => { const j = await fetch('/api/stripe/boost', { method: 'POST' }).then(x => x.json()); if (j.url) location.href = j.url; else setMsg(j.message); };
  const repondre = async (id: string) => {
    const res = await fetch('/api/annonces/repondre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) });
    if (res.status === 402) return setPay(true);
    const j = await res.json(); if (j.ok) r.push(`/permut/${j.correspondance_id}`); else setMsg(j.message);
  };

  return (
    <>
      <div className="flex gap-1.5 mb-3 bg-white rounded-2xl p-1">
        <Link href="/permut" className="flex-1 text-center py-2 rounded-xl text-[13px] font-bold text-[#6F7789]">Correspondances</Link>
        <span className="flex-1 text-center py-2 rounded-xl text-[13px] font-bold bg-navy text-white">Annonces</span>
      </div>
      <div className="flex justify-between items-end mb-3"><h1 className="h1">Annonces</h1>{data && <span className="sub">{data.total} active{data.total > 1 ? 's' : ''}</span>}</div>

      {data && !data.verifie && <div className="card"><b className="text-navy">Compte à vérifier</b><div className="sub mt-1">Les annonces sont réservées aux agents vérifiés (carte pro ou mail pro).</div><a href="/onboarding" className="btn mt-3">Vérifier mon compte</a></div>}

      {data?.verifie && (
        <div className="card mb-3">
          {mienne ? (
            <>
              <div className="flex justify-between items-center"><b className="text-[14px] text-navy">Mon annonce</b>{mienne.mise_en_avant ? <span className="pill-mint">Mise en avant</span> : <span className="pill-bleu">En ligne</span>}</div>
              <div className="sub mt-1">{mienne.grade} · {mienne.ville} → {mienne.cibles_villes.join(', ')}</div>
              <div className="flex gap-2 mt-3">{!mienne.mise_en_avant && <button className="btn !py-2.5" onClick={booster}>Mettre en avant · 4,99 € / 7 j</button>}<button className="btn-ghost !py-2.5" onClick={retirer}>Retirer</button></div>
            </>
          ) : (
            <>
              <b className="text-[14px] text-navy">Publier mon annonce</b>
              <div className="sub mt-1">Anonyme : grade, affectation, type de service, ancienneté et villes souhaitées, repris de votre profil. Aucun nom, aucun texte libre. Gratuit.</div>
              <button className="btn mt-3" onClick={publier} disabled={busy}>{busy ? 'Publication…' : 'Publier à partir de mon profil'}</button>
            </>
          )}
          {msg && <p className="sub mt-2">{msg}</p>}
        </div>
      )}

      {data?.verifie && (
        <div className="flex gap-2 mb-3">
          <input className="field !py-2.5" placeholder="Filtrer par département (06, 31, 974…)" value={dep} onChange={e => setDep(e.target.value)} onBlur={() => charger()} />
          <button className="btn-ghost !w-auto !py-2.5 px-4" onClick={() => charger()}>OK</button>
        </div>
      )}

      {data?.verifie && !data.premium && data.total > data.en_clair && (
        <div className="bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#3B4457] border-l-[3px] border-bleu mb-3"><b className="text-bleud">{data.total - data.en_clair} autre{data.total - data.en_clair > 1 ? 's' : ''} annonce{data.total - data.en_clair > 1 ? 's' : ''}</b> correspondent à vos souhaits. Les 3 plus pertinentes sont en clair, le reste est réservé au Premium.</div>
      )}

      {data?.annonces.map(a => a.flou ? (
        <button key={a.id} onClick={() => setPay(true)} className="card w-full text-left mb-3 relative overflow-hidden">
          <div className="flex justify-between items-center"><b className="text-[14px] text-navy">{a.grade} · {a.ville} → {a.cibles_villes.join(', ')}</b>{a.mise_en_avant && <span className="pill-amber">Mise en avant</span>}</div>
          <div className="mt-2 space-y-2 select-none" aria-hidden><div className="h-3 rounded bg-[#E6E9F0] w-4/5 blur-[3px]" /><div className="h-3 rounded bg-[#E6E9F0] w-3/5 blur-[3px]" /><div className="h-8 rounded-xl bg-[#E6E9F0] w-2/5 blur-[3px] mt-3" /></div>
          <span className="absolute right-3 bottom-3 pill-bleu">🔒 Premium</span>
        </button>
      ) : (
        <div key={a.id} className={`card mb-3 ${a.mise_en_avant ? 'border border-[#F2A900]' : ''}`}>
          <div className="flex justify-between items-center"><b className="text-[15px] text-navy">{a.grade} · {a.ville}</b>{a.mienne ? <span className="pill-mint">Vous</span> : a.mise_en_avant ? <span className="pill-amber">Mise en avant</span> : null}</div>
          <div className="sub mt-1">{a.corps} · {a.type_service ?? 'service non précisé'} · {Math.floor((a.anciennete_poste_mois ?? 0) / 12)} ans dans le poste{a.depart_des ? ` · départ dès ${new Date(a.depart_des).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` : ''}</div>
          <div className="flex flex-wrap gap-1.5 mt-3">{(a.cibles ?? []).map((c: any, i: number) => <span key={i} className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold bg-[#DFF7EB] text-[#16804F]">→ {c.ville ?? c.departement}</span>)}</div>
          {!a.mienne && <button className="btn mt-3 !py-3" onClick={() => repondre(a.id)}>Proposer une permutation</button>}
        </div>
      ))}
      {data?.verifie && data.annonces.length === 0 && <div className="card"><b className="text-navy">Aucune annonce pour l&apos;instant</b><div className="sub mt-1">Publiez la vôtre : c&apos;est gratuit, anonyme, et c&apos;est ce qui fait venir les autres.</div></div>}
      <div className="lockrow mt-2 flex items-center gap-2.5 bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#6F7789]">🔒 Une annonce montre un poste et des souhaits, jamais une personne. Réponse = même flux que le matching : acceptation, puis révélation.</div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </>
  );
}
HB_EOF

mkdir -p "app/auth/callback"
cat > "app/auth/callback/route.ts" << 'HB_EOF'
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

const base = (req: NextRequest) => process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

/** Retour du lien magique : échange le code contre une session, puis redirige (next) ou onboarding/accueil. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = req.nextUrl.searchParams.get('next');
  const sb = supabaseServer();
  if (code) await sb.auth.exchangeCodeForSession(code);
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/', base(req)));
  const { data: profil } = await sb.from('profils').select('verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
  if (next && next.startsWith('/')) return NextResponse.redirect(new URL(next, req.url));
  return NextResponse.redirect(new URL(profil ? '/accueil' : '/onboarding', req.url));
}
HB_EOF


cat > "middleware.ts" << 'HB_EOF'
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC = ['/', '/login', '/auth', '/api/stripe/webhook', '/api/cron'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  if (!user && !PUBLIC.some(p => path === p || path.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin));
  }
  return res;
}

// Tout sauf les assets Next et les fichiers statiques (images, icônes, etc.)
export const config = { matcher: ['/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)'] };
HB_EOF

rm -rf .next
echo "Layout responsive installé. Relance : npm run dev"