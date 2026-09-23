#!/usr/bin/env bash
# Renommage : La Bourse aux permut' (logo provisoire en attendant le définitif)
set -e

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
          <a href="#" className="shrink-0"><img src="/logo.png" alt="La Bourse aux permut'" className="h-9 w-auto" /></a>
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {[['#modules', 'Comment ça marche'], ['#permut', 'Le matching'], ['#entrer', 'Comment entrer'], ['#discretion', 'Discrétion'], ['#tarif', 'Tarif']].map(([h, t]) => (
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
              <h1 className="text-[44px] md:text-[64px] font-extrabold tracking-[-2.2px] leading-[1.0] text-white mt-4">La Bourse aux permut&apos;.<br /><span className="text-white/60">Ici, personne ne le sait.</span></h1>
              <p className="text-[17px] md:text-[19px] text-white/80 max-w-[52ch] mt-6 leading-relaxed">Les annonces de permutation entre collègues, et le matching qui ferme les cycles à 2, 3 ou 4 agents. Sans la hiérarchie, sans les syndicats, sans trace.</p>
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
            [I.permut, 'Matching intelligent', 'cycles à 2, 3 ou 4 agents'],
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
          <div className="max-w-[640px]"><Kicker t="L'app" /><H2 t="Deux façons de trouver son permutant." /><p className="text-[17px] text-[#6F7789] mt-4">Vous cherchez vous-même dans les annonces, ou vous laissez le matching croiser vos souhaits avec ceux de tous les autres. Les deux marchent ensemble.</p></div>
          <div className="grid md:grid-cols-3 gap-px bg-[#E6E9F0] border border-[#E6E9F0] rounded-3xl overflow-hidden mt-12">
            {[
              [I.permut, 'Annonces', 'La Bourse aux permut\'', 'Des annonces anonymes : un grade, une affectation, des villes souhaitées. Jamais un nom. Vous filtrez par département, vous proposez, l\'identité n\'est révélée qu\'après accord mutuel.', 'text-bleu bg-[#E6EEFF]'],
              [I.search, 'Matching', 'Les cycles que personne ne voit', 'Vous voulez Nice, Nice veut Toulouse, Toulouse veut votre poste. Aucune annonce ne le dit. L\'algorithme le voit, ferme le cycle à 2, 3 ou 4 et vous prévient.', 'text-[#16804F] bg-[#DFF7EB]'],
              [I.lock, 'Discrétion', 'Ni la boîte, ni les syndicats', 'Carte pro lue puis détruite, matricule haché, identités chiffrées. Aucun annuaire, aucune recherche par nom. Suppression totale en un geste.', 'text-[#6C3BC9] bg-[#F1E8FF]'],
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
            <p className="text-[17px] text-white/70 mt-3 leading-relaxed">La Bourse aux permut&apos; croise les souhaits en silence et ferme les cycles à 2, 3 ou 4 : vous allez à Nice, Nice va à Toulouse, Toulouse vient chez vous. Et si vous préférez chercher vous-même, les annonces sont là, anonymes, classées par département.</p>
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
              [I.search, 'Rien en texte libre', 'Une annonce n\'a que des champs fermés : impossible d\'y glisser un nom, un service précis ou un détail identifiant.'],
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
            <p className="text-[20px] md:text-[22px] leading-[1.45] flex-1">« J&apos;ai passé des années dans la boîte. Je sais ce qu&apos;on ne dit pas au service : qu&apos;on veut partir, qu&apos;on ne dort plus, qu&apos;on regarde ailleurs. La Bourse aux permut&apos;, c&apos;est l&apos;endroit où on peut le dire sans que ça remonte. »</p>
            <div className="mt-6 md:mt-0 md:w-56 md:border-l md:border-white/15 md:pl-8"><b className="block">Le fondateur</b><span className="text-[13px] text-white/60">Ancien fonctionnaire de police</span></div>
          </div>
        </W>
      </section>

      {/* ===== TARIF ===== */}
      <section id="tarif" className="py-24 bg-white">
        <W>
          <div className="max-w-[640px]"><Kicker t="Tarif" /><H2 t="Gratuit pour commencer. 9,99 € quand ça devient concret." /></div>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="rounded-3xl p-8 border border-[#E6E9F0]"><span className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#A3AAB8]">Gratuit</span><div className="text-[44px] font-extrabold tracking-tight text-navy mt-1">0 €</div><ul className="mt-5 text-[14.5px] text-[#4B5160] space-y-2">{['Vérification, profil, souhaits', 'Publier son annonce, anonyme', '3 annonces en clair, les autres floutées', 'Matching automatique, alertes à +48 h'].map(t => <li key={t} className="flex gap-2.5"><span className="text-mint font-extrabold">✓</span>{t}</li>)}<li className="flex gap-2.5 text-[#A3AAB8]"><span>–</span>Répondre aux annonces, mise en relation (alertes à +48 h)</li></ul></div>
            <div className="rounded-3xl p-8 text-white bg-navy"><span className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#8FB4FF]">Premium</span><div className="text-[44px] font-extrabold tracking-tight mt-1">9,99 €<span className="text-[15px] text-white/50 font-semibold tracking-normal"> / mois</span></div><ul className="mt-5 text-[14.5px] text-white/85 space-y-2">{['Toutes les annonces en clair, réponses illimitées', 'Votre annonce mise en avant en permanence', 'Matching prioritaire, alertes immédiates', 'Mise en relation illimitée', 'Courriers de permutation prêts à signer'].map(t => <li key={t} className="flex gap-2.5"><span className="text-[#8FF0C0] font-extrabold">✓</span>{t}</li>)}</ul><p className="text-[12.5px] text-white/50 mt-6">Sans engagement. Résiliable en un geste dès votre mutation obtenue. Sans abonnement, une mise en avant d&apos;annonce coûte 4,99 € pour 7 jours.</p><Btn m="signup" t="Créer mon compte" cls="mt-6 w-full px-6 py-4 rounded-2xl text-[15px] font-bold text-navy bg-white" /></div>
          </div>
        </W>
      </section>

      <footer className="border-t border-[#E6E9F0] py-8 text-[13px] text-[#6F7789]"><W cls="flex flex-wrap justify-between gap-3"><span>© La Bourse aux permut&apos; · PELOSO CORPORATION · Hébergé en Europe</span><span className="flex gap-5"><a href="#">Confidentialité</a><a href="#">CGV</a><a href="#">Mentions légales</a><a href="mailto:contact@labourseauxpermut.fr">contact@labourseauxpermut.fr</a></span></W></footer>

      <AuthModal open={!!modal} initial={modal ?? 'signup'} onClose={() => setModal(null)} />
    </div>
  );
}
HB_EOF

mkdir -p "components"
cat > "components/AuthModal.tsx" << 'HB_EOF'
'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Mode = 'signup' | 'login';
export default function AuthModal({ open, initial, onClose }: { open: boolean; initial: Mode; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [voie, setVoie] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [pro, setPro] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  const envoyer = async () => {
    setBusy(true); setErr(null);
    // La session est toujours ouverte sur l'adresse personnelle : on ne veut jamais
    // qu'un lien de connexion atterrisse sur un poste de service.
    const next = mode === 'signup' ? `/onboarding?voie=${voie}${voie === 2 && pro ? `&pro=${encodeURIComponent(pro)}` : ''}` : '/annonces';
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) setErr(error.message); else setEnvoye(true);
  };

  const Tab = ({ m, t }: { m: Mode; t: string }) => <button onClick={() => { setMode(m); setEnvoye(false); }} className={`rounded-full px-4 py-2 text-[13px] font-bold ${mode === m ? 'bg-navy text-white' : 'bg-[#F5F7FB] text-[#6F7789]'}`}>{t}</button>;

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-[920px] max-w-full p-7 relative">
        <button className="absolute right-4 top-3 text-2xl text-[#A3AAB8]" onClick={onClose}>×</button>
        <div className="flex gap-1.5"><Tab m="signup" t="Créer mon compte" /><Tab m="login" t="Connexion" /></div>

        {envoye ? (
          <div className="mt-6 text-center py-8"><b className="text-navy text-lg">Lien envoyé sur {email}</b><p className="sub mt-2">Ouvrez-le depuis l&apos;appareil sur lequel vous voulez utiliser La Bourse aux permut&apos;. {mode === 'signup' && voie === 2 ? 'Le code pro vous sera demandé juste après.' : ''}</p></div>
        ) : mode === 'signup' ? (
          <>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy mt-4">Comment voulez-vous prouver que vous êtes des nôtres ?</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              {([1, 2] as const).map(v => (
                <button key={v} onClick={() => setVoie(v)} className={`text-left rounded-2xl p-5 border-[1.5px] ${voie === v ? 'border-bleu bg-[#E6EEFF]' : 'border-[#E6E9F0] bg-white'}`}>
                  <div className={`w-11 h-11 rounded-2xl mb-3 flex items-center justify-center bg-gradient-to-br ${v === 1 ? 'from-[#4C86FF] to-[#1B4FD6]' : 'from-[#3ED18B] to-[#149A5E]'}`}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{v === 1 ? <><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="8.5" cy="12" r="2.5" /><path d="M13 10h5M13 14h5" /></> : <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" /></>}</svg>
                  </div>
                  <b className="block text-navy">{v === 1 ? 'Email perso + carte pro' : 'Email pro + code'}</b>
                  <p className="text-[13px] text-[#6F7789] mt-1">{v === 1 ? 'Un lien de connexion sur votre adresse personnelle, puis la carte pro photographiée et détruite dans la seconde.' : 'Un code à 6 chiffres sur votre boîte nominative de service, dans un mail neutre, valable 7 jours.'}</p>
                  <span className="inline-block mt-2 text-[11px] font-bold px-2 py-1 rounded-full bg-[#DFF7EB] text-[#16804F]">{v === 1 ? 'Le plus discret' : 'Le plus rapide'}</span>
                </button>
              ))}
            </div>
            <div className="mt-5">
              <input className="field" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
              {voie === 2 && <input className="field mt-2" type="email" placeholder="prenom.nom@interieur.gouv.fr (adresse pro nominative)" value={pro} onChange={e => setPro(e.target.value)} />}
              <p className="sub mt-2">{voie === 1 ? 'Vous recevrez un lien de connexion, sans mot de passe. La photo de la carte pro se fait à l\'étape suivante, dans l\'app.' : 'Le compte reste sur votre adresse personnelle. Le code partira sur la boîte pro, à lire au service dans les 7 jours. Domaines acceptés : @interieur.gouv.fr, @gendarmerie.interieur.gouv.fr, @justice.fr.'}</p>
              {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
              <button className="btn mt-3" onClick={envoyer} disabled={busy || !email.includes('@') || (voie === 2 && !pro.includes('@'))}>{busy ? 'Envoi…' : 'Recevoir mon lien'}</button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy mt-4">Connexion</h3>
            <p className="sub mt-1">Votre adresse personnelle, celle du compte. Un lien vous est envoyé, pas de mot de passe.</p>
            <input className="field mt-3" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
            {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
            <button className="btn mt-3" onClick={envoyer} disabled={busy || !email.includes('@')}>{busy ? 'Envoi…' : 'Recevoir mon lien'}</button>
          </>
        )}
      </div>
    </div>
  );
}
HB_EOF

mkdir -p "components"
cat > "components/TopBar.tsx" << 'HB_EOF'
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const I = {
  ann: 'M4 5h16v14H4zM8 9h8M8 13h5', match: 'M4 7h11l-3-3M20 17H9l3 3M4 17a2 2 0 1 0 0 .1M20 7a2 2 0 1 0 0 .1',
  fav: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', plus: 'M12 5v14M5 12h14',
};
const Ico = ({ d, cls = 'w-[22px] h-[22px]' }: { d: string; cls?: string }) => <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

export default function TopBar({ nbMatchs, institution }: { nbMatchs: number; institution?: string | null }) {
  const path = usePathname(); const r = useRouter();
  const [q, setQ] = useState('');
  const on = (h: string) => path === h || path.startsWith(h + '/');
  const NavA = ({ h, t, d, badge }: { h: string; t: string; d: string; badge?: number }) => (
    <Link href={h} className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold ${on(h) ? 'text-bleu' : 'text-[#6F7789] hover:bg-paper'}`}>
      {!!badge && <i className="absolute top-0 right-1 w-4 h-4 rounded-full bg-coral text-white text-[10px] font-extrabold not-italic flex items-center justify-center">{badge}</i>}<Ico d={d} />{t}
    </Link>
  );
  const chips = [['/annonces', 'Toutes'], ['/annonces?inst=PN', 'Police nationale'], ['/annonces?inst=GN', 'Gendarmerie'], ['/annonces?inst=AP', 'Pénitentiaire'], ['/annonces?vers=moi', 'Vers mon département'], ['/annonces?depuis=cible', 'Depuis ma ville cible'], ['/annonces?om=1', 'Outre-mer · CIMM'], ['/annonces?boost=1', 'Mises en avant']];
  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#E6E9F0]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-5 h-[60px] md:h-[68px] flex items-center gap-3 md:gap-4">
          <Link href="/annonces" className="shrink-0"><img src="/logo.png" alt="La Bourse aux permut'" className="h-7 md:h-[34px] w-auto" /></Link>
          <Link href="/deposer" className="shrink-0 inline-flex items-center gap-2 bg-bleu text-white font-bold text-[14px] px-3 md:px-4 py-2.5 rounded-xl"><Ico d={I.plus} cls="w-4 h-4" /><span className="hidden md:inline">Déposer une annonce</span></Link>
          <form onSubmit={e => { e.preventDefault(); r.push(`/annonces?q=${encodeURIComponent(q)}`); }} className="flex-1 flex items-center gap-2 bg-paper border border-[#E6E9F0] rounded-2xl pl-3.5 pr-1.5 h-10 md:h-[46px] max-w-[620px]">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Une ville, un département, un service…" className="flex-1 bg-transparent outline-none text-[14px] min-w-0" />
            <button className="bg-navy text-white rounded-xl w-8 h-8 md:w-9 md:h-9 flex items-center justify-center" aria-label="Rechercher"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg></button>
          </form>
          <nav className="hidden md:flex gap-1 ml-auto">
            <NavA h="/annonces" t="Annonces" d={I.ann} /><NavA h="/matchs" t="Mes matchs" d={I.match} badge={nbMatchs} /><NavA h="/favoris" t="Favoris" d={I.fav} /><NavA h="/compte" t="Compte" d={I.user} />
          </nav>
        </div>
        <div className="border-t border-[#E6E9F0] bg-white"><div className="max-w-[1200px] mx-auto px-4 md:px-5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] py-2.5">
          {chips.filter(([h]) => !h.includes('inst=') || !institution || h.endsWith(institution)).map(([h, t]) => <Link key={h} href={h} className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold border ${h === '/annonces' && path === '/annonces' ? 'bg-navy text-white border-navy' : 'bg-white text-[#3B4457] border-[#E6E9F0]'}`}>{t}</Link>)}
        </div></div>
      </header>
      <nav className="md:hidden fixed left-0 right-0 bottom-0 z-30 bg-white border-t border-[#E6E9F0] flex justify-around px-1.5 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
        {[['/annonces', 'Annonces', I.ann], ['/matchs', 'Matchs', I.match], ['/deposer', 'Déposer', I.plus], ['/favoris', 'Favoris', I.fav], ['/compte', 'Compte', I.user]].map(([h, t, d]) => <Link key={h} href={h} className={`flex flex-col items-center gap-0.5 w-16 text-[10.5px] font-semibold ${on(h) ? 'text-bleu' : 'text-[#A3AAB8]'}`}><Ico d={d} />{t}</Link>)}
      </nav>
    </>
  );
}
HB_EOF

