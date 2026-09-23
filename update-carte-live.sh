#!/usr/bin/env bash
# Hors Boîte — carte animée + compteur temps réel
set -e

mkdir -p "components"
cat > "components/CarteFrance.tsx" << 'HB_EOF'
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
HB_EOF

mkdir -p "components"
cat > "components/CompteurLive.tsx" << 'HB_EOF'
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
    const ch = sb.channel('stats_publiques').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stats_publiques', filter: `cle=eq.${cle}` }, (p: any) => setVal(p.new.valeur)).subscribe();
    return () => { sb.removeChannel(ch); };
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
HB_EOF

mkdir -p "components"
cat > "components/Landing.tsx" << 'HB_EOF'
'use client';
import { useState } from 'react';
import AuthModal from './AuthModal';
import CarteFrance from './CarteFrance';
import CompteurLive from './CompteurLive';

const HALOS = [{ lat: 48.86, lng: 2.35, n: 1240, nom: 'Paris' }, { lat: 45.76, lng: 4.83, n: 310, nom: 'Lyon' }, { lat: 43.30, lng: 5.37, n: 180, nom: 'Marseille' }, { lat: 50.63, lng: 3.06, n: 260, nom: 'Lille' }, { lat: 44.84, lng: -0.58, n: 95, nom: 'Bordeaux' }, { lat: 47.22, lng: -1.55, n: 120, nom: 'Nantes' }, { lat: 48.58, lng: 7.75, n: 140, nom: 'Strasbourg' }, { lat: 48.11, lng: -1.68, n: 60, nom: 'Rennes' }, { lat: 49.44, lng: 1.1, n: 70, nom: 'Rouen' }, { lat: 45.19, lng: 5.72, n: 60, nom: 'Grenoble' }];

const Ico = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const I = {
  permut: 'M4 7h11l-3-3M20 17H9l3 3M4 17a2 2 0 1 0 0 .1M20 7a2 2 0 1 0 0 .1',
  ecoute: 'M4 12a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-6h4M4 12v4a2 2 0 0 0 2 2h2v-6H4',
  apres: 'M4 20V6a2 2 0 0 1 2-2h8v16M14 12h6M17 9l3 3-3 3',
  mask: 'M12 5c-5 0-8.5 4-9.5 7 1 3 4.5 7 9.5 7s8.5-4 9.5-7c-1-3-4.5-7-9.5-7zM3 3l18 18',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5M4 4l3 3',
  card: 'M3 6h18v12H3zM7 12h3M13 10h5M13 14h5',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
};

