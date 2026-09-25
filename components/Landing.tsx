'use client';
import { useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import CarteFrance from './CarteFrance';
import CompteurLive from './CompteurLive';
import Vignette from './Vignette';
import Preinscription from './Preinscription';
import Compteur from './Compteur';
import BarreChiffres from './BarreChiffres';

const PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH === '1';

/** Formulaire de contact : envoi par le serveur (Resend), confirmation à l'écran. */
function FormContact() {
  const [f, setF] = useState({ institution: 'Police nationale', email: '', message: '', piege: '' });
  const [etat, setEtat] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle'); const [err, setErr] = useState('');
  const envoyer = async () => {
    setEtat('busy'); setErr('');
    const j = await fetch('/api/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }).then(r => r.json()).catch(() => ({ ok: false, message: 'Réseau indisponible.' }));
    if (j.ok) setEtat('ok'); else { setEtat('err'); setErr(j.message ?? 'Erreur'); }
  };
  if (etat === 'ok') return <div className="max-w-[640px] mx-auto mt-9 bg-[#DFF7EB] border border-[#CDEFDC] rounded-3xl p-6 text-center"><b className="text-[#16804F] text-[16px]">Message envoyé.</b><p className="text-[13.5px] text-[#3B4457] mt-1">{f.email ? 'Réponse sur votre adresse sous 48 h.' : 'Sans adresse, pas de réponse possible, mais le message est bien lu.'}</p></div>;
  return (
    <div className="max-w-[640px] mx-auto mt-9 bg-white border border-[#E6E9F0] rounded-3xl p-6">
      <label className="block text-[12px] text-[#6F7789]">Institution<select className="field mt-1" value={f.institution} onChange={e => setF({ ...f, institution: e.target.value })}><option>Police nationale</option><option>Gendarmerie nationale (ouverture prochaine)</option><option>Administration pénitentiaire (ouverture prochaine)</option><option>Autre</option></select></label>
      <label className="block text-[12px] text-[#6F7789] mt-3">Email (facultatif, pour la réponse)<input type="email" className="field mt-1" placeholder="vous@exemple.fr" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
      <label className="block text-[12px] text-[#6F7789] mt-3">Message<textarea rows={5} className="field mt-1" placeholder="Une idée, un bug, une remarque… Ne mettez ni nom, ni service, ni matricule." value={f.message} onChange={e => setF({ ...f, message: e.target.value })} maxLength={2000} /></label>
      <input className="hidden" tabIndex={-1} autoComplete="off" value={f.piege} onChange={e => setF({ ...f, piege: e.target.value })} aria-hidden />
      {etat === 'err' && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
      <button className="btn mt-4" onClick={envoyer} disabled={etat === 'busy' || f.message.trim().length < 10}>{etat === 'busy' ? 'Envoi…' : 'Envoyer'}</button>
    </div>
  );
}
const OUVERTURE = process.env.NEXT_PUBLIC_OUVERTURE || '2026-10-23T08:00:00+02:00';
const OFFRE_LANCEMENT = process.env.NEXT_PUBLIC_OFFRE_LANCEMENT !== '0';
const OUVERTURE_TXT = new Date(OUVERTURE).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const HALOS = [{ lat: 48.86, lng: 2.35, n: 203, nom: 'Paris' }, { lat: 45.76, lng: 4.83, n: 61, nom: 'Lyon' }, { lat: 43.30, lng: 5.37, n: 74, nom: 'Marseille' }, { lat: 50.63, lng: 3.06, n: 88, nom: 'Lille' }, { lat: 44.84, lng: -0.58, n: 37, nom: 'Bordeaux' }, { lat: 47.22, lng: -1.55, n: 29, nom: 'Nantes' }, { lat: 48.58, lng: 7.75, n: 46, nom: 'Strasbourg' }, { lat: 43.61, lng: 3.88, n: 52, nom: 'Montpellier' }, { lat: 43.60, lng: 1.44, n: 67, nom: 'Toulouse' }, { lat: 43.70, lng: 7.27, n: 58, nom: 'Nice' }, { lat: 49.44, lng: 1.1, n: 23, nom: 'Rouen' }, { lat: 45.19, lng: 5.72, n: 19, nom: 'Grenoble' }];
const Ico = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const I = { clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', search: 'M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM20 20l-4.5-4.5', eye: 'M12 5c-5 0-8.5 4-9.5 7 1 3 4.5 7 9.5 7s8.5-4 9.5-7c-1-3-4.5-7-9.5-7zM3 3l18 18', permut: 'M4 7h11l-3-3M20 17H9l3 3M4 17a2 2 0 1 0 0 .1M20 7a2 2 0 1 0 0 .1', list: 'M4 5h16v14H4zM8 9h8M8 13h5', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', shield: 'M12 3l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V6zM9 12l2 2 4-4' };

const ANN = [
  ['GPX · CSP Nice → Toulouse, Montpellier ou Béziers', 'Sécurité publique · nuit 4/2 · 7 ans · départ mars 2027', 'Alpes-Maritimes (06) · il y a 2 h', '06', ['31', '34'], true, '92 %'],
  ['Gendarme · BTA Bayonne → Bretagne (29, 56, 35)', 'Brigade territoriale · 5 ans · logement en caserne libéré', 'Pyrénées-Atlantiques (64) · hier', '64', ['29', '56', '35'], false, null],
  ['Surveillant · MA Fleury-Mérogis → Toulouse ou Bordeaux', 'Détention · 3 ans · SP · rapprochement de conjoint', 'Essonne (91) · hier', '91', ['31', '33'], false, '81 %'],
  ['Brigadier · CRS 60 Montfavet → Lyon ou Grenoble', 'CRS · 9 ans · départ immédiat', 'Vaucluse (84) · il y a 3 j', '84', ['69', '38'], false, null],
  ['GPX · DSPAP Paris 18e → La Réunion (CIMM)', 'SP jour · 6 ans · CIMM reconnu 974', 'Paris (75) · il y a 4 j', '75', ['974'], false, '76 %'],
  ['MDL/Chef · PSIG Lille → Toulouse ou Montpellier', 'PSIG · 8 ans · départ dès plan annuel', 'Nord (59) · il y a 5 j', '59', ['31', '34'], false, null],
] as const;
const Ann = ({ a, compact = false }: { a: typeof ANN[number]; compact?: boolean }) => (
  <div className={`grid gap-2.5 border border-[#E6E9F0] rounded-2xl bg-white ${compact ? 'grid-cols-[56px_1fr] p-2' : 'grid-cols-[64px_1fr] p-2.5'}`}>
    <Vignette de={{ departement: a[3] }} vers={a[4].map(d => ({ departement: d }))} className={compact ? 'w-14 h-14 rounded-lg' : 'w-16 h-16 rounded-lg'} />
    <div className="min-w-0"><div className="flex gap-1 mb-0.5">{a[5] && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFF3D6] text-[#9A6A00]">Mise en avant</span>}{a[6] && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#DFF7EB] text-[#16804F]">Compatible {a[6]}</span>}</div><b className="block text-[12px] text-navy leading-tight">{a[0]}</b><span className="block text-[10.5px] text-[#3B4457]">{a[1]}</span><small className="text-[10px] text-[#A3AAB8]">{a[2]}</small></div>
  </div>
);

export default function Landing() {
  const [modal, setModal] = useState<null | 'signup' | 'login'>(null);
  const [menu, setMenu] = useState(false);
  const [erreurLien, setErreurLien] = useState(false);
  useEffect(() => { if (new URLSearchParams(location.search).get('erreur')?.startsWith('lien')) { setErreurLien(true); setModal('login'); } }, []);
  const Btn = ({ m, t, cls = '' }: { m: 'signup' | 'login'; t: string; cls?: string }) => <button onClick={() => setModal(m)} className={cls}>{t}</button>;
  const H2 = ({ t, light = false }: { t: string; light?: boolean }) => <h2 className={`text-[32px] md:text-[36px] font-extrabold tracking-[-1.3px] leading-[1.1] ${light ? 'text-white' : 'text-navy'}`}>{t}</h2>;
  const Center = ({ t, s }: { t: string; s: string }) => <div className="text-center max-w-[720px] mx-auto"><H2 t={t} /><p className="text-[16px] text-[#6F7789] mt-2.5">{s}</p></div>;
  const Card = ({ d, c, h, p }: { d: string; c: string; h: string; p: string }) => <div className="bg-white border border-[#E6E9F0] rounded-[20px] p-6"><span className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-3.5 ${c}`}><Ico d={d} /></span><h3 className="text-[16px] font-extrabold text-navy">{h}</h3><p className="text-[13.5px] text-[#3B4457] mt-1.5">{p}</p></div>;
  const W = ({ children, cls = '' }: { children: React.ReactNode; cls?: string }) => <div className={`max-w-[1140px] mx-auto px-6 ${cls}`}>{children}</div>;
  const nav = [['#defis', 'Le problème'], ['#solution', 'La solution'], ['#services', 'Fonctionnalités'], ['#tarifs', 'Tarifs'], ['#contact', 'Contact']];

  return (
    <div className="w-full text-[#141A26] bg-white">
      <header className="sticky top-0 z-30 bg-white border-b border-[#E6E9F0] shadow-[0_1px_0_rgba(15,27,51,.04)]">
        <W cls="h-[68px] flex items-center justify-between gap-4">
          <a href="#top"><img src="/logo.png" alt="La Bourse aux permut'" className="h-9 w-auto" /></a>
          <nav className="hidden lg:flex">{nav.map(([h, t]) => <a key={h} href={h} className="text-[13.5px] font-semibold text-[#3B4457] px-2.5 py-2 rounded-lg hover:bg-paper whitespace-nowrap">{t}</a>)}</nav>
          <div className="hidden md:flex gap-2 shrink-0">{PRELAUNCH ? <a href="#preinscription" className="btn !w-auto !py-2.5 px-4 text-[14px] whitespace-nowrap">Être prévenu à l&apos;ouverture</a> : <><Btn m="login" t="Connexion" cls="btn-ghost !w-auto !py-2.5 px-4 text-[14px] whitespace-nowrap" /><Btn m="signup" t="Créer mon compte" cls="btn !w-auto !py-2.5 px-4 text-[14px] whitespace-nowrap" /></>}</div>
          <button className="md:hidden w-10 h-10 rounded-lg border border-[#E6E9F0] flex items-center justify-center" onClick={() => setMenu(!menu)} aria-label="Menu"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg></button>
        </W>
        {menu && <div className="md:hidden border-t border-[#E6E9F0] bg-white px-6 py-4">{nav.map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)} className="block py-3 text-[15px] font-semibold text-navy border-b border-paper">{t}</a>)}{PRELAUNCH ? <a href="#preinscription" onClick={() => setMenu(false)} className="btn mt-4">Être prévenu à l&apos;ouverture</a> : <div className="flex gap-2 mt-4"><Btn m="login" t="Connexion" cls="btn-ghost flex-1" /><Btn m="signup" t="Créer mon compte" cls="btn flex-1" /></div>}</div>}
      </header>

      {/* HERO */}
      <section id="top" className="relative isolate min-h-[calc(100svh-68px)] md:min-h-[780px] flex items-center bg-[#0B1426] text-white overflow-hidden">
        <picture className="absolute inset-0 -z-10 block"><source media="(max-width: 767px)" srcSet="/hero-mobile.jpg" /><img src="/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-[65%_center]" /></picture>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,20,38,.92)_0%,rgba(11,20,38,.8)_35%,rgba(11,20,38,.35)_65%,rgba(11,20,38,.2)_100%)]" /><div className="absolute inset-x-0 bottom-0 h-40 -z-10 bg-gradient-to-t from-[#0B1426] to-transparent" />
        <W cls="py-24 w-full"><div className="max-w-[680px]">
          <span className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[1.5px] uppercase text-[#8FB4FF]"><i className="w-1.5 h-1.5 rounded-full bg-[#8FF0C0]" />Police nationale · Gendarmerie et pénitentiaire bientôt</span>
          <h1 className="text-[42px] md:text-[64px] font-extrabold tracking-[-2.2px] leading-[1.0] mt-5">La Bourse aux permut&apos;.<br /><span className="text-white/60">Ici, personne ne le sait.</span></h1>
          <p className="text-[17px] md:text-[19px] text-white/80 max-w-[54ch] mt-6">Les annonces de permutation entre collègues, et le matching qui ferme les cycles à 2, 3 ou 4 agents. Sans la hiérarchie, sans les syndicats, sans trace.</p>
          {PRELAUNCH ? (<div className="mt-8" id="preinscription"><span className="inline-block text-[12px] font-bold tracking-[1.5px] uppercase text-[#8FF0C0] mb-2">Ouverture le {OUVERTURE_TXT}</span><div className="mb-4"><Compteur date={OUVERTURE} /></div><Preinscription dark /></div>) : (<><div className="flex flex-wrap gap-3 mt-8"><Btn m="signup" t="Créer mon compte" cls="px-7 py-4 rounded-2xl text-[16px] font-bold text-navy bg-white shadow-[0_16px_40px_-14px_rgba(0,0,0,.6)]" /><Btn m="login" t="J'ai déjà un compte" cls="px-7 py-4 rounded-2xl text-[16px] font-bold text-white bg-white/10 border border-white/25 backdrop-blur" /></div>
          <div className="text-[12.5px] text-white/50 mt-5">Inscription gratuite avec votre email perso · Vérification carte pro ou mail pro · Premium 9,99 €/mois, sans engagement</div>{OFFRE_LANCEMENT && <div className="mt-4 flex items-start gap-2.5 bg-[#22B573]/20 border border-[#22B573]/40 rounded-2xl px-4 py-3 text-[13.5px] text-white max-w-[560px]"><span className="w-2 h-2 rounded-full bg-[#8FF0C0] mt-[7px] shrink-0" /><span><b>Lancement :</b> 1 mois de Premium offert aux 100 premiers comptes vérifiés, sans carte bancaire.</span></div>}</>)}
        </div></W>
      </section>
      <BarreChiffres prelaunch={PRELAUNCH} offre={OFFRE_LANCEMENT} ouverture={OUVERTURE} />

      {/* DÉFIS */}
      <section id="defis" className="py-20"><W>
        <Center t="Les vraies galères de la mutation" s="Tous ceux qui ont voulu rentrer chez eux les connaissent." />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-11">
          <Card d={I.clock} c="bg-[#FFE6E8] text-[#C8323B]" h="Des années d'attente" p="Le barème, les points, les vœux reconduits. Pour Nice ou La Réunion, on parle de 5 à 10 ans. Sans garantie." />
          <Card d={I.search} c="bg-[#FFF3D6] text-[#9A6A00]" h="Le permutant introuvable" p="Il existe sûrement quelqu'un qui veut faire le chemin inverse. Mais où ? Le collègue du collègue, les groupes Facebook, le hasard." />
          <Card d={I.eye} c="bg-[#E6EEFF] text-bleud" h="La hiérarchie qui sait" p="Chercher à partir, ça se voit, ça se dit, ça se paie. Sur un groupe public, votre nom et votre service sont sous les yeux de tous." />
          <Card d={I.permut} c="bg-[#DFF7EB] text-[#16804F]" h="Les cycles invisibles" p="Vous voulez Nice, Nice veut Toulouse, Toulouse veut votre poste. Aucune annonce ne le dit. Personne ne peut le voir. Sauf un algorithme." />
        </div>
      </W></section>

      {/* SOLUTION */}
      <section id="solution" className="py-20 bg-gradient-to-br from-navy2 to-navy text-white"><W cls="grid lg:grid-cols-[1fr_1.2fr] gap-14 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[1.5px] uppercase text-[#8FB4FF]"><i className="w-1.5 h-1.5 rounded-full bg-[#8FF0C0]" />La solution</span>
          <div className="mt-3"><H2 t="Pensée par un ancien policier, pour des collègues." light /></div>
          <p className="text-[16px] text-[#A9B7D6] mt-3">La Bourse aux permut&apos; réunit au même endroit les annonces de permutation, anonymes par construction, et un matching qui recroise toutes les heures les souhaits de tous les agents vérifiés. Police, gendarmerie, pénitentiaire, chacun dans son couloir.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">{[['Réservée aux agents vérifiés', 'Carte pro lue puis détruite, ou code sur votre mail pro'], ['Anonyme par construction', 'Un grade, une affectation, des villes. Jamais un nom.'], ['Matching à 2, 3 ou 4', 'Les cycles que personne ne voit, fermés automatiquement'], ['Zéro accès extérieur', 'Ni administration, ni hiérarchie, ni syndicats']].map(([b, s]) => <div key={b} className="bg-white/[.07] border border-white/10 rounded-2xl px-3.5 py-3"><b className="block text-[14px]">{b}</b><span className="text-[12.5px] text-[#A9B7D6]">{s}</span></div>)}</div>
        </div>
        <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none aspect-[4/3] text-[#141A26]">
          {/* Écran de bureau */}
          <div className="absolute left-0 top-0 w-[74%]">
            <div className="rounded-[14px] bg-[#0B1426] p-[1.6%] pb-[3.2%] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)] border border-white/10">
              <div className="rounded-[8px] overflow-hidden bg-[#F4F6FA] aspect-[16/10] relative">
                <div className="absolute inset-0 w-[154%] h-[154%] origin-top-left scale-[.65]">
                <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 border-b border-[#E6E9F0]"><img src="/logo.png" alt="" className="h-3.5 w-auto" /><span className="bg-bleu text-white text-[7px] font-bold px-1.5 py-0.5 rounded">+ Déposer une annonce</span><span className="flex-1 bg-paper rounded px-2 py-0.5 text-[7px] text-[#A3AAB8]">Une ville, un département, un service…</span><span className="text-[7px] font-semibold text-[#6F7789]">Annonces · Mes matchs · Favoris · Compte</span></div>
                <div className="flex gap-1 px-2.5 py-1 bg-white border-b border-[#E6E9F0]">{['Toutes', 'Police', 'Gendarmerie', 'Pénitentiaire', 'Vers mon dép.', 'Mises en avant'].map((c, i) => <span key={c} className={`text-[6.5px] font-semibold px-1.5 py-0.5 rounded-full border ${i === 0 ? 'bg-navy text-white border-navy' : 'border-[#E6E9F0] text-[#3B4457]'}`}>{c}</span>)}</div>
                <div className="grid grid-cols-[72px_1fr] gap-2 p-2">
                  <div className="space-y-1.5">
                    <div className="rounded-md bg-navy text-white p-1.5"><b className="block text-[7px]">Matching intelligent</b><span className="text-[6px] text-[#A9B7D6]">3 correspondances</span><span className="block mt-1 bg-white text-navy text-[6px] font-bold rounded px-1 py-0.5 text-center">Voir mes matchs</span></div>
                    {['Institution', 'Poste actuel', 'Souhaite aller vers'].map(t => <div key={t} className="rounded-md bg-white border border-[#E6E9F0] p-1.5"><b className="block text-[6.5px] text-navy">{t}</b><i className="block h-1 w-3/4 bg-[#E6E9F0] rounded mt-1" /><i className="block h-1 w-1/2 bg-[#E6E9F0] rounded mt-0.5" /></div>)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end"><b className="text-[8.5px] text-navy">Annonces de permutation</b><span className="text-[6px] text-[#6F7789]">triées par pertinence pour vous</span></div>
                    {ANN.slice(0, 4).map((a, i) => <Ann key={i} a={a} compact />)}
                  </div>
                </div>
                </div>
              </div>
            </div>
            <div className="mx-auto w-[22%] h-[7%] bg-gradient-to-b from-[#C9CFDA] to-[#9AA3B2] mt-[-1px] [clip-path:polygon(15%_0,85%_0,100%_100%,0_100%)]" />
            <div className="mx-auto w-[46%] h-[6px] rounded-full bg-[#B8BFCB] shadow-[0_6px_14px_-4px_rgba(0,0,0,.35)]" />
          </div>
          {/* Portable */}
          <div className="absolute right-0 bottom-[2%] w-[54%]">
            <div className="mx-[6%] rounded-t-[10px] bg-[#0B1426] p-[1.8%] pb-0 shadow-[0_30px_60px_-24px_rgba(0,0,0,.7)] border border-white/10 border-b-0">
              <div className="rounded-t-[5px] overflow-hidden bg-[#F4F6FA] aspect-[16/10] relative">
                <div className="absolute inset-0 w-[143%] h-[143%] origin-top-left scale-[.7]">
                <div className="flex items-center gap-2 bg-white px-2 py-1 border-b border-[#E6E9F0]"><img src="/logo.png" alt="" className="h-3 w-auto" /><span className="flex-1 bg-paper rounded px-1.5 py-0.5 text-[6px] text-[#A3AAB8]">Rechercher…</span><span className="text-[6px] font-semibold text-bleu">Mes matchs</span></div>
                <div className="p-2">
                  <div className="flex justify-between items-end mb-1.5"><b className="text-[8px] text-navy">Mes matchs</b><span className="text-[6px] text-[#6F7789]">3 correspondances · 1 cycle fermé</span></div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[['Cycle à 3', '92%', 'Montpellier → Nice → Lyon', '#22B573', true], ['Directe', '74%', 'Montpellier ↔ Nice', '#F2A900', false], ['Cycle à 4', '68%', 'Montpellier → Nice → Lyon → Marseille', '#F2A900', false], ['Directe', '61%', 'Montpellier ↔ Béziers', '#F2A900', false]].map(([t, p, r, c, top], i) => (
                      <div key={i} className={`rounded-md bg-white border p-1.5 ${top ? 'border-[#BFE9D3]' : 'border-[#E6E9F0]'}`}><div className="flex justify-between items-center"><b className="text-[7px] text-navy">{t}</b><span className="w-5 h-5 rounded-full flex items-center justify-center text-[5.5px] font-extrabold text-navy" style={{ background: `conic-gradient(${c} ${parseInt(String(p))}%, #E6E9F0 0)` }}><span className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">{p}</span></span></div><span className="block text-[6px] text-[#3B4457] mt-0.5">{r}</span><span className={`block mt-1 text-[6px] font-bold rounded px-1 py-0.5 text-center ${top ? 'bg-bleu text-white' : 'border border-[#E6E9F0] text-navy'}`}>{top ? 'Proposer la mise en relation' : 'Voir le détail'}</span></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-1.5">{[['24 ×', 'par jour, souhaits recroisés'], ['0', 'nom visible avant accord'], ['2 à 4', 'agents par cycle']].map(([n, t]) => <div key={t} className="rounded-md bg-white border border-[#E6E9F0] p-1.5"><b className="block text-[9px] text-navy leading-none">{n}</b><span className="text-[5.5px] text-[#6F7789]">{t}</span></div>)}</div>
                </div>
                </div>
              </div>
            </div>
            <div className="h-[10px] rounded-b-[8px] bg-gradient-to-b from-[#D9DEE7] to-[#AEB6C4] shadow-[0_10px_20px_-8px_rgba(0,0,0,.5)] relative"><span className="absolute left-1/2 -translate-x-1/2 top-0 w-[12%] h-[3px] rounded-b bg-[#8F98A8]" /></div>
          </div>
        </div>
      </W></section>

      {/* SERVICES */}
      <section id="services" className="py-20"><W>
        <Center t="Deux façons de trouver son permutant" s="Vous cherchez vous-même, ou vous laissez l'algorithme chercher pour vous. Les deux marchent ensemble." />
        <div className="grid md:grid-cols-2 gap-6 mt-12 items-stretch">
          <div className="bg-white border border-[#E6E9F0] rounded-[26px] p-6 md:p-8 flex flex-col">
            <span className="inline-flex w-12 h-12 rounded-2xl items-center justify-center bg-[#E6EEFF] text-bleud mb-4"><Ico d={I.list} /></span>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy">Les annonces de permutation</h3>
            <p className="text-[15px] text-[#3B4457] my-3">Comme des petites annonces, mais sans nom. Chaque annonce décrit un poste (grade, affectation, type de service, ancienneté) et des villes souhaitées. Vous filtrez par département, vous proposez, et l&apos;identité n&apos;est révélée qu&apos;après accord mutuel.</p>
            <div className="grid gap-y-1.5 text-[13.5px] text-[#3B4457] mb-5">{['Filtres par institution et département', 'Score de compatibilité avec vos souhaits', 'Mise en avant 7 jours à 4,99 €', 'Favoris et alertes'].map(t => <span key={t}><span className="text-mint font-extrabold mr-2">✓</span>{t}</span>)}</div>
            <div className="mt-auto bg-paper rounded-2xl p-3 flex flex-col gap-2">{ANN.map((a, i) => <Ann key={i} a={a} />)}</div>
          </div>
          <div className="bg-white border border-[#E6E9F0] rounded-[26px] p-6 md:p-8 flex flex-col">
            <span className="inline-flex w-12 h-12 rounded-2xl items-center justify-center bg-[#DFF7EB] text-[#16804F] mb-4"><Ico d={I.permut} /></span>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy">Le matching intelligent</h3>
            <p className="text-[15px] text-[#3B4457] my-3">Toutes les heures, l&apos;algorithme croise les souhaits de tous les agents vérifiés de votre institution et ferme les cycles : à deux, à trois, à quatre. Vous allez à Nice, Nice va à Toulouse, Toulouse vient chez vous. Personne n&apos;a rien demandé à personne.</p>
            <div className="grid gap-y-1.5 text-[13.5px] text-[#3B4457] mb-5">{['Cycles à 2, 3 ou 4 agents', 'Score et points de friction expliqués', 'Identités révélées après accord de tous', 'Courriers de permutation prêts à signer'].map(t => <span key={t}><span className="text-mint font-extrabold mr-2">✓</span>{t}</span>)}</div>
            <div className="mt-auto rounded-2xl bg-gradient-to-b from-[#DCE5F5] to-[#E9EEF7] p-4"><CarteFrance halos={HALOS} points={[{ lat: 43.61, lng: 3.88, label: 'Montpellier', cls: 'me' }, { lat: 43.70, lng: 7.27, label: 'Nice', cls: 'wish' }, { lat: 45.76, lng: 4.83, label: 'Lyon', cls: 'other' }]} cycle={[[3.88, 43.61], [7.27, 43.70], [4.83, 45.76]]} outreMer omCounts={{ Guadeloupe: 31, Martinique: 27, Guyane: 18, 'Réunion': 63, Mayotte: 22, 'Nouvelle-Calédonie': 14, 'Polynésie': 9, 'St-Pierre-et-Miquelon': 2 }} /><p className="text-[11px] text-[#6F7789] mt-2">Illustration. Les halos passeront sur les chiffres réels par département dès l&apos;ouverture ; survolez une ville pour voir le nombre.</p></div>
          </div>
        </div>
      </W></section>

      {/* COMMENT */}
      <section id="comment" className="py-20 bg-paper"><W>
        <Center t="Comment ça marche ?" s="Quatre étapes, une fois." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-11">
          {[['Créez votre compte', 'Toujours avec votre adresse personnelle. Un lien de confirmation, puis votre mot de passe une fois vérifié.'], ['Prouvez que vous êtes des nôtres', 'Carte pro photographiée puis détruite dans la seconde, ou code sur votre mail pro nominatif. Au choix.'], ['Déposez votre annonce', 'Votre poste, vos villes souhaitées. Champs fermés uniquement, aucun texte libre. Gratuit.'], ['Répondez ou laissez faire', 'Parcourez les annonces, ou attendez que le matching ferme un cycle. Mise en relation, puis révélation quand tous ont accepté.']].map(([h, p], i) => <div key={h} className="text-center px-2"><div className="relative w-14 h-14 rounded-[18px] bg-bleu text-white font-extrabold text-[18px] flex items-center justify-center mx-auto mb-3.5">{i + 1}<i className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-navy text-white text-[11px] not-italic font-extrabold flex items-center justify-center border-2 border-white">✓</i></div><h3 className="text-[16px] font-extrabold text-navy">{h}</h3><p className="text-[13.5px] text-[#6F7789] mt-1.5">{p}</p></div>)}
        </div>
      </W></section>

      {/* SÉCURITÉ */}
      <section id="securite" className="py-20"><W>
        <Center t="Votre discrétion, notre seule règle" s="La discrétion administrative n'est pas une option. C'est la raison d'être du site." />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-11">
          <Card d={I.eye} c="bg-[#E6EEFF] text-bleud" h="Identité masquée" p="Nom, matricule, service : jamais affichés avant l'accord mutuel. Aucun annuaire, aucune recherche par nom." />
          <Card d={I.trash} c="bg-[#FFE6E8] text-[#C8323B]" h="Carte pro détruite" p="La photo sert à vérifier, puis elle disparaît. Il ne reste qu'une empreinte non réversible du matricule." />
          <Card d={I.lock} c="bg-[#DFF7EB] text-[#16804F]" h="Données chiffrées en Europe" p="Identités dans une table séparée, chiffrées. Aucun accès pour l'administration, la hiérarchie ou les syndicats. Jamais vendues, sans publicité." />
          <Card d={I.shield} c="bg-[#FFF3D6] text-[#9A6A00]" h="Suppression totale" p="Compte, annonce, souhaits, historique : tout disparaît en un geste, immédiatement." />
        </div>
        <div className="mt-7 bg-[#E6EEFF] border border-[#CFDCFF] rounded-[20px] px-6 py-5 text-center"><b className="block text-navy text-[16px]">Une communauté vérifiée, entre collègues</b><span className="text-[13.5px] text-[#3B4457]">Tous les membres sont des agents en activité dont le statut a été vérifié. Policiers, gendarmes et pénitentiaires ne sont jamais mélangés dans un cycle.</span></div>
      </W></section>

      {/* TARIFS */}
      <section id="tarifs" className="py-20 bg-paper"><W>
        <Center t="Gratuit pour commencer. 9,99 € quand ça devient concret." s="Sans engagement, sans période d'essai. Résiliable en un geste dès votre mutation obtenue." />
        <div className="grid md:grid-cols-2 gap-5 mt-11 max-w-[860px] mx-auto">
          <div className="rounded-3xl p-7 border-[1.5px] border-[#E6E9F0] bg-white"><span className="text-[12px] font-bold tracking-[1px] uppercase text-[#A3AAB8]">Gratuit</span><div className="text-[42px] font-extrabold tracking-tight text-navy">0 €</div><ul className="my-4 text-[14px] space-y-2">{['Vérification, profil, souhaits', 'Publier son annonce, anonyme', '3 annonces en clair, les autres floutées', 'Matching automatique, alertes à +48 h'].map(t => <li key={t} className="flex gap-2.5"><span className="text-mint font-extrabold">✓</span>{t}</li>)}<li className="flex gap-2.5 text-[#A3AAB8]"><span>–</span>Répondre aux annonces, mise en relation</li></ul>{PRELAUNCH ? <a href="#preinscription" className="btn-ghost">Être prévenu à l&apos;ouverture</a> : <Btn m="signup" t="Commencer gratuitement" cls="btn-ghost" />}</div>
          <div className="relative rounded-3xl p-7 text-white bg-gradient-to-br from-navy2 to-navy"><span className="absolute right-5 top-5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-mint text-white">Recommandé</span><span className="text-[12px] font-bold tracking-[1px] uppercase text-[#8FB4FF]">Premium</span><div className="text-[42px] font-extrabold tracking-tight">9,99 €<span className="text-[14px] text-[#A9B7D6] font-semibold tracking-normal"> / mois</span></div><ul className="my-4 text-[14px] space-y-2 text-white/90">{['Toutes les annonces en clair, réponses illimitées', 'Votre annonce mise en avant en permanence', 'Matching prioritaire, alertes immédiates', 'Mise en relation illimitée', 'Courriers de permutation prêts à signer'].map(t => <li key={t} className="flex gap-2.5"><span className="text-[#8FF0C0] font-extrabold">✓</span>{t}</li>)}</ul>{PRELAUNCH ? <a href="#preinscription" className="block text-center w-full py-4 rounded-2xl font-bold text-navy bg-white">Être prévenu à l&apos;ouverture</a> : <Btn m="signup" t="Passer en Premium" cls="w-full py-4 rounded-2xl font-bold text-navy bg-white" />}{OFFRE_LANCEMENT && <p className="text-[12.5px] text-[#8FF0C0] text-center mt-3">Offert 1 mois aux 100 premiers comptes vérifiés, attribué automatiquement.</p>}</div>
        </div>
        <div className="max-w-[860px] mx-auto mt-4 bg-white border-[1.5px] border-dashed border-amber rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3 text-[13.5px] text-[#3B4457]"><b className="text-navy">Sans abonnement ?</b><span>Mettez votre annonce en avant 7 jours, épinglée en tête des résultats pour les départements que vous visez.</span><span className="ml-auto font-extrabold text-navy text-[18px]">4,99 €</span></div>
      </W></section>

      {/* CONTACT */}
      <section id="contact" className="py-20"><W>
        <Center t="Une question, une idée ?" s="Le site est fait par un ancien collègue. Il lit tout." />
        <FormContact />
      </W></section>

      {/* CTA */}
      <section id="cta" className="py-20 text-center text-white bg-gradient-to-br from-bleu to-bleud"><W>
        <H2 t="Rejoignez la Bourse aux permut'" light />
        <p className="text-[16px] text-white/85 max-w-[56ch] mx-auto mt-3 mb-7">Des milliers de collègues attendent une mutation qui ne vient pas. Beaucoup veulent exactement le poste que vous voulez quitter. Ils ne le savent pas encore.</p>
        {PRELAUNCH ? <div className="max-w-[640px] mx-auto text-left"><div className="flex flex-wrap items-center gap-3 mb-4"><span className="text-[13px] font-bold tracking-[1.5px] uppercase text-white/85">Ouverture le {OUVERTURE_TXT}</span><Compteur date={OUVERTURE} /></div><Preinscription dark /></div> : <div className="flex flex-wrap gap-3 justify-center"><Btn m="signup" t="Créer mon compte" cls="px-7 py-4 rounded-2xl text-[16px] font-bold text-navy bg-white" /><Btn m="login" t="J'ai déjà un compte" cls="px-7 py-4 rounded-2xl text-[16px] font-bold text-white bg-white/10 border border-white/25" /></div>}
      </W></section>

      <footer className="bg-navy text-[#A9B7D6] py-11 text-[13px]"><W cls="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-7">
        <div><img src="/logo-blanc.png" alt="La Bourse aux permut'" className="h-9 w-auto mb-3" /><p>Annonces de permutation et matching intelligent pour policiers, gendarmes et personnels pénitentiaires. Conçue par un ancien fonctionnaire de police.</p></div>
        <div><h5 className="text-white font-bold mb-2">Navigation</h5>{[['#services', 'Fonctionnalités'], ['#tarifs', 'Tarifs'], ['#contact', 'Contact']].map(([h, t]) => <a key={h} href={h} className="block py-1">{t}</a>)}</div>
        <div><h5 className="text-white font-bold mb-2">Légal</h5>{[['/legal/confidentialite', 'Politique de confidentialité'], ['/legal/cgv', 'Conditions générales'], ['/legal/mentions-legales', 'Mentions légales'], ['/legal/confidentialite#7-vos-droits', 'Gérer mes données']].map(([h, t]) => <a key={h} href={h} className="block py-1">{t}</a>)}</div>
        <div><h5 className="text-white font-bold mb-2">Contact</h5><a href="mailto:contact@labourseauxpermut.fr" className="block py-1">contact@labourseauxpermut.fr</a><a href="#contact" className="block py-1">Signaler une annonce</a></div>
        <div className="md:col-span-4 border-t border-white/10 pt-4 text-[12px] text-[#6F7789] text-center">© 2026 La Bourse aux permut&apos; · Hébergé en Europe · Aucun lien avec le ministère de l&apos;Intérieur ni le ministère de la Justice</div>
      </W></footer>

      <AuthModal open={!!modal} initial={modal ?? 'signup'} onClose={() => setModal(null)} notice={erreurLien ? 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.' : undefined} />
    </div>
  );
}