mkdir -p "supabase/migrations"
cat > "supabase/migrations/0001_schema.sql" << 'HB_EOF'
-- =====================================================================
-- La Bourse aux permut' — schéma v1 (police, gendarmerie, pénitentiaire)
-- Principe : la table lue par le matching ne contient aucune identité.
-- L'identité vit dans une table séparée, chiffrée côté serveur (Next.js),
-- révélée uniquement quand tous les agents d'un cycle ont accepté.
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Référentiels
-- ---------------------------------------------------------------------
create table institutions (
  code text primary key,               -- 'PN', 'GN', 'AP'
  libelle text not null,
  domaines_mail text[] not null        -- domaines pro acceptés
);
insert into institutions values
 ('PN','Police nationale', array['interieur.gouv.fr']),
 ('GN','Gendarmerie nationale', array['gendarmerie.interieur.gouv.fr']),
 ('AP','Administration pénitentiaire', array['justice.fr','justice.gouv.fr']);

create table corps (
  code text primary key, institution text not null references institutions(code), libelle text not null
);
insert into corps values
 ('CEA','PN','Corps d''encadrement et d''application'),('CC','PN','Corps de commandement'),('CCD','PN','Corps de conception et de direction'),
 ('SOG','GN','Sous-officiers de gendarmerie'),('GAV','GN','Gendarmes adjoints volontaires'),('OFF','GN','Officiers'),
 ('SURV','AP','Surveillants'),('CPIP','AP','Conseillers pénitentiaires d''insertion et de probation'),('OFFAP','AP','Officiers pénitentiaires');

