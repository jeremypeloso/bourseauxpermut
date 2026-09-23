'use client';
import { useState } from 'react';
import Image from 'next/image';
import AuthModal from './AuthModal';
import CarteFrance from './CarteFrance';

const HALOS = [{ lat: 48.86, lng: 2.35, n: 1240 }, { lat: 45.76, lng: 4.83, n: 310 }, { lat: 43.30, lng: 5.37, n: 180 }, { lat: 50.63, lng: 3.06, n: 260 }, { lat: 44.84, lng: -0.58, n: 95 }, { lat: 47.22, lng: -1.55, n: 120 }, { lat: 48.58, lng: 7.75, n: 140 }, { lat: 48.11, lng: -1.68, n: 60 }, { lat: 49.44, lng: 1.1, n: 70 }, { lat: 45.19, lng: 5.72, n: 60 }];

export default function Landing() {
  const [modal, setModal] = useState<null | 'signup' | 'login'>(null);
  const Btn = ({ m, t, cls = '' }: { m: 'signup' | 'login'; t: string; cls?: string }) => <button onClick={() => setModal(m)} className={cls}>{t}</button>;

  return (
    <div className="w-full text-[#141A26]">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-[#E6E9F0]">
        <div className="max-w-[1180px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Image src="/logo.png" alt="Hors Boîte" width={150} height={38} priority />
          <nav className="hidden md:flex gap-7 text-[14px] font-semibold text-[#6F7789]"><a href="#modules">Ce que ça fait</a><a href="#comment">Comment on entre</a><a href="#discretion">Discrétion</a><a href="#tarif">Tarif</a></nav>
          <div className="flex gap-2"><Btn m="login" t="Connexion" cls="btn-ghost !w-auto !py-3" /><Btn m="signup" t="Créer mon compte" cls="btn !w-auto !py-3" /></div>
        </div>
      </header>

      <section className="relative overflow-hidden min-h-[640px] flex items-center">
        <picture className="absolute inset-0">
          <source media="(max-width: 767px)" srcSet="/hero-mobile.jpg" />
          <img src="/hero.jpg" alt="" className="w-full h-full object-cover object-[70%_center]" />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,20,38,.96)_0%,rgba(11,20,38,.88)_38%,rgba(11,20,38,.35)_70%,rgba(11,20,38,.15)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B1426] to-transparent" />
        <div className="relative max-w-[1180px] mx-auto px-6 py-24 w-full">
          <div className="max-w-[620px]">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white text-[12px] font-bold px-3 py-1.5 rounded-full backdrop-blur"><i className="w-2 h-2 rounded-full bg-[#8FF0C0]" />Police · Gendarmerie · Pénitentiaire</span>
            <h1 className="text-[46px] md:text-[62px] font-extrabold tracking-[-2px] leading-[1.0] text-white mt-6">Bouger, tenir, partir.<br /><span className="text-[#8FB4FF]">Ici, personne ne le sait.</span></h1>
            <p className="text-[18px] text-[#C7D0E4] max-w-[54ch] mt-5">L&apos;app qui trouve le collègue avec qui échanger votre poste, qui vous met en relation avec un pair quand ça ne va pas, et qui vous aide à préparer l&apos;après si un jour la question se pose. Sans la hiérarchie. Sans les syndicats. Sans trace.</p>
            <div className="flex flex-wrap gap-3 mt-8"><Btn m="signup" t="Créer mon compte" cls="btn !w-auto !px-7 !py-4 text-[16px]" /><Btn m="login" t="J'ai déjà un compte" cls="!w-auto !px-7 !py-4 text-[16px] rounded-2xl font-bold text-white bg-white/10 border border-white/25 backdrop-blur" /></div>
            <div className="flex flex-wrap gap-5 mt-7 text-[13px] text-[#C7D0E4]">{['Identité masquée', 'Carte pro jamais stockée', 'Gratuit pour commencer', 'Conçu par un ancien policier'].map(t => <span key={t}><span className="text-[#8FF0C0] font-extrabold mr-1.5">✓</span>{t}</span>)}</div>
          </div>
        </div>
      </section>

      <div className="bg-navy text-[#A9B7D6] text-[13.5px] py-4"><div className="max-w-[1180px] mx-auto px-6 flex flex-wrap justify-center gap-8"><span><b className="text-white">Permutation</b> à 2, 3 ou 4 collègues</span><span><b className="text-white">Écoute</b> anonyme, gratuite, avec PEPS-SOS</span><span><b className="text-white">L&apos;après</b> préparé sans que la boîte le sache</span></div></div>

      <section className="py-16 bg-paper"><div className="max-w-[1180px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative rounded-[30px] bg-gradient-to-b from-[#DCE5F5] to-[#E9EEF7] p-6 shadow-[0_30px_60px_-30px_rgba(15,27,51,.45)]">
          <div className="absolute right-5 top-5 bg-navy text-white rounded-2xl px-3.5 py-2.5 text-[11px] text-right leading-tight z-10"><b className="block text-[22px] text-[#8FF0C0]">2 405</b>collègues en recherche<br />ce mois-ci</div>
          <CarteFrance halos={HALOS} points={[{ lat: 43.61, lng: 3.88, label: 'Montpellier', cls: 'me' }, { lat: 43.70, lng: 7.27, label: 'Nice', cls: 'wish' }, { lat: 43.60, lng: 1.44, label: 'Toulouse', cls: 'other' }]} cycle={[[3.88, 43.61], [7.27, 43.70], [1.44, 43.60]]} />
          <div className="absolute left-5 bottom-5 bg-white rounded-2xl px-3.5 py-2.5 text-[12.5px] text-navy shadow-lg max-w-[260px]"><b className="block">Un cycle à 3 s&apos;est fermé</b>Montpellier → Nice → Toulouse. Chacun obtient son souhait n°1.</div>
        </div>
        <div>
          <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Vous n&apos;êtes pas le seul à vouloir bouger.</h2>
          <p className="text-[16px] text-[#6F7789] mt-3">Des milliers de collègues attendent une mutation qui ne vient pas. Beaucoup veulent exactement le poste que quelqu&apos;un d&apos;autre veut quitter. Le seul problème, c&apos;est qu&apos;ils ne le savent pas, et qu&apos;ils ne peuvent le dire à personne.</p>
          <p className="text-[16px] text-[#6F7789] mt-3">Hors Boîte croise les souhaits en silence et ferme les cycles : vous allez à Nice, Nice va à Toulouse, Toulouse vient chez vous. Personne n&apos;a rien demandé à personne.</p>
          <div className="flex gap-6 mt-6">{[['2 à 4', 'agents par cycle'], ['1 h', 'entre deux passages'], ['0', 'nom visible avant accord']].map(([b, s]) => <div key={s}><b className="block text-[28px] font-extrabold tracking-tight text-navy">{b}</b><span className="text-[12.5px] text-[#6F7789]">{s}</span></div>)}</div>
        </div>
      </div></section>

      <section id="modules" className="py-20"><div className="max-w-[1180px] mx-auto px-6">
        <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Trois choses, et rien d&apos;autre.</h2>
        <p className="text-[16px] text-[#6F7789] max-w-[62ch] mt-2">Chaque module répond à un moment de carrière. Chacun est cloisonné des deux autres : ce que vous faites dans l&apos;un n&apos;apparaît jamais dans les autres.</p>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[
            ['from-[#4C86FF] to-[#1B4FD6]', 'Bouger', 'bg-[#E6EEFF] text-bleud', 'Permuter son poste', 'Vous voulez Nice, un collègue de Nice veut Toulouse, un collègue de Toulouse veut Montpellier. Personne ne le sait, sauf notre algorithme, qui ferme le cycle et vous prévient.', ['Échanges à 2, 3 ou 4, toutes les heures', 'Score de compatibilité, points de friction', 'Identités révélées seulement quand tous ont accepté', 'Courriers de permutation prêts à signer']],
            ['from-[#3ED18B] to-[#149A5E]', 'Tenir · gratuit', 'bg-[#DFF7EB] text-[#16804F]', 'Parler à un collègue', 'Quand ça ne va pas, parler à quelqu\'un qui connaît le métier, sans passer par le service médical ni la hiérarchie. Des pairs-aidants formés, en partenariat avec PEPS-SOS.', ['Pseudo aléatoire, sans lien avec votre compte', 'Échanges éphémères, rien n\'est conservé', 'Le 3114 sur chaque écran', 'Accessible sans abonnement, sans vérification']],
            ['from-[#A66BFF] to-[#6C3BC9]', 'Partir', 'bg-[#F1E8FF] text-[#6C3BC9]', 'Préparer l\'après', 'Y penser n\'engage à rien. Disponibilité, détachement, rupture conventionnelle, démission : ce que vous gardez, ce que vous touchez, et ce que vaut votre expérience dehors.', ['Les voies de sortie, sans jargon', 'Votre parcours traduit pour un recruteur', 'Métiers où votre profil est recherché', 'Parler à un ancien déjà parti']],
          ].map(([g, tag, tagc, h, p, li]: any) => (
            <div key={h} className="bg-white border border-[#E6E9F0] rounded-3xl p-7 shadow-[0_14px_34px_-20px_rgba(15,27,51,.2)]">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g} mb-4`} />
              <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-2 ${tagc}`}>{tag}</span>
              <h3 className="text-[22px] font-extrabold tracking-tight text-navy">{h}</h3>
              <p className="text-[14.5px] text-[#3B4457] mt-2">{p}</p>
              <ul className="mt-3 text-[13.5px] text-[#6F7789] space-y-1">{li.map((x: string) => <li key={x} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-bleu">{x}</li>)}</ul>
            </div>
          ))}
        </div>
      </div></section>

      <section id="comment" className="py-20 bg-paper"><div className="max-w-[1180px] mx-auto px-6">
        <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Comment on entre</h2>
        <p className="text-[16px] text-[#6F7789] max-w-[62ch] mt-2">L&apos;app est réservée aux agents. Il faut prouver une fois que vous en êtes, de la façon qui vous arrange. Dans les deux cas, rien de ce que vous montrez n&apos;est conservé.</p>
        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <div className="bg-white rounded-3xl p-7 border-[1.5px] border-bleu"><span className="inline-block bg-navy text-white text-[12px] font-extrabold px-3 py-1 rounded-full mb-3">Voie 1</span><h3 className="text-[20px] font-extrabold text-navy">Email personnel + carte pro</h3><p className="text-[14.5px] text-[#3B4457] mt-2">Vous n&apos;avez pas envie que quoi que ce soit passe par votre messagerie de service.</p><ol className="list-decimal ml-5 mt-4 text-[14px] text-[#3B4457] space-y-1"><li>Vous créez le compte avec votre adresse perso (lien de connexion, pas de mot de passe)</li><li>Vous photographiez votre carte professionnelle dans l&apos;app</li><li>Elle est lue, puis détruite dans la seconde. Il ne reste qu&apos;une empreinte du matricule, impossible à inverser</li></ol><div className="mt-4 bg-[#F5F7FB] rounded-xl px-3 py-2.5 text-[12.5px] text-[#6F7789]">Le plus discret. Aucun mail ne transite par la boîte.</div></div>
          <div className="bg-white rounded-3xl p-7 border-[1.5px] border-[#E6E9F0]"><span className="inline-block bg-navy text-white text-[12px] font-extrabold px-3 py-1 rounded-full mb-3">Voie 2</span><h3 className="text-[20px] font-extrabold text-navy">Email professionnel + code</h3><p className="text-[14.5px] text-[#3B4457] mt-2">Vous préférez ne rien photographier.</p><ol className="list-decimal ml-5 mt-4 text-[14px] text-[#3B4457] space-y-1"><li>Vous saisissez votre adresse nominative en @interieur.gouv.fr, @gendarmerie.interieur.gouv.fr ou @justice.fr</li><li>Un code à 6 chiffres part sur cette boîte, dans un mail neutre qui ne dit rien de l&apos;app</li><li>Vous le saisissez au service, dans les 7 jours. Votre adresse pro est ensuite chiffrée et ne sert plus qu&apos;à ça</li></ol><div className="mt-4 bg-[#F5F7FB] rounded-xl px-3 py-2.5 text-[12.5px] text-[#6F7789]">Le plus rapide. Rien à photographier, rien à stocker.</div></div>
        </div>
        <p className="text-center text-[12.5px] text-[#6F7789] mt-5">Vous pouvez faire les deux : c&apos;est le badge « Vérifié deux fois », qui rassure les collègues avec qui vous permuterez.</p>
      </div></section>

      <section id="discretion" className="py-20"><div className="max-w-[1180px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Ce qu&apos;on ne saura jamais</h2>
          <p className="text-[16px] text-[#6F7789] mt-2">La discrétion administrative n&apos;est pas une option. C&apos;est la raison d&apos;être de l&apos;app.</p>
          <div className="mt-5">{[['Identité masquée', 'Nom, matricule, service : jamais affichés avant une acceptation mutuelle.'], ['Aucun annuaire, aucune recherche par nom', 'Vous ne voyez que vos correspondances. Vos collègues ne peuvent pas vous trouver.'], ['Carte pro détruite, matricule haché', 'La photo sert à vérifier, puis elle disparaît. Il ne reste qu\'une empreinte non réversible.'], ['Aucun accès pour l\'administration, la hiérarchie ou les syndicats', 'Hébergé en Europe, chiffré, jamais vendu, sans publicité.'], ['Suppression totale en un geste', 'Compte, souhaits, historique : tout disparaît immédiatement.']].map(([b, s]) => <div key={b} className="flex gap-3.5 py-3.5 border-t border-[#E6E9F0] first:border-t-0"><span className="w-7 h-7 rounded-full bg-[#DFF7EB] text-[#16804F] font-extrabold text-[13px] flex items-center justify-center shrink-0">✓</span><span><b className="block text-navy">{b}</b><span className="text-[13.5px] text-[#6F7789]">{s}</span></span></div>)}</div>
        </div>
        <div className="bg-navy text-white rounded-[28px] p-9"><p className="text-[20px] leading-[1.45]">« J&apos;ai passé des années dans la boîte. Je sais ce qu&apos;on ne dit pas au service : qu&apos;on veut partir, qu&apos;on ne dort plus, qu&apos;on regarde ailleurs. Hors Boîte, c&apos;est l&apos;endroit où on peut le dire sans que ça remonte. »</p><small className="block mt-4 text-[#A9B7D6] text-[13px]">Le fondateur, ancien fonctionnaire de police</small></div>
      </div></section>

      <section id="tarif" className="py-20 bg-paper"><div className="max-w-[1180px] mx-auto px-6">
        <h2 className="text-[36px] font-extrabold tracking-[-1.2px] text-navy">Gratuit pour commencer. 9,99 € quand ça devient concret.</h2>
        <div className="grid md:grid-cols-2 gap-5 mt-10 max-w-[820px]">
          <div className="bg-white rounded-3xl p-7 border-[1.5px] border-[#E6E9F0]"><b>Gratuit</b><div className="text-[40px] font-extrabold tracking-tight">0 €</div><ul className="mt-3 text-[14px] space-y-1.5">{['Profil, souhaits, vérification', 'Savoir que des correspondances existent', 'Écoute entre collègues, sans limite', 'Fiches et voies de sortie de L\'après'].map(t => <li key={t} className="flex gap-2"><span className="text-mint font-extrabold">✓</span>{t}</li>)}<li className="flex gap-2 opacity-50"><span>–</span>Détail et mise en relation (alertes avec 48 h de retard)</li></ul></div>
          <div className="rounded-3xl p-7 text-white bg-gradient-to-br from-navy2 to-navy"><b>Premium</b><div className="text-[40px] font-extrabold tracking-tight">9,99 €<small className="text-[14px] text-[#A9B7D6] font-semibold"> / mois</small></div><ul className="mt-3 text-[14px] space-y-1.5">{['Matching à 2, 3 et 4 agents, en continu', 'Alertes immédiates', 'Mise en relation illimitée', 'Simulateur de points, historique par ville', 'Courriers prêts à signer, CV traduit', '1 € par mois reversé à l\'écoute entre collègues'].map(t => <li key={t} className="flex gap-2"><span className="text-[#8FF0C0] font-extrabold">✓</span>{t}</li>)}</ul><p className="text-[12.5px] text-[#A9B7D6] mt-4">Sans engagement. Résiliable en un geste dès votre mutation obtenue.</p></div>
        </div>
        <div className="flex items-center gap-5 bg-white rounded-2xl px-6 py-5 mt-10"><span className="text-[32px] font-extrabold text-coral tracking-tight">3114</span><div><b className="block text-navy">Vous êtes en danger ou en détresse ?</b><span className="text-[13.5px] text-[#6F7789]">Numéro national de prévention du suicide, gratuit, 24 h/24, confidentiel. L&apos;écoute dans Hors Boîte est une écoute entre pairs, pas un service d&apos;urgence.</span></div></div>
      </div></section>

      <footer className="border-t border-[#E6E9F0] py-7 text-[13px] text-[#6F7789]"><div className="max-w-[1180px] mx-auto px-6 flex flex-wrap justify-between gap-3"><span>© Hors Boîte · PELOSO CORPORATION · Hébergé en Europe</span><span className="flex gap-4"><a href="#">Confidentialité</a><a href="#">CGV</a><a href="#">Mentions légales</a><a href="mailto:contact@horsboite.fr">contact@horsboite.fr</a></span></div></footer>

      <AuthModal open={!!modal} initial={modal ?? 'signup'} onClose={() => setModal(null)} />
    </div>
  );
}