export default function Landing() {
  const [modal, setModal] = useState<null | 'signup' | 'login'>(null);
  const [voie, setVoie] = useState<1 | 2>(1);
  const [menu, setMenu] = useState(false);
  const Btn = ({ m, t, cls = '' }: { m: 'signup' | 'login'; t: string; cls?: string }) => <button onClick={() => setModal(m)} className={cls}>{t}</button>;
  const Kicker = ({ t, light = false }: { t: string; light?: boolean }) => <span className={`block text-[12px] font-bold tracking-[1.5px] uppercase mb-3 ${light ? 'text-[#8FB4FF]' : 'text-bleu'}`}>{t}</span>;
  const H2 = ({ t, light = false }: { t: string; light?: boolean }) => <h2 className={`text-[34px] md:text-[40px] font-extrabold tracking-[-1.4px] leading-[1.08] ${light ? 'text-white' : 'text-navy'}`}>{t}</h2>;
  const W = ({ children, cls = '' }: { children: React.ReactNode; cls?: string }) => <div className={`max-w-[1120px] mx-auto px-6 ${cls}`}>{children}</div>;

  return (
    <div className="w-full text-[#141A26]">
      {/* ===== BARRE DE MENU ===== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E6E9F0] shadow-[0_1px_0_rgba(15,27,51,.04)]">
        <W cls="h-[68px] flex items-center gap-8">
          <a href="#" className="shrink-0"><img src="/logo.png" alt="Hors Boîte" className="h-9 w-auto" /></a>
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {[['#modules', 'L\'app'], ['#permut', 'Permutation'], ['#entrer', 'Comment entrer'], ['#discretion', 'Discrétion'], ['#tarif', 'Tarif'], ['#ecoute', 'Écoute']].map(([h, t]) => (
              <a key={h} href={h} className="px-3.5 py-2 rounded-lg text-[14px] font-semibold text-[#3B4457] hover:bg-[#F0F3F8] hover:text-navy">{t}</a>
            ))}
          </nav>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <Btn m="login" t="Connexion" cls="px-4 py-2.5 rounded-xl text-[14px] font-bold text-navy border border-[#E6E9F0] hover:bg-[#F0F3F8]" />
            <Btn m="signup" t="Créer mon compte" cls="px-4 py-2.5 rounded-xl text-[14px] font-bold text-white bg-bleu shadow-[0_10px_24px_-12px_rgba(30,107,255,.8)]" />
          </div>
          <button className="ml-auto md:hidden w-10 h-10 rounded-lg border border-[#E6E9F0] flex items-center justify-center" onClick={() => setMenu(!menu)} aria-label="Menu">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </W>
        {menu && (
          <div className="md:hidden border-t border-[#E6E9F0] bg-white px-6 py-4">
            {[['#modules', 'L\'app'], ['#permut', 'Permutation'], ['#entrer', 'Comment entrer'], ['#discretion', 'Discrétion'], ['#tarif', 'Tarif']].map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)} className="block py-3 text-[15px] font-semibold text-navy border-b border-[#F0F3F8]">{t}</a>)}
            <div className="flex gap-2 mt-4"><Btn m="login" t="Connexion" cls="flex-1 py-3 rounded-xl text-[14px] font-bold text-navy border border-[#E6E9F0]" /><Btn m="signup" t="Créer mon compte" cls="flex-1 py-3 rounded-xl text-[14px] font-bold text-white bg-bleu" /></div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative isolate min-h-[calc(100svh-68px)] flex flex-col bg-[#0B1426]">
        <picture className="absolute inset-0 -z-10 block">
          <source media="(max-width: 767px)" srcSet="/hero-mobile.jpg" />
          <img src="/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-[65%_center]" />
        </picture>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,20,38,.35)_0%,rgba(11,20,38,.2)_35%,rgba(11,20,38,.75)_75%,rgba(11,20,38,.97)_100%)]" />

        <div className="relative flex-1 flex items-end">
          <W cls="pb-16 pt-16 w-full">
            <div className="max-w-[720px]">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[1.5px] uppercase text-[#8FB4FF]"><i className="w-1.5 h-1.5 rounded-full bg-[#8FF0C0]" />Police · Gendarmerie · Pénitentiaire</span>
              <h1 className="text-[44px] md:text-[64px] font-extrabold tracking-[-2.2px] leading-[1.0] text-white mt-4">Bouger, tenir, partir.<br /><span className="text-white/60">Ici, personne ne le sait.</span></h1>
              <p className="text-[17px] md:text-[19px] text-white/80 max-w-[52ch] mt-6 leading-relaxed">Échanger votre poste avec un collègue. Parler à un pair quand ça ne va pas. Préparer l&apos;après. Sans la hiérarchie, sans les syndicats, sans trace.</p>
              <div className="flex flex-wrap gap-3 mt-8"><Btn m="signup" t="Créer mon compte" cls="px-7 py-4 rounded-2xl text-[16px] font-bold text-navy bg-white shadow-[0_16px_40px_-14px_rgba(0,0,0,.6)]" /><Btn m="login" t="J'ai déjà un compte" cls="px-7 py-4 rounded-2xl text-[16px] font-bold text-white bg-white/10 border border-white/25 backdrop-blur" /></div>
            </div>
          </W>
        </div>

      </section>

      {/* ===== RÉASSURANCE ===== */}
      <div className="bg-white border-b border-[#E6E9F0]">
        <W cls="grid grid-cols-2 md:grid-cols-4 gap-y-4 py-6">
          {[
            [I.mask, 'Identité masquée', 'jusqu\'à l\'accord de tous'],
            [I.trash, 'Carte pro détruite', 'après lecture, rien n\'est gardé'],
            [I.lock, 'Zéro accès extérieur', 'ni administration, ni syndicats'],
            [I.ecoute, 'Écoute gratuite', 'avec PEPS-SOS, sans compte'],
          ].map(([d, b, sub]) => (
            <div key={b} className="flex items-center gap-3.5 pr-6">
              <span className="w-11 h-11 rounded-2xl bg-[#F0F3F8] text-navy flex items-center justify-center shrink-0"><Ico d={d} /></span>
              <span><b className="block text-[14px] text-navy leading-tight">{b}</b><span className="text-[12.5px] text-[#6F7789]">{sub}</span></span>
            </div>
          ))}
        </W>
      </div>

      {/* ===== MODULES ===== */}
      <section id="modules" className="py-24 bg-white">
        <W>
          <div className="max-w-[640px]"><Kicker t="L'app" /><H2 t="Trois choses. Rien d'autre." /><p className="text-[17px] text-[#6F7789] mt-4">Chacune répond à un moment de carrière. Chacune est cloisonnée des deux autres : ce que vous faites dans l&apos;une n&apos;apparaît jamais dans les autres.</p></div>
          <div className="grid md:grid-cols-3 gap-px bg-[#E6E9F0] border border-[#E6E9F0] rounded-3xl overflow-hidden mt-12">
            {[
              [I.permut, 'Bouger', 'Permuter son poste', 'Vous voulez Nice. Quelqu\'un de Nice veut Toulouse. Quelqu\'un de Toulouse veut votre poste. L\'algorithme ferme le cycle et vous prévient. Personne n\'a rien demandé à personne.', 'text-bleu bg-[#E6EEFF]'],
              [I.ecoute, 'Tenir · gratuit', 'Parler à un collègue', 'Quand ça ne va pas, quelqu\'un qui connaît le métier, sans passer par le service médical ni la hiérarchie. Des pairs-aidants formés, avec PEPS-SOS. Pseudo aléatoire, rien conservé.', 'text-[#16804F] bg-[#DFF7EB]'],
              [I.apres, 'Partir', 'Préparer l\'après', 'Y penser n\'engage à rien. Disponibilité, détachement, rupture conventionnelle : ce que vous gardez, ce que vous touchez, et ce que vaut votre expérience dehors.', 'text-[#6C3BC9] bg-[#F1E8FF]'],
            ].map(([d, k, h, p, c]) => (
              <div key={h} className="bg-white p-8">
                <span className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center ${c}`}><Ico d={d} /></span>
                <span className="block text-[12px] font-bold tracking-[1.5px] uppercase text-[#A3AAB8] mt-6">{k}</span>
                <h3 className="text-[22px] font-extrabold tracking-tight text-navy mt-1">{h}</h3>
                <p className="text-[15px] text-[#4B5160] mt-3 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* ===== CARTE ===== */}
      <section id="permut" className="py-24 bg-[#0B1426] text-white">
        <W cls="grid md:grid-cols-[1fr_1.1fr] gap-14 items-center">
          <div>
            <Kicker t="Permutation" light /><H2 t="Vous n'êtes pas le seul à vouloir bouger." light />
            <p className="text-[17px] text-white/70 mt-5 leading-relaxed">Des milliers de collègues attendent une mutation qui ne vient pas. Beaucoup veulent exactement le poste qu&apos;un autre veut quitter. Ils ne le savent pas, et ne peuvent le dire à personne.</p>
            <p className="text-[17px] text-white/70 mt-3 leading-relaxed">Hors Boîte croise les souhaits en silence et ferme les cycles à 2, 3 ou 4 : vous allez à Nice, Nice va à Toulouse, Toulouse vient chez vous.</p>
            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10">{[['2 à 4', 'agents par cycle'], ['24 ×', 'par jour, les souhaits sont recroisés'], ['0', 'nom visible avant accord']].map(([b, s]) => <div key={s}><b className="block text-[32px] font-extrabold tracking-tight text-white">{b}</b><span className="text-[13px] text-white/55">{s}</span></div>)}</div>
          </div>
          <div className="relative rounded-[28px] bg-gradient-to-b from-[#DCE5F5] to-[#E9EEF7] p-6">
            <div className="absolute right-5 top-5 bg-navy text-white rounded-2xl px-3.5 py-2.5 text-[11px] text-right leading-tight z-10"><b className="block text-[22px] text-[#8FF0C0]"><CompteurLive initial={2405} /></b>collègues en recherche<br />en ce moment</div>
            <CarteFrance halos={HALOS} points={[{ lat: 43.61, lng: 3.88, label: 'Montpellier', cls: 'me' }, { lat: 43.70, lng: 7.27, label: 'Nice', cls: 'wish' }, { lat: 43.60, lng: 1.44, label: 'Toulouse', cls: 'other' }]} cycle={[[3.88, 43.61], [7.27, 43.70], [1.44, 43.60]]} />
            <div className="absolute left-5 bottom-5 bg-white rounded-2xl px-3.5 py-2.5 text-[12.5px] text-navy shadow-lg max-w-[250px]"><b className="block">Un cycle à 3 s&apos;est fermé</b>Chacun obtient son souhait n°1.</div>
          </div>
        </W>
      </section>

      {/* ===== ENTRER ===== */}
      <section id="entrer" className="py-24 bg-white">
        <W>
          <div className="md:flex items-end justify-between gap-10">
            <div className="max-w-[560px]"><Kicker t="Entrer" /><H2 t="Une preuve. Une seule fois." /><p className="text-[17px] text-[#6F7789] mt-4">L&apos;app est réservée aux agents. Vous choisissez comment le prouver. Dans les deux cas, rien de ce que vous montrez n&apos;est conservé.</p></div>
            <div className="flex gap-1 bg-[#F0F3F8] rounded-2xl p-1 mt-6 md:mt-0">
              {([1, 2] as const).map(v => <button key={v} onClick={() => setVoie(v)} className={`px-5 py-3 rounded-xl text-[14px] font-bold ${voie === v ? 'bg-navy text-white' : 'text-[#6F7789]'}`}>{v === 1 ? 'Carte pro' : 'Email pro'}</button>)}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {(voie === 1 ? [
              [I.card, 'Votre adresse perso', 'Vous créez le compte avec votre email personnel. Un lien de connexion, pas de mot de passe. Rien ne passe par la boîte.'],
              [I.search, 'Votre carte pro, une seconde', 'Vous la photographiez dans l\'app. Elle est lue automatiquement, puis détruite. Aucune image n\'est enregistrée nulle part.'],
              [I.lock, 'Une empreinte, rien d\'autre', 'Du matricule il ne reste qu\'une empreinte impossible à inverser, qui sert uniquement à bloquer les doublons.'],
            ] : [
              [I.card, 'Votre adresse perso', 'Le compte reste sur votre email personnel. Aucun lien de connexion n\'ira jamais sur un poste de service.'],
              [I.search, 'Votre adresse pro nominative', 'Un code à 6 chiffres part sur prenom.nom@interieur.gouv.fr, @gendarmerie.interieur.gouv.fr ou @justice.fr. Le mail est neutre, il ne dit rien de l\'app.'],
              [I.lock, 'Le code, au service', 'Vous le saisissez dans les 7 jours. L\'adresse pro est ensuite chiffrée et ne sert plus qu\'à ça.'],
            ]).map(([d, h, p], i) => (
              <div key={h} className="relative bg-[#F7F9FC] rounded-3xl p-8">
                <span className="absolute right-6 top-6 text-[48px] font-extrabold text-[#E1E6EF] leading-none">{i + 1}</span>
                <span className="inline-flex w-12 h-12 rounded-2xl items-center justify-center bg-white text-navy shadow-sm"><Ico d={d} /></span>
                <h3 className="text-[19px] font-extrabold tracking-tight text-navy mt-6">{h}</h3>
                <p className="text-[14.5px] text-[#4B5160] mt-2 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
          <p className="text-[13.5px] text-[#6F7789] mt-6">{voie === 1 ? 'Le plus discret : aucun mail ne transite par votre service.' : 'Le plus rapide : rien à photographier.'} Faire les deux donne le badge « Vérifié deux fois », qui rassure les collègues avec qui vous permuterez.</p>
        </W>
      </section>

      {/* ===== DISCRÉTION ===== */}
      <section id="discretion" className="py-24 bg-[#F7F9FC]">
        <W>
          <div className="max-w-[640px]"><Kicker t="Discrétion" /><H2 t="Ce qu'on ne saura jamais." /><p className="text-[17px] text-[#6F7789] mt-4">La discrétion administrative n&apos;est pas une option. C&apos;est la raison d&apos;être de l&apos;app.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[
              [I.mask, 'Identité masquée', 'Nom, matricule, service : jamais affichés avant une acceptation mutuelle.'],
              [I.search, 'Aucun annuaire', 'Pas de recherche par nom. Vous ne voyez que vos correspondances. Vos collègues ne peuvent pas vous trouver.'],
              [I.trash, 'Carte pro détruite', 'La photo sert à vérifier, puis elle disparaît. Il ne reste qu\'une empreinte non réversible du matricule.'],
              [I.lock, 'Zéro accès extérieur', 'Ni l\'administration, ni la hiérarchie, ni les syndicats. Hébergé en Europe, chiffré, jamais vendu, sans publicité.'],
              [I.ecoute, 'Modules cloisonnés', 'Parler à un pair ou lire les voies de sortie n\'apparaît nulle part dans votre profil de permutation.'],
              [I.apres, 'Suppression totale', 'Compte, souhaits, historique : tout disparaît en un geste, immédiatement.'],
            ].map(([d, h, p]) => (
              <div key={h} className="bg-white rounded-3xl p-7 border border-[#E6E9F0]">
                <span className="inline-flex w-11 h-11 rounded-2xl items-center justify-center bg-[#DFF7EB] text-[#16804F]"><Ico d={d} /></span>
                <h3 className="text-[17px] font-extrabold tracking-tight text-navy mt-5">{h}</h3>
                <p className="text-[14px] text-[#4B5160] mt-2 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-3xl bg-navy text-white p-9 md:p-12 md:flex items-center gap-12">
            <p className="text-[20px] md:text-[22px] leading-[1.45] flex-1">« J&apos;ai passé des années dans la boîte. Je sais ce qu&apos;on ne dit pas au service : qu&apos;on veut partir, qu&apos;on ne dort plus, qu&apos;on regarde ailleurs. Hors Boîte, c&apos;est l&apos;endroit où on peut le dire sans que ça remonte. »</p>
            <div className="mt-6 md:mt-0 md:w-56 md:border-l md:border-white/15 md:pl-8"><b className="block">Le fondateur</b><span className="text-[13px] text-white/60">Ancien fonctionnaire de police</span></div>
          </div>
        </W>
      </section>

      {/* ===== TARIF ===== */}
      <section id="tarif" className="py-24 bg-white">
        <W>
          <div className="max-w-[640px]"><Kicker t="Tarif" /><H2 t="Gratuit pour commencer. 9,99 € quand ça devient concret." /></div>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="rounded-3xl p-8 border border-[#E6E9F0]"><span className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#A3AAB8]">Gratuit</span><div className="text-[44px] font-extrabold tracking-tight text-navy mt-1">0 €</div><ul className="mt-5 text-[14.5px] text-[#4B5160] space-y-2">{['Profil, souhaits, vérification', 'Savoir que des correspondances existent', 'Écoute entre collègues, sans limite', 'Fiches et voies de sortie de L\'après'].map(t => <li key={t} className="flex gap-2.5"><span className="text-mint font-extrabold">✓</span>{t}</li>)}<li className="flex gap-2.5 text-[#A3AAB8]"><span>–</span>Détail et mise en relation (alertes avec 48 h de retard)</li></ul></div>
            <div className="rounded-3xl p-8 text-white bg-navy"><span className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#8FB4FF]">Premium</span><div className="text-[44px] font-extrabold tracking-tight mt-1">9,99 €<span className="text-[15px] text-white/50 font-semibold tracking-normal"> / mois</span></div><ul className="mt-5 text-[14.5px] text-white/85 space-y-2">{['Matching à 2, 3 et 4 agents, en continu', 'Alertes immédiates', 'Mise en relation illimitée', 'Simulateur de points, historique par ville', 'Courriers prêts à signer, CV traduit', '1 € par mois reversé à l\'écoute entre collègues'].map(t => <li key={t} className="flex gap-2.5"><span className="text-[#8FF0C0] font-extrabold">✓</span>{t}</li>)}</ul><p className="text-[12.5px] text-white/50 mt-6">Sans engagement. Résiliable en un geste dès votre mutation obtenue.</p><Btn m="signup" t="Créer mon compte" cls="mt-6 w-full px-6 py-4 rounded-2xl text-[15px] font-bold text-navy bg-white" /></div>
          </div>
          <div id="ecoute" className="mt-10 flex items-center gap-5 rounded-2xl border border-[#FFD3D6] bg-[#FFF7F7] px-6 py-5"><span className="text-[30px] font-extrabold text-coral tracking-tight">3114</span><p className="text-[13.5px] text-[#4B5160]"><b className="text-navy">Vous êtes en danger ou en détresse ?</b> Numéro national de prévention du suicide, gratuit, 24 h/24, confidentiel. L&apos;écoute dans Hors Boîte est une écoute entre pairs, pas un service d&apos;urgence.</p></div>
        </W>
      </section>

      <footer className="border-t border-[#E6E9F0] py-8 text-[13px] text-[#6F7789]"><W cls="flex flex-wrap justify-between gap-3"><span>© Hors Boîte · PELOSO CORPORATION · Hébergé en Europe</span><span className="flex gap-5"><a href="#">Confidentialité</a><a href="#">CGV</a><a href="#">Mentions légales</a><a href="mailto:contact@horsboite.fr">contact@horsboite.fr</a></span></W></footer>

      <AuthModal open={!!modal} initial={modal ?? 'signup'} onClose={() => setModal(null)} />
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
      <div className="flex items-center justify-between mb-3">
        <Image src="/logo.png" alt="Hors Boîte" width={150} height={40} priority />
        <span className={premium ? 'pill-mint' : 'pill-bleu'}>{premium ? 'Premium' : 'Gratuit'}</span>
      </div>
      <Link href="/permut" className="block relative rounded-xl3 overflow-hidden bg-gradient-to-b from-[#DCE5F5] to-[#E9EEF7] p-3 pb-2 shadow-[0_14px_34px_-16px_rgba(15,27,51,.22)]">
        <div className="absolute left-3 top-3 bg-white/90 rounded-xl px-2.5 py-1.5 text-[10.5px] text-[#6F7789] leading-relaxed z-10">
          <i className="inline-block w-2 h-2 rounded-full bg-bleu mr-1.5 align-middle" />Vous<br /><i className="inline-block w-2 h-2 rounded-full bg-mint mr-1.5 align-middle" />Votre souhait
        </div>
        <div className="absolute right-3 top-3 bg-navy text-white rounded-xl px-2.5 py-1.5 text-[10.5px] text-right leading-tight z-10"><b className="block text-[16px] text-[#8FF0C0]"><CompteurLive initial={halos.reduce((s, h) => s + h.n, 0)} /></b>collègues en recherche<br />en ce moment</div>
        <CarteFrance points={points} halos={halos} cycle={me && wish ? [[me.lng, me.lat], [wish.lng, wish.lat]] : undefined} />
      </Link>

      {dernier ? (
        <Link href={`/permut/${dernier.id}`} className="card block mt-3">
          <div className="flex justify-between items-center"><b className="text-[15px] text-navy">{dernier.type === 'directe' ? 'Une permutation directe est possible' : `Un cycle à ${dernier.type === 'cycle3' ? 3 : 4} s'est fermé pour vous`}</b><span className="pill-mint">{dernier.score} %</span></div>
          <div className="sub mt-1">{dernier.ville_actuelle} → {dernier.ville_cible} · {nb} correspondance{nb > 1 ? 's' : ''} au total</div>
          {!premium && <span className="pill-amber mt-2">Reçu avec 48 h de retard · les Premium sont prévenus en premier</span>}
        </Link>
      ) : (
        <div className="card mt-3"><b className="text-[15px] text-navy">Rien de neuf</b><div className="sub mt-1">Vos souhaits sont actifs. Le matching tourne toutes les heures.</div></div>
      )}

      <div className="flex gap-2.5 mt-3">
        <Link href="/ecoute" className="flex-1 rounded-2xl px-3 py-3.5 text-white font-bold bg-gradient-to-br from-[#3ED18B] to-[#149A5E] shadow-lg leading-tight">Parler<small className="block text-[10.5px] font-semibold opacity-85">{refs?.length ?? 0} collègue{(refs?.length ?? 0) > 1 ? 's' : ''} dispo</small></Link>
        <Link href="/apres" className="flex-1 rounded-2xl px-3 py-3.5 text-white font-bold bg-gradient-to-br from-[#A66BFF] to-[#6C3BC9] shadow-lg leading-tight">L&apos;après<small className="block text-[10.5px] font-semibold opacity-85">Préparer sans le dire</small></Link>
      </div>
      <Link href="/points" className="flex justify-between items-center mt-3 bg-white rounded-2xl px-3.5 py-3 text-[12.5px] text-[#6F7789]"><span>Mes points de mutation</span><b className="text-navy">Simuler ›</b></Link>
      {(cal ?? []).map(c => <div key={c.libelle} className="flex justify-between items-center mt-2 bg-white rounded-2xl px-3.5 py-3 text-[12.5px] text-[#6F7789]"><span>{c.libelle}</span><b className="text-navy">Clôture le {new Date(c.cloture).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</b></div>)}
    </>
  );
}
HB_EOF

mkdir -p "supabase/migrations"
cat > "supabase/migrations/0003_stats_publiques.sql" << 'HB_EOF'
-- Statistiques publiques agrégées, alimentées par trigger, lisibles par tous (anon compris).
-- Jamais de lien avec un profil : uniquement des compteurs.
create table if not exists stats_publiques (
  cle text primary key,
  valeur int not null default 0,
  maj timestamptz not null default now()
);
insert into stats_publiques (cle, valeur) values ('en_recherche', 0), ('cycles_fermes', 0) on conflict do nothing;

alter table stats_publiques enable row level security;
create policy stats_lecture on stats_publiques for select to anon, authenticated using (true);

-- Recalcule le nombre de profils vérifiés ayant au moins un souhait
create or replace function maj_stat_en_recherche() returns trigger language plpgsql security definer as $$
begin
  update stats_publiques set valeur = (
    select count(*) from profils p
    where (p.verifie_carte or p.verifie_mail_pro) and exists (select 1 from souhaits s where s.profil_id = p.id)
  ), maj = now() where cle = 'en_recherche';
  return null;
end $$;
drop trigger if exists trg_stat_profils on profils;
create trigger trg_stat_profils after insert or update or delete on profils for each statement execute function maj_stat_en_recherche();
drop trigger if exists trg_stat_souhaits on souhaits;
create trigger trg_stat_souhaits after insert or update or delete on souhaits for each statement execute function maj_stat_en_recherche();

create or replace function maj_stat_cycles() returns trigger language plpgsql security definer as $$
begin
  update stats_publiques set valeur = (select count(*) from correspondances where statut = 'confirmee'), maj = now() where cle = 'cycles_fermes';
  return null;
end $$;
drop trigger if exists trg_stat_corr on correspondances;
create trigger trg_stat_corr after insert or update on correspondances for each statement execute function maj_stat_cycles();

-- Realtime sur cette table uniquement
alter publication supabase_realtime add table stats_publiques;

-- Halos par département : uniquement au-dessus d'un plancher, pour ne jamais identifier quelqu'un
create or replace view v_halos_departements with (security_invoker = false) as
select s.departement, count(*)::int as n, avg(s.lat)::numeric as lat, avg(s.lng)::numeric as lng
from profils p join services s on s.id = p.service_id
where (p.verifie_carte or p.verifie_mail_pro)
group by s.departement having count(*) >= 10;
grant select on v_halos_departements to anon, authenticated;
HB_EOF

echo "Carte et compteur mis à jour."
echo "Supabase > SQL Editor : exécuter supabase/migrations/0003_stats_publiques.sql"