create table grades (
  code text primary key, corps text not null references corps(code), libelle text not null, rang smallint not null
);
insert into grades values
 ('GPX','CEA','Gardien de la paix',1),('BRG','CEA','Brigadier',2),('BRC','CEA','Brigadier-chef',3),('MAJ','CEA','Major',4),
 ('GEN','SOG','Gendarme',1),('MDL','SOG','Maréchal des logis-chef',2),('ADJ','SOG','Adjudant',3),('ADC','SOG','Adjudant-chef',4),
 ('SUR','SURV','Surveillant',1),('SUB','SURV','Surveillant brigadier',2),('PRE','SURV','Premier surveillant',3),('MAJP','SURV','Major',4);

create table services (
  id serial primary key,
  institution text not null references institutions(code),
  ville text not null,
  departement text not null,           -- '06', '974'
  type text not null,                  -- 'CSP','CRS','BTA','PSIG','MA','CD'...
  libelle text not null,
  outre_mer boolean not null default false,
  lat numeric, lng numeric
);
create index on services(institution, departement);

-- ---------------------------------------------------------------------
-- Profils (AUCUNE identité)
-- ---------------------------------------------------------------------
create table profils (
  id uuid primary key references auth.users(id) on delete cascade,
  institution text not null references institutions(code),
  corps text references corps(code),
  grade text references grades(code),
  service_id int references services(id),
  type_service text,                   -- 'SP jour','SP nuit','BAC','OP','brigade','détention'...
  anciennete_poste_mois int not null default 0,
  depart_des date,
  cimm_departement text,               -- CIMM déclaré (outre-mer)
  accepte_cycles boolean not null default true,
  accepte_souhait_2_3 boolean not null default true,
  accepte_changer_service boolean not null default false,
  verifie_carte boolean not null default false,
  verifie_mail_pro boolean not null default false,
  verifie_le timestamptz,
  premium_jusqua timestamptz,
  stripe_customer_id text,
  canal_acquisition text,              -- 'peps','facebook','syndicat','collegue'...
  created_at timestamptz not null default now()
);

create table souhaits (
  id bigserial primary key,
  profil_id uuid not null references profils(id) on delete cascade,
  rang smallint not null check (rang between 1 and 5),
  service_id int references services(id),
  departement text,                    -- alternative : tout le département
  contrainte_type_service text,
  unique (profil_id, rang)
);

-- ---------------------------------------------------------------------
-- Identité chiffrée (service_role uniquement)
-- ---------------------------------------------------------------------
create table identites (
  profil_id uuid primary key references profils(id) on delete cascade,
  nom_enc text not null, prenom_enc text not null,
  mail_pro_enc text not null, telephone_enc text,
  created_at timestamptz not null default now()
);
create table empreintes_matricule (
  empreinte text primary key,
  profil_id uuid not null unique references profils(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table codes_mail_pro (
  profil_id uuid primary key references profils(id) on delete cascade,
  code_hash text not null, expire_le timestamptz not null, tentatives smallint not null default 0
);
create table parrainages (
  id bigserial primary key,
  parrain_id uuid not null references profils(id),
  filleul_id uuid not null unique references profils(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Matching
-- ---------------------------------------------------------------------
create table correspondances (
  id uuid primary key default gen_random_uuid(),
  institution text not null references institutions(code),
  type text not null check (type in ('directe','cycle3','cycle4')),
  score smallint not null,
  statut text not null default 'proposee' check (statut in ('proposee','en_cours','confirmee','refusee','expiree')),
  detail jsonb not null default '{}',
  signature text not null unique,      -- ids triés, évite les doublons entre passes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table correspondance_membres (
  correspondance_id uuid not null references correspondances(id) on delete cascade,
  profil_id uuid not null references profils(id) on delete cascade,
  position smallint not null,
  vers_service_id int references services(id),
  reponse text not null default 'attente' check (reponse in ('attente','accepte','refuse')),
  notifie_le timestamptz,
  primary key (correspondance_id, profil_id)
);
create index on correspondance_membres(profil_id);
create table correspondances_ignorees (
  profil_id uuid not null references profils(id) on delete cascade,
  correspondance_id uuid not null references correspondances(id) on delete cascade,
  primary key (profil_id, correspondance_id)
);
create table historique_points (
  id bigserial primary key,
  institution text not null references institutions(code),
  service_id int references services(id),
  departement text,
  annee smallint not null, points smallint not null,
  declare_par uuid references profils(id) on delete set null,
  created_at timestamptz not null default now()
);
create table calendriers (
  id serial primary key,
  institution text not null references institutions(code),
  libelle text not null, cloture date not null, url text
);
create table journal_identites (
  id bigserial primary key, profil_id uuid not null, par_fonction text not null,
  correspondance_id uuid, created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Écoute : AUCUNE table liée au profil. Les référents ont leur propre table,
-- les échanges sont éphémères (Supabase Realtime broadcast, rien en base).
-- ---------------------------------------------------------------------
create table referents (
  id uuid primary key default gen_random_uuid(),
  institution text not null references institutions(code),
  presentation text not null,          -- texte anonyme
  disponible boolean not null default false,
  partenaire text,                     -- 'PEPS'
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- L'après : contenus éditoriaux, sans lien profil
-- ---------------------------------------------------------------------
create table apres_voies (
  id serial primary key, institution text references institutions(code),
  titre text not null, statut text not null, texte text not null, ordre smallint not null default 0
);
create table apres_metiers (
  id serial primary key, titre text not null, secteur text not null, deontologie boolean not null default false,
  profils_cibles text[] not null default '{}', ordre smallint not null default 0
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table institutions enable row level security; alter table corps enable row level security;
alter table grades enable row level security; alter table services enable row level security;
alter table calendriers enable row level security; alter table referents enable row level security;
alter table apres_voies enable row level security; alter table apres_metiers enable row level security;
create policy r_inst on institutions for select to authenticated, anon using (true);
create policy r_corps on corps for select to authenticated, anon using (true);
create policy r_grades on grades for select to authenticated, anon using (true);
create policy r_services on services for select to authenticated, anon using (true);
create policy r_cal on calendriers for select to authenticated using (true);
create policy r_ref on referents for select to authenticated, anon using (true);
create policy r_voies on apres_voies for select to authenticated using (true);
create policy r_metiers on apres_metiers for select to authenticated using (true);

alter table profils enable row level security;
create policy p_sel on profils for select to authenticated using (id = auth.uid());
create policy p_ins on profils for insert to authenticated with check (id = auth.uid());
create policy p_upd on profils for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create or replace function garde_colonnes_profil() returns trigger language plpgsql security definer as $$
begin
  if auth.role() = 'authenticated' then
    new.verifie_carte := old.verifie_carte; new.verifie_mail_pro := old.verifie_mail_pro;
    new.verifie_le := old.verifie_le; new.premium_jusqua := old.premium_jusqua;
    new.stripe_customer_id := old.stripe_customer_id; new.institution := old.institution;
  end if;
  return new;
end $$;
create trigger trg_garde_profil before update on profils for each row execute function garde_colonnes_profil();

alter table souhaits enable row level security;
create policy s_all on souhaits for all to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());

-- identites, empreintes, codes : aucune policy => service_role uniquement
alter table identites enable row level security;
alter table empreintes_matricule enable row level security;
alter table codes_mail_pro enable row level security;
alter table parrainages enable row level security;
create policy par_sel on parrainages for select to authenticated using (parrain_id = auth.uid());
alter table journal_identites enable row level security;

alter table correspondances enable row level security;
alter table correspondance_membres enable row level security;
alter table correspondances_ignorees enable row level security;
alter table historique_points enable row level security;
create policy c_sel on correspondances for select to authenticated using (exists (
  select 1 from correspondance_membres m where m.correspondance_id = correspondances.id and m.profil_id = auth.uid() and m.notifie_le is not null));
create policy m_sel on correspondance_membres for select to authenticated using (exists (
  select 1 from correspondance_membres me where me.correspondance_id = correspondance_membres.correspondance_id and me.profil_id = auth.uid() and me.notifie_le is not null));
create policy m_upd on correspondance_membres for update to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());
create policy i_all on correspondances_ignorees for all to authenticated using (profil_id = auth.uid()) with check (profil_id = auth.uid());
create policy h_sel on historique_points for select to authenticated using (true);
create policy h_ins on historique_points for insert to authenticated with check (
  exists (select 1 from profils p where p.id = auth.uid() and p.verifie_carte and p.verifie_mail_pro));

-- Vue anonymisée des correspondances de l'utilisateur
create or replace view v_mes_correspondances with (security_invoker = true) as
select c.id, c.type, c.score, c.statut, c.detail, c.created_at,
       m.position, m.vers_service_id, m.reponse, (m.profil_id = auth.uid()) as est_moi,
       p.corps, p.grade, p.type_service, p.anciennete_poste_mois,
       s.ville as ville_actuelle, sv.ville as ville_cible
from correspondances c
join correspondance_membres m on m.correspondance_id = c.id
join profils p on p.id = m.profil_id
left join services s on s.id = p.service_id
left join services sv on sv.id = m.vers_service_id
where exists (select 1 from correspondance_membres me where me.correspondance_id = c.id and me.profil_id = auth.uid() and me.notifie_le is not null);

-- Données de démo minimales
insert into services (institution, ville, departement, type, libelle, lat, lng) values
 ('PN','Montpellier','34','CSP','CSP Montpellier',43.61,3.88),
 ('PN','Nice','06','CSP','CSP Nice',43.70,7.27),
 ('PN','Toulouse','31','CSP','CSP Toulouse',43.60,1.44),
 ('PN','Marseille','13','CSP','CSP Marseille',43.30,5.37),
 ('PN','Lyon','69','CSP','CSP Lyon',45.76,4.83),
 ('PN','Paris','75','DSPAP','DSPAP Paris',48.86,2.35),
 ('GN','Nice','06','BTA','Brigade de Nice',43.70,7.27),
 ('AP','Fleury-Mérogis','91','MA','Maison d''arrêt de Fleury-Mérogis',48.63,2.36);
insert into calendriers (institution, libelle, cloture) values
 ('PN','Mouvement général CEA','2026-10-28'),('GN','Plan annuel de mutation','2026-11-15'),('AP','Campagne de mobilité surveillants','2026-11-30');
HB_EOF

mkdir -p "app/(app)/compte"
cat > "app/(app)/compte/Compte.tsx" << 'HB_EOF'
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Paywall from '@/components/Paywall';

export default function Compte({ email, profil, annonce }: any) {
  const sb = supabaseBrowser(); const [pay, setPay] = useState(false);
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();
  const verifie = profil?.verifie_carte || profil?.verifie_mail_pro; const deux = profil?.verifie_carte && profil?.verifie_mail_pro;
  const supprimer = async () => { if (!confirm('Supprimer définitivement votre compte et toutes vos données ?')) return; await fetch('/api/compte', { method: 'DELETE' }); await sb.auth.signOut(); location.href = '/'; };
  const Panel = ({ t, children }: { t: string; children: React.ReactNode }) => <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4 md:p-5"><h4 className="text-[13px] font-extrabold text-navy mb-1">{t}</h4>{children}</div>;
  return (
    <div className="max-w-[900px]">
      <h1 className="text-[22px] font-extrabold tracking-tight text-navy mb-4">Mon compte</h1>
      <div className="grid md:grid-cols-2 gap-3.5">
        <Panel t="Vérification">
          <div className="kv"><span>Statut</span><span className={verifie ? 'pill-mint' : 'pill-amber'}>{deux ? 'Vérifié deux fois' : verifie ? 'Vérifié' : 'À vérifier'}</span></div>
          <div className="kv"><span>Carte pro</span><b>{profil?.verifie_carte ? 'Lue puis détruite' : 'Non faite'}</b></div>
          <div className="kv"><span>Mail pro</span><b>{profil?.verifie_mail_pro ? 'Confirmé' : 'Non fait'}</b></div>
          {!deux && <Link href="/onboarding" className="btn-ghost mt-3 !py-2.5">{verifie ? 'Ajouter la seconde vérification' : 'Vérifier mon compte'}</Link>}
        </Panel>
        <Panel t="Abonnement">
          <div className="kv"><span>Formule</span><span className={premium ? 'pill-mint' : 'pill-bleu'}>{premium ? 'Premium' : 'Gratuit'}</span></div>
          <div className="kv"><span>{premium ? 'Renouvellement' : 'Gratuit'}</span><b>{premium ? new Date(profil.premium_jusqua).toLocaleDateString('fr-FR') : '3 annonces en clair, alertes à +48 h'}</b></div>
          {premium ? <p className="sub mt-2">Résiliation en un geste depuis le portail Stripe (lien dans votre reçu).</p> : <button className="btn mt-3 !py-2.5" onClick={() => setPay(true)}>Passer en Premium · 9,99 €/mois</button>}
        </Panel>
        <Panel t="Mon annonce">
          {annonce ? <><div className="kv"><span>Statut</span><span className="pill-mint">En ligne</span></div><div className="kv"><span>Mise en avant</span><b>{annonce.mise_en_avant_jusqua && new Date(annonce.mise_en_avant_jusqua) > new Date() ? `jusqu'au ${new Date(annonce.mise_en_avant_jusqua).toLocaleDateString('fr-FR')}` : 'Non'}</b></div><Link href="/deposer" className="btn-ghost mt-3 !py-2.5">Modifier</Link></>
            : <><p className="sub">Aucune annonce en ligne.</p><Link href="/deposer" className="btn mt-3 !py-2.5">Déposer une annonce</Link></>}
        </Panel>
        <Panel t="Profil">
          <div className="kv"><span>Email du compte</span><b className="truncate max-w-[60%]">{email}</b></div>
          <div className="kv"><span>Institution</span><b>{profil?.institution ?? '—'}</b></div>
          <div className="kv"><span>Affectation</span><b>{(profil as any)?.services?.libelle ?? '—'}</b></div>
          <Link href="/deposer" className="btn-ghost mt-3 !py-2.5">Modifier mon poste et mes souhaits</Link>
        </Panel>
        <Panel t="Ce que La Bourse aux permut&apos; conserve">
          <div className="kv"><span>Nom et prénom</span><b>Chiffrés, table séparée</b></div><div className="kv"><span>Matricule</span><b>Empreinte uniquement</b></div><div className="kv"><span>Photo de la carte</span><b className="text-[#16804F]">Jamais stockée</b></div>
        </Panel>
        <Panel t="Session">
          <button className="btn-ghost !py-2.5" onClick={async () => { await sb.auth.signOut(); location.href = '/'; }}>Se déconnecter</button>
          <button className="btn-ghost mt-2 !py-2.5 text-[#C8323B] border-[#FFD3D6]" onClick={supprimer}>Supprimer mon compte et toutes mes données</button>
        </Panel>
      </div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
HB_EOF

mkdir -p "app/(app)/annonces/[id]"
cat > "app/(app)/annonces/[id]/page.tsx" << 'HB_EOF'
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AnnonceCard, { titre } from '@/components/AnnonceCard';
import Paywall from '@/components/Paywall';

export default function Detail() {
  const { id } = useParams<{ id: string }>(); const r = useRouter();
  const [d, setD] = useState<any>(null);
  const [pay, setPay] = useState(false);
  const [fav, setFav] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { fetch(`/api/annonces/${id}`).then(x => x.json()).then(j => { setD(j); setFav(!!j.favori); }); }, [id]);
  const a = d?.annonce;
  const favori = async () => { const j = await fetch('/api/favoris', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) }).then(x => x.json()); setFav(j.favori); };
  const proposer = async () => {
    const res = await fetch('/api/annonces/repondre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annonce_id: id }) });
    if (res.status === 402) return setPay(true);
    const j = await res.json(); if (j.ok) r.push(`/matchs/${j.correspondance_id}`); else setMsg(j.message ?? j.error);
  };
  if (!d) return <div className="card"><div className="sub">Chargement…</div></div>;
  if (!d.ok) return <div className="card"><b className="text-navy">Annonce introuvable</b><div className="sub mt-1">Elle a peut-être été retirée ou a abouti.</div><Link href="/annonces" className="btn mt-3 !w-auto">Retour aux annonces</Link></div>;
  const Kv = ({ k, v }: { k: string; v: any }) => <div className="kv"><span>{k}</span><b>{v ?? '—'}</b></div>;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div>
        <div className="text-[13px] text-[#6F7789] mb-3"><Link href="/annonces" className="text-bleu font-semibold">Annonces</Link> › {a.institution} › {a.departement ? `Département ${a.departement}` : ''}</div>
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5 md:p-6">
          <div className="flex gap-1.5 flex-wrap">{a.mise_en_avant && <span className="pill-amber">Mise en avant</span>}{!a.flou && a.score >= 70 && !a.mienne && <span className="pill-mint">Compatible {a.score} % avec vos souhaits</span>}{a.deux_fois && <span className="pill bg-paper text-[#6F7789]">Vérifié deux fois</span>}</div>
          <h1 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-navy mt-2">{titre(a)}</h1>
          <div className="text-[13px] text-[#6F7789] mt-1">Publiée {new Date(a.created_at).toLocaleDateString('fr-FR')} · agent vérifié</div>
          {a.flou ? (
            <div className="mt-5 bg-paper rounded-2xl p-5 text-center"><b className="text-navy">Le détail de cette annonce est réservé au Premium</b><div className="sub mt-1">Gratuit : les 3 annonces les plus pertinentes en clair. Premium : toutes, et réponse illimitée.</div><button className="btn mt-3 !w-auto" onClick={() => setPay(true)}>Passer en Premium · 9,99 €/mois</button></div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2.5 mt-4">
                <span className="flex items-center gap-2 bg-paper rounded-xl px-3.5 py-2.5 font-bold text-[14px] text-navy"><i className="w-2.5 h-2.5 rounded-full bg-navy" />{a.ville}</span><span className="text-[#A3AAB8] text-lg">→</span>
                {(a.cibles ?? []).map((c: any, i: number) => <span key={i} className="flex items-center gap-2 bg-paper rounded-xl px-3.5 py-2.5 font-bold text-[14px] text-navy"><i className="w-2.5 h-2.5 rounded-full bg-mint" />{c.ville ?? c.departement}</span>)}
              </div>
              <div className="mt-4">
                <Kv k="Corps · grade" v={`${a.corps ?? ''} · ${a.grade ?? ''}`} /><Kv k="Type de service" v={a.type_service} /><Kv k="Ancienneté dans le poste" v={a.anciennete_poste_mois != null ? `${Math.floor(a.anciennete_poste_mois / 12)} ans` : null} /><Kv k="Départ possible dès" v={a.depart_des ? new Date(a.depart_des).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null} /><Kv k="Accepte les cycles à 3 ou 4" v={a.accepte_cycles ? 'Oui' : 'Non'} />
              </div>
            </>
          )}
          <div className="mt-4 bg-paper rounded-xl px-4 py-3 text-[12.5px] text-[#3B4457]">🔒 Aucun nom, aucun texte libre : une annonce décrit un poste et des souhaits, jamais une personne. L&apos;identité n&apos;est révélée qu&apos;après accord mutuel.</div>
        </div>
        {d.similaires?.length > 0 && <><h2 className="text-[17px] font-extrabold text-navy mt-6 mb-3">Annonces similaires</h2><div className="flex flex-col gap-3">{d.similaires.map((s: any) => <AnnonceCard key={s.id} a={s} onPaywall={() => setPay(true)} />)}</div></>}
      </div>
      <aside className="lg:sticky lg:top-[130px] flex flex-col gap-3.5">
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4">
          <b className="text-[18px] text-navy tracking-tight">{a.mienne ? 'Votre annonce' : 'Proposer une permutation'}</b>
          {a.mienne ? (
            <><div className="sub mt-1">Visible par les agents vérifiés de votre institution.</div><Link href="/deposer" className="btn mt-3">Modifier ou mettre en avant</Link></>
          ) : (
            <><div className="sub mt-1">Une proposition ouvre une mise en relation. L&apos;identité est révélée quand les deux ont accepté.</div><button className="btn mt-3" onClick={proposer}>Proposer une permutation</button><button className="btn-ghost mt-2" onClick={favori}>{fav ? '♥ Sauvegardée' : '♡ Sauvegarder'}</button></>
          )}
          {msg && <p className="sub mt-2">{msg}</p>}
        </div>
        {!a.mienne && !a.flou && a.score >= 70 && <Link href="/matchs" className="block rounded-2xl p-4 text-white bg-gradient-to-br from-navy2 to-navy"><b className="block text-[14px]">Compatible avec vos souhaits</b><span className="text-[12px] text-[#A9B7D6]">Le matching automatique peut aussi la placer dans un cycle à 3 ou 4.</span><span className="block text-[13px] font-bold mt-3 bg-white text-navy rounded-xl px-3 py-2.5 text-center">Voir mes matchs</span></Link>}
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4"><b className="text-[13px] text-navy">Signaler</b><div className="sub mt-1">Annonce identifiante ou hors sujet ? <a href="mailto:contact@labourseauxpermut.fr" className="text-bleu font-semibold">Écrivez-nous</a>, elle sera retirée sous 24 h.</div></div>
      </aside>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
HB_EOF

mkdir -p "app/onboarding"
cat > "app/onboarding/page.tsx" << 'HB_EOF'
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Etape = 0 | 1 | 2 | 3 | 4;
const INSTITUTIONS = [
  { code: 'PN', t: 'Police nationale', s: 'CEA, CC, CCD · mouvements généraux et profilés · barème à points', c: 'from-[#4C86FF] to-[#1B4FD6]' },
  { code: 'GN', t: 'Gendarmerie nationale', s: 'Sous-officiers, GAV, officiers · plan annuel de mutation · logement en caserne', c: 'from-[#2F4A8A] to-[#0F1B33]' },
  { code: 'AP', t: 'Administration pénitentiaire', s: 'Surveillants, gradés, officiers, CPIP · campagnes de mobilité Justice', c: 'from-[#7A3E9D] to-[#4B1F6B]' },
];
const PROMESSES = [
  ['Identité masquée', 'Vos nom, matricule et service ne sont jamais affichés avant une acceptation mutuelle.'],
  ['Aucun annuaire, aucune recherche par nom', 'Vous ne voyez que vos propres correspondances. Vos collègues ne peuvent pas vous trouver.'],
  ['Matricule haché, carte pro jamais stockée', 'La photo sert à vérifier, puis elle est détruite. Il ne reste qu\'une empreinte non réversible.'],
  ['Aucun accès pour l\'administration, la hiérarchie ou les syndicats', 'Données hébergées en Europe, chiffrées, jamais vendues, sans publicité.'],
  ['Suppression totale en un geste', 'Compte, souhaits, historique de matching : tout disparaît immédiatement.'],
];

function OnboardingInner() {
  const r = useRouter();
  const sp = useSearchParams();
  const voie = sp.get('voie') === '2' ? 2 : 1;
  const [etape, setEtape] = useState<Etape>(0);
  const [inst, setInst] = useState('PN');
  const [lecture, setLecture] = useState<any>(null);
  const [email, setEmail] = useState(sp.get('pro') ?? '');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Crée le profil minimal s'il n'existe pas
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return r.replace('/login');
      const { data } = await sb.from('profils').select('institution, verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
      if (data) { setInst(data.institution); if (data.verifie_carte || data.verifie_mail_pro) r.replace('/annonces'); }
    })();
  }, [r]);

  const choisirInstitution = async () => {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('profils').upsert({ id: user!.id, institution: inst }, { onConflict: 'id', ignoreDuplicates: true });
    setEtape(1);
  };

  const envoyerCarte = async (f: File) => {
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.append('image', f);
    const res = await fetch('/api/verify/card', { method: 'POST', body: fd }).then(x => x.json());
    setBusy(false);
    if (res.ok) setLecture(res); else setMsg(res.message ?? 'Lecture impossible');
  };

  const envoyerMail = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch('/api/verify/mail-pro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', email }) }).then(x => x.json());
    setBusy(false); setMsg(res.ok ? 'Code envoyé sur votre boîte pro. Il reste valable 7 jours.' : res.message);
  };
  const confirmer = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch('/api/verify/mail-pro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'confirm', code }) }).then(x => x.json());
    setBusy(false); if (res.ok) setEtape(4); else setMsg(res.message);
  };

  const Dots = () => <div className="flex justify-center gap-1.5 my-3">{[0,1,2,3,4].map(i => <i key={i} className={`h-2 rounded-full ${i === etape ? 'w-5 bg-bleu' : 'w-2 bg-[#D5D9E2]'}`} />)}</div>;

  return (
    <main className="min-h-screen bg-paper flex items-start justify-center md:py-10"><div className="w-full md:max-w-[560px] md:bg-white md:rounded-[26px] md:shadow-[0_20px_60px_-30px_rgba(15,27,51,.35)] flex flex-col px-5 md:px-8 pt-[max(12px,env(safe-area-inset-top))] md:pt-6 pb-6 min-h-screen md:min-h-0">
      <Dots />
      {etape === 0 && (<>
        <Image src="/porte.png" alt="" width={90} height={110} className="mx-auto drop-shadow-xl" />
        <h1 className="h1 text-center mt-3">Vous êtes…</h1>
        <p className="sub text-center mt-2">Chaque institution est un couloir séparé : on ne permute qu&apos;avec ses collègues. Ce choix ne pourra pas être modifié après vérification.</p>
        <div className="flex flex-col gap-3 mt-5">
          {INSTITUTIONS.map(i => (
            <button key={i.code} onClick={() => setInst(i.code)} className={`flex items-center gap-3 text-left bg-white rounded-xl2 p-4 border-2 ${inst === i.code ? 'border-bleu bg-[#E6EEFF]' : 'border-[#E6E9F0]'}`}>
              <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${i.c} text-white font-extrabold flex items-center justify-center`}>{i.code}</span>
              <span><b className="block text-navy">{i.t}</b><small className="sub">{i.s}</small></span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn-dark mt-4" onClick={choisirInstitution}>Continuer</button>
      </>)}

      {etape === 1 && (<>
        <Image src="/porte.png" alt="" width={90} height={110} className="mx-auto drop-shadow-xl" />
        <h1 className="h1 text-center mt-3">Personne ne saura<br />que vous cherchez</h1>
        <p className="sub text-center mt-2">La Bourse aux permut&apos; a été conçue par un ancien fonctionnaire de police, pour les policiers, les gendarmes et les personnels pénitentiaires. La discrétion administrative n&apos;est pas une option, c&apos;est la base.</p>
        <div className="card mt-4">
          {PROMESSES.map(([t, s]) => (
            <div key={t} className="flex gap-3 py-2.5 border-t border-[#E6E9F0] first:border-t-0">
              <span className="w-6 h-6 rounded-full bg-[#DFF7EB] text-[#16804F] text-[12px] font-extrabold flex items-center justify-center shrink-0">✓</span>
              <span><b className="block text-navy text-[13.5px]">{t}</b><span className="sub">{s}</span></span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn-dark mt-4" onClick={() => setEtape(voie === 2 ? 3 : 2)}>Je comprends, continuer</button>
      </>)}

      {etape === 2 && (<>
        <h1 className="h1">Vérification<br /><span className="text-bleu">Votre carte pro</span></h1>
        <p className="sub mt-2">Carte de police, carte militaire gendarmerie ou carte pénitentiaire. La photo est analysée puis détruite dans la seconde, elle n&apos;est jamais enregistrée.</p>
        <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && envoyerCarte(e.target.files[0])} />
        {!lecture ? (
          <>
            <button className="btn mt-5" onClick={() => file.current?.click()} disabled={busy}>{busy ? 'Analyse en cours…' : 'Prendre la carte en photo'}</button>
            {msg && <p className="text-[12.5px] text-[#C8323B] mt-3">{msg}</p>}
            <button className="btn-ghost mt-2" onClick={() => setEtape(3)}>Je préfère vérifier par mon adresse pro</button>
          </>
        ) : (
          <div className="card mt-5">
            <div className="flex justify-between items-center"><b className="text-[14px]">Lecture automatique</b><span className="pill-mint">Réussie</span></div>
            <div className="flex flex-wrap gap-1.5 mt-3 text-[12.5px]">
              <span className="bg-[#F5F7FB] rounded-lg px-2.5 py-1.5"><b className="text-[#6F7789] font-semibold mr-1">Nom</b>{lecture.nom}</span>
              <span className="bg-[#F5F7FB] rounded-lg px-2.5 py-1.5"><b className="text-[#6F7789] font-semibold mr-1">Prénom</b>{lecture.prenom}</span>
              <span className="bg-[#F5F7FB] rounded-lg px-2.5 py-1.5"><b className="text-[#6F7789] font-semibold mr-1">Matricule</b>{lecture.matricule_masque}</span>
            </div>
            <p className="sub mt-3">Le matricule est transformé en empreinte irréversible. La photo a été détruite.</p>
            <button className="btn mt-3" onClick={() => setEtape(4)}>C'est vérifié, continuer</button>
            <button className="btn-ghost mt-2" onClick={() => setEtape(3)}>Ajouter aussi mon adresse pro (badge « Vérifié deux fois »)</button>
          </div>
        )}
      </>)}

      {etape === 3 && (<>
        <h1 className="h1">{voie === 2 ? 'Vérification' : 'Vérification 2 sur 2'}<br /><span className="text-bleu">Votre adresse pro</span></h1>
        <p className="sub mt-2">Votre boîte nominative, pas celle de l&apos;unité. Police : @interieur.gouv.fr. Gendarmerie : @gendarmerie.interieur.gouv.fr. Pénitentiaire : @justice.fr. Le code est à lire au service, valable 7 jours.</p>
        <input className="field mt-5" type="email" placeholder="prenom.nom@interieur.gouv.fr" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="btn-ghost mt-2" onClick={envoyerMail} disabled={busy || !email.includes('@')}>Envoyer le code</button>
        <input className="field mt-4 text-center text-[22px] tracking-[6px] font-extrabold" inputMode="numeric" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} />
        {msg && <p className="text-[12.5px] text-navy mt-3">{msg}</p>}
        <button className="btn mt-3" onClick={confirmer} disabled={busy || code.replace(/\s/g, '').length !== 6}>Confirmer le code</button>
        <button className="btn-ghost mt-2" onClick={() => setEtape(2)}>Je préfère photographier ma carte pro</button>
        <button className="btn-ghost mt-2" onClick={() => r.push('/deposer')}>Plus tard, je remplis mes souhaits</button>
      </>)}

      {etape === 4 && (<>
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3ED18B] to-[#149A5E] mx-auto flex items-center justify-center text-white text-3xl font-extrabold mt-2">✓</div>
        <h1 className="h1 text-center mt-4">Compte vérifié</h1>
        <p className="sub text-center mt-2">Ce que La Bourse aux permut&apos; conserve de vous, et rien d&apos;autre.</p>
        <div className="card mt-4">
          <div className="kv"><span>Nom et prénom</span><b>Chiffrés, table séparée</b></div>
          <div className="kv"><span>Matricule</span><b>Empreinte uniquement</b></div>
          <div className="kv"><span>Photo de la carte</span><b className="text-[#16804F]">{lecture ? 'Détruite' : 'Jamais demandée'}</b></div>
          <div className="kv"><span>Adresse pro</span><b>Chiffrée</b></div>
          <div className="kv"><span>Corps, grade, affectation</span><b>Pour le matching</b></div>
        </div>
        <div className="flex-1" />
        <button className="btn-dark mt-4" onClick={() => r.push('/deposer')}>Renseigner mes souhaits</button>
      </>)}
    </div></main>
  );
}

export default function Onboarding() {
  return <Suspense><OnboardingInner /></Suspense>;
}
HB_EOF

mkdir -p "app"
cat > "app/layout.tsx" << 'HB_EOF'
import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'La Bourse aux permut\'',
  description: 'Bouger, tenir, partir. Ici, personne ne le sait. Permutation de postes, écoute anonyme, préparation de l\'après. Police, gendarmerie, pénitentiaire.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#EEF2F8' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr"><body className="min-h-full">{children}</body></html>
  );
}
HB_EOF

cat > "README.md" << 'HB_EOF'
# La Bourse aux permut'

Permutation de postes, écoute anonyme et préparation de l'après pour policiers, gendarmes et personnels pénitentiaires.
Next.js 14 (App Router) · Supabase (Auth, Postgres, RLS) · Vercel (hébergement, cron) · Resend (mails) · Stripe (abonnement 9,99 €/mois).

## 1. GitHub
```bash
git init && git add -A && git commit -m "init La Bourse aux permut'"
gh repo create labourseauxpermut --private --source=. --push   # ou créer le repo sur github.com puis git remote add origin … && git push -u origin main
```

## 2. Supabase
1. Créer un projet (région **Frankfurt** ou **Paris**, pour rester en UE).
2. SQL Editor → exécuter dans l'ordre `0001` à `0005` (dossier `supabase/migrations`).
3. Authentication → Providers → Email : activer, **désactiver "Confirm email"** n'est pas nécessaire (on utilise le lien magique), mettre le **Site URL** sur `https://labourseauxpermut.fr` et ajouter `https://labourseauxpermut.fr/auth/callback` et `http://localhost:3000/auth/callback` dans Redirect URLs.
4. Authentication → Email Templates → "Magic Link" : sujet neutre, par exemple `Votre lien de connexion`, sans mention de mutation.
5. Project settings → API : copier URL, anon key, service_role key.

## 3. Resend
1. Ajouter le domaine `labourseauxpermut.fr`, créer les enregistrements DNS (DKIM, SPF, DMARC) chez le registrar.
2. Créer une clé API. Expéditeur : `La Bourse aux permut' <noreply@labourseauxpermut.fr>`.
3. Optionnel mais recommandé : dans Supabase → Authentication → SMTP, utiliser Resend en SMTP (`smtp.resend.com`, port 465, user `resend`, password = clé API) pour que les liens magiques partent aussi de labourseauxpermut.fr.

## 4. Stripe
1. Produit "La Bourse aux permut' Premium", prix récurrent **9,99 € / mois**, copier le `price_…` → `STRIPE_PRICE_ID`.
   Produit "Mise en avant 7 jours", prix unique **4,99 €** → `STRIPE_BOOST_PRICE_ID`.
2. Developers → Webhooks → endpoint `https://labourseauxpermut.fr/api/stripe/webhook`, événements : `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`. Copier le `whsec_…`.
3. Settings → Customer portal : activer, pour que la résiliation se fasse en un geste.

## 5. Vercel
```bash
npm i -g vercel
vercel link
# Variables : recopier .env.example dans Settings → Environment Variables (Production + Preview)
vercel env add IDENTITIES_KEY        # openssl rand -hex 32
vercel env add MATRICULE_PEPPER      # openssl rand -hex 32
vercel env add CRON_SECRET           # openssl rand -hex 32
vercel --prod
```
Le cron `/api/cron/matching` (toutes les heures) est déclaré dans `vercel.json` ; Vercel envoie automatiquement l'en-tête `Authorization: Bearer $CRON_SECRET`.
Domaine : ajouter `labourseauxpermut.fr` dans Vercel → Domains, puis les enregistrements DNS indiqués.

## 6. Local
```bash
cp .env.example .env.local   # remplir
npm install
npm run dev
```

## Périmètre v1
Permut' uniquement : annonces anonymes (style petites annonces) + matching intelligent (cycles à 2, 3, 4). Les modules Écoute et L'après sont retirés de l'app (tables conservées en base pour plus tard).

## Structure
- `app/onboarding` : institution → discrétion → carte pro (OCR éphémère) → mail pro (code 7 jours) → récap
- `app/(app)/accueil` : carte de France, fiche du jour, Parler / L'après
- `app/(app)/permut` : correspondances, détail, acceptation, révélation des identités
- `app/(app)/annonces` : annonces anonymes (3 en clair pour les gratuits, en-tête seule pour le reste, tout en Premium), publication gratuite, mise en avant 4,99 € / 7 j, réponse Premium
- `app/(app)/points`, `ecoute`, `apres`, `profil`
- `app/api/verify/*` : vérifications ; `app/api/cron/matching` : détection de cycles ; `app/api/stripe/*` ; `app/api/compte` : suppression totale
- `lib/matching.ts` : graphe et cycles 2 à 4, scoring
- `lib/crypto.ts` : AES-256-GCM pour les identités, sha256 + poivre pour le matricule
- `supabase/migrations/0001_schema.sql` : tables, RLS, vue anonymisée

## Modèle
| | Gratuit | Premium 9,99 € |
|---|---|---|
| Déposer une annonce | oui | oui, mise en avant permanente |
| Voir les annonces | 3 en clair, reste en-tête seule | toutes |
| Répondre à une annonce | non | illimité |
| Matching automatique | alertes à +48 h | alertes immédiates |
| Mise en relation | non | oui |
| Écoute, L'après | tout | tout |

Boost à l'unité : 4,99 € / 7 jours, sans abonnement.

## Ce qui reste pour la v1
- Référentiel complet des services (CSP, CRS, brigades, établissements) : à importer en CSV dans `services`
- Gabarits OCR par institution (`app/api/verify/card/route.ts`, regex à recaler sur de vraies cartes)
- Barème officiel par institution dans `app/(app)/points/page.tsx`
- Messagerie éphémère du module Écoute (Supabase Realtime broadcast, aucune persistance) une fois le partenariat PEPS signé
- Courriers PDF de permutation (génération côté serveur)
- Halos de la carte : vue agrégée `count(*) by departement` sur les profils vérifiés
- Capacitor pour iOS et Android (même schéma que WayPilot)
HB_EOF

cat > "package.json" << 'HB_EOF'
{
  "name": "labourseauxpermut",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.45.0",
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "resend": "^4.0.0",
    "stripe": "^17.0.0",
    "tesseract.js": "^5.1.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5"
  }
}
HB_EOF

cat > ".env.example" << 'HB_EOF'
# Supabase (Project settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Secrets applicatifs (générer avec : openssl rand -hex 32)
IDENTITIES_KEY=            # clé AES-256 de chiffrement des identités (64 hex)
MATRICULE_PEPPER=          # poivre du hachage matricule (64 hex)
CRON_SECRET=               # protège /api/cron/matching

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM="La Bourse aux permut' <noreply@labourseauxpermut.fr>"

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...        # abonnement 9,99 €/mois
STRIPE_BOOST_PRICE_ID=price_...  # mise en avant d'annonce 4,99 €, paiement unique

# Site
NEXT_PUBLIC_SITE_URL=https://labourseauxpermut.fr
HB_EOF

mkdir -p "lib"
cat > "lib/email.ts" << 'HB_EOF'
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

/** Mail volontairement neutre : aucune mention de mutation, au cas où l'écran serait visible. */
export async function envoyerCodePro(to: string, code: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Votre code : ${code}`,
    text: `Bonjour,\n\nVotre code de confirmation est : ${code}\nIl reste valable 7 jours.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\nLa Bourse aux permut'`,
  });
}
HB_EOF

mkdir -p "public"
base64 -d > "public/logo.png" << 'B64'
iVBORw0KGgoAAAANSUhEUgAABXgAAAEsCAYAAAB5W9vFAAA36ElEQVR42u3debjkVIH//3d1N0uzBWQTA9WIIoLIYkBkk2ETxA1EQZTNcbdQZ8Rl9Kvj7oC4
SwkqKrsggiMqICCIO0gERFFkLwggNEug2bqh6/dH0j/bntt9U1WpquTe9+t56unn6U5OTk5Ocvt+cuockCRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkqThakzXE2+2ul0vv5al0240bAVJkiRJkiRV2bQIsAxzVRZDX0mSJEmSJFXJlAyrDHQ1Kga+kiRJkiRJGqcpFU4Z
7GpcDHolSZIkSZI0DrUPpQx1VTWGvZIkSZIkSRqV2gZRBruqOoNeSZIkSZIkDVvtAiiDXdWNQa8kSZIkSZKGZUadKmu4qzqy30qSJEmSJGlYajGy0IBMU4Wj
eSVJkiRJklSmyo/gNdzVVGJ/liRJkiRJUpkqHfAahmkqsl9LkiRJkiSpLJX8urgBmKYLp2yQJEmSJEnSICo3gtdwV9OJ/V2SJEmSJEmDqFTAa9il6ch+L0mS
JEmSpH5VJuA15NJ0Zv+XJEmSJElSPyoR8BpuSd4HkiRJkiRJ6t3YA15DLcn7QZIkSZIkSf0Za8BrmCV5X0iSJEmSJKl/M2wCSZIkSZIkSaqnsQW8jlKUvD8k
SZIkSZI0mLEEvIZXkveJJEmSJEmSBjfygNfQSvJ+kSRJkiRJUjmcg1eSJEmSJEmSamqkAa+jESXvG0mSJEmSJJVnZAGvIZXk/SNJkiRJkqRyOUWDJEmSJEmS
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
pKloaFM0GD5Jw+P9JUmSJEmSJHAOXkmSJEmSJEmqraEGvI4ylLyvJEmSJEmSNDyO4JUkSZIkSZKkmjLglSRJkiRJkqSaGnrA69fJJe8nSZIkSZIkDYcjeCVJ
kiRJkiSppkYS8DrqUPI+kiRJkiRJUvkcwStJkiRJkiRJNTWygNfRh5L3jyRJkiRJkso10hG8hlSS940kSZIkSZLKM8smkCTVQafdWMVWkCRJkiTpX418Dl5H
I0reL5IkSZIkSSrHWBZZM7SSvE8kSZIkSZI0uBnjOrDhleT9IUmSJEmSpMHMsAkkSZIkSZIkqZ7GGvA6SlHyvpAkSZIkSVL/xj6C1zBL8n6QJEmSJElSfyox
RYOhluR9IEmSJEmSpN5VZg5ewy1NZ/Z/SZIkSZIk9aNSi6wZcmk6st9LkiRJkiSpXzOqViHDLk0n9ndJkiRJkiQNotLhUrPV7XqJNBUZ7EqSJEmSJKkMM6pc
OUMwTUX2a0mSJEmSJJVlRtUraBimqcT+LEmSJEmSpDLVKmxyygbVlcGuJEmSJEmShmFGnSprSKY6st9KkiRJkiRpWGobPDmaV1VnsCtJkiRJkqRhq30AZdCr
qjHYlSRJkiRJ0qhMqSDKsFfjYqgrSZIkSZKkcZiSoZRBr0bFYFeSJEmSJEnjNC3CKQNflcVAV5IkSZIkSVUybcMqQ19NxjBXkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJ
kiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiSpNP8fkj7X1sgtLoYAAAAASUVORK5CYII=
B64

mkdir -p "public"
base64 -d > "public/logo-blanc.png" << 'B64'
iVBORw0KGgoAAAANSUhEUgAABXgAAAEsCAYAAAB5W9vFAAA25UlEQVR42u3dd7QkVb238ec3DGFIgiRJM4iSkaAgklSSIPRVEJUgyRwI3hbD1QsGMIBebUVQ
UJSoEgSV2wKCgqCAIMgAAiI5Iwx5EBiG2e8fVbyOc8/Mqe6u7q465/ms1WvWOlO1a9euXTVzvr1rb5AkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZKk/orxeuKT90/Jy695ueeYCFtBkiRJkiRJVTYuAizDXJXF0FeSJEmSJElVMibDKgNdDYqBryRJkiRJkoZpTIVTBrsa
FoNeSZIkSZIkDUPtQylDXVWNYa8kSZIkSZIGpbZBlMGuqs6gV5IkSZIkSf1WuwDKYFd1Y9ArSZIkSZKkfplQp8oa7qqO7LeSJEmSJEnql1qMLDQg01jhaF5J
kiRJkiSVqfIjeA13NZbYnyVJkiRJklSmSge8hmEai+zXkiRJkiRJKkslXxc3ANN44ZQNkiRJkiRJ6kXlRvAa7mo8sb9LkiRJkiSpF5UKeA27NB7Z7yVJkiRJ
ktStygS8hlwaz+z/kiRJkiRJ6kYlAl7DLcn7QJIkSZIkSZ0besBrqCV5P0iSJEmSJKk7Qw14DbMk7wtJkiRJkiR1b4JNIEmSJEmSJEn1NLSA11GKkveHJEmS
JEmSejOUgNfwSvI+kSRJkiRJUu8GHvAaWkneL5IkSZIkSSqHc/BKkiRJkiRJUk0NNOB1NKLkfSNJkiRJkqTyDCzgNaSSvH8kSZIkSZJULqdokCRJkiRJkqSa
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
fpAkSZIkSVJ3KjFFg6GW5H0gSZIkSZKkzlVmDl7DLY1n9n9JkiRJkiR1o1KLrBlyaTyy30uSJEmSJKlbE6pWIcMujSf2d0mSJEmSJPWi0uHS5P1T8hJpLDLY
lSRJkiRJUhkmVLlyhmAai+zXkiRJkiRJKsuEqlfQMExjif1ZkiRJkiRJZapV2OSUDaorg11JkiRJkiT1w4Q6VdaQTHVkv5UkSZIkSVK/1DZ4cjSvqs5gV5Ik
SZIkSf1W+wDKoFdVY7ArSZIkSZKkQRlTQZRhr4bFUFeSJEmSJEnDMCZDKYNeDYrBriRJkiRJkoZpXIRTBr4qi4GuJEmSJEmSqmTchlWGvhqNYa4kSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk
SZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSVJp/h/rfaFTZdCULwAAAABJRU5ErkJggg==
B64

mkdir -p "public"
base64 -d > "public/icon.png" << 'B64'
iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAALWUlEQVR4nO3dzW0cRxhF0aHhOKgAqXCYICMZLwQbkklp/rqnq+qeA3DfG+K7eEWAL69v5/MJ
AEj56+gPAACeTwAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIA
AIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAA
AIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAk
AAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAE
CQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAA
QQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAA
QJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAAAECQAACBIAABAkAAAgSAAAQJAAAIAgAQAAQQIAAIIEAMCgPt6P/gJW
JgAABvbxLgTYhwAAmIAIYGsCAGAS1gC2JAAAJiMC2IIAAJiQNYBHCQCAiQkB7iUAABYgAriVAABYhDWAWwgAgMWIAK4hAAAWZA3gEgEAsDAhwO8IAIAAEcD/
CQCACGsAPxMAADEigNNJAAAkWQMQAABhQqBLAAAgAoIEAACn08kaUCMAAPiFCGgQAAB8Yg1YnwAA4LeEwLoEAAAXiYD1CAAArmINWIsAAOAmImANAgCAm1kD
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
B64

mkdir -p "public"
base64 -d > "public/porte.png" << 'B64'
iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAIaUlEQVR4nO3dfWxV9R3H8fdt7+1t6bBjmKFDcMYFhYUQXUxkTtlGoCgLIEZxmMEe2AMgzOkm
m8wtm4YtEzBocBoXNSzrnNFClDHpdESDexAI6laJJiI6wC24Fcco7X04Z398qeh84NL7cM753s8rKTT8cfsrfXM45/f73XNSoxeHISJONEQ9AJFKUtDiioIW
VxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUF
La4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioKuU8UAgjDqUVSegq5DQQgj2qA5
A7lC1KOpLAVdh/ryMOs86FgCY0dCbz8EQdSjqgwFXaeCAM47EzZ8G66eBkNbLPSkU9B17qQW+OFl8JtvwqRxdrQuFKMe1eApaAFg/Gj45SJY9QUY+SHozUES
rxkVtLwpm4F5F8FD18IV50O+YB9JoqDlHUYNh7VfhvuXwsdHwZFcci4aFbS8p0njoPM6uLodWpqgPwEXjQpa3tfQZvjBZbBxGXx6nEUd54tGBS0lGXMqdCyF
H18Bpw23i8Y4UtBSsoYUfG0yPPwdmPtJW2WM20pjOuoBlCpX8Ln3IAp9OciXcdowog3WfBGmToC1m2HbS9DcZMFHLRFBh8BFY6GtJeqR+NBfgPGjyn+d6efA
hWfDHV1w52P2DyWbKf91y5EavTiM9XEvBMIQfr8czv5I1KOR9/LsK7ByI3Q9B+lGSEd0MpuYc+i4navJ2004He75Bqy4Ek7+gO0LieJQmZigJf4yjfCVz0DX
crjqArvmqfWBSEFLxY1og9Xz4M4FttLYl6/dBb2Clqr53Lmw8Xq4djq0ZmsTtYKWqmrOwLIZsGQaZBqqf16diGk7Sa7efli9CdY9Cfmg+nPVClqqZv02uO13
0L0PsunaLLwoaKm4/T3wkw3Quc22nbbUcLFFQUvF9Ofhvifg9kfh9UPQlIZ0jQtLTNBRL6nK+9ux21YK//A3yKSj+3klIugUsPlZeH5v1CPxoRjAWafa+wjL
dbDXjsh3P26LKM1N5b9mOWIfdOroLyvWa7ddpfTm4JqLyw96w3bbmLTzZXtHSxz+F4190APi8JflRYgtUw/W/h64uRM6n4ZUCoZkKza0siUmaIleoQh3PQb3
PgGvvm5H5bhR0FKS5/fCjQ/A1hdsa2gcYwYFLcfxRq/NXnQ8BYf7bCk7zhS0vKsghC3dcPN66P67XcMk4TpGQcs77DkAKzbAwztsuTqupxfvRkHLm47k7NTi
513w6r9sTjkG73s9IQpaANi5B27qhCd32alFko7Kb6Wg69TAkbfnMKzaCA/+xT5vjdGc8mAo6Do0sPr6pxdhWQfs2menF3GfwShF7G9jIJUXhnDyUJuSO5Kz
zUReOPpWpFSpFBz4j/3uKWZQ0HWrwem7Sd19W7mCbY9M2nSTVIaboIPQzgcnjrH7GevCoD4l/pQjBHJ5eyzZknZY3A6vHLCjdKObf65SqkQHnS/aFXv7BLhx
NnzsFPtzD8/bk8FJZNBhaNGe8WFYNBXmXWhX7CKJC7o/b7drnT8JbpgFw1qjHpHESWKCDkK7ofbEMbB4qp1miPy/RATdl4fWZrhuOiyckox9uRKNWAddDOzC
b8Yn7Fl5E06PekQSd7EMOgztOSCnfBC+NxMuP19TcFKa2AWdKxy7E/zSaRa1SKliE3QxgEJgT2e6fgZMGT/41wqOTuvpqF452XQypkYjDzrEZi+Gtdqc8sIp
dpO/cgxrtUeOxeG5eV48/RIcOhL/qCPdD10IIAxsCm7pxXDOR6MaiRzPJT+FZ/bEf7tpJMMLj24kOm04fHcmzJkYxSjkRCTlbSA1DzpftHPbhVPgq5Nh1PBa
j0A8q1nQQWBTceNGwk1z7JG6IpVWk6BzBTipBZbPhrkX2Oci1VD1oIsBnHsGrJl/bHunSLVUfaY2lYJ/vgE7Xra4Raqp6kE3pOAfB2HJvbDgLti+u9pfUepZ
TdbSGo/eT3jTM3D5rXDLI3pXiVRHTReHmzO2mPKzR+DSVfDbnbX86lIPar7boSEFQ5rs5oBfvxu+tQ4OHKr1KOREJWUbQWQLmdm0rT51bLU7Xi6cCl+aVJkN
RT2H4akXdG+OSjrYm4yoY3Fvu0LRZkAmj4fvXwpjR5b3ett3Q/sK7barpGwmGUHHYqtJutE+Hv+r3RFzwWftfYNtQwb3egN3nVfQ9SdWP/JsxvZ63LoJPn8b
dD0X9YgkaWIVNLz9onH+HXDNOnitJ+pRSVLELugBTWnbe/urrTB7Nfxiix6NLMcX26DBZimGNNlTS2/4Ncy9HV58LepRSZzFOugB6Ua7yNvSDTNugR89BP/t
i3pUEkeJCHpAc8ZCXrsZZq60uWaRt0pU0HBsX8iuvTBnDSy6B/b9O+pRSVwkLugBmbTNiDz4Z5i1Eu7/ozY8SYKDBttr3dIE+w/a9tR5a6F7b3IfGinli8XS
d6X05e1OS586y3by+fnOpFSugoZjd2DKxmJRX2rN3Y+9sUF7OOqZfvTiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsr
ClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWVxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIW
VxS0uKKgxRUFLa4oaHFFQYsrClpcUdDiioIWV/4H9UrkveUtWyoAAAAASUVORK5CYII=
B64

echo "Marque renommée. Remplace public/logo.png, logo-blanc.png, icon.png, porte.png par le logo définitif."