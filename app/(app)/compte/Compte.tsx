'use client';
import Link from 'next/link';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Paywall from '@/components/Paywall';
import { LIBELLES } from '@/lib/institutions';
import ContactForm from '@/components/ContactForm';

const Ico = ({ d, cls = 'w-5 h-5' }: { d: string; cls?: string }) => <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const I = { list: 'M4 5h16v14H4zM8 9h8M8 13h5', shield: 'M12 3l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V6zM9 12l2 2 4-4', star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', check: 'M5 12l4 4L19 6', x: 'M6 6l12 12M18 6L6 18' };

export default function Compte({ email, profil, gradeLibelle, souhaits, annonce, nbMatchs }: any) {
  const sb = supabaseBrowser(); const [pay, setPay] = useState(false); const [busy, setBusy] = useState(false);
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();
  const verifie = !!(profil?.verifie_carte || profil?.verifie_mail_pro); const deux = !!(profil?.verifie_carte && profil?.verifie_mail_pro);
  const boost = !!annonce?.mise_en_avant_jusqua && new Date(annonce.mise_en_avant_jusqua) > new Date();
  const svc = profil?.services; const initiales = (profil?.grade ?? profil?.institution ?? '?').slice(0, 3);
  const retirer = async () => { if (!confirm('Retirer votre annonce ? Vous pourrez la republier à tout moment.')) return; setBusy(true); await fetch('/api/annonces', { method: 'DELETE' }); location.reload(); };
  const supprimer = async () => { if (!confirm('Supprimer définitivement votre compte et toutes vos données ? Cette action est immédiate et irréversible.')) return; await fetch('/api/compte', { method: 'DELETE' }); await sb.auth.signOut(); location.href = '/'; };
  const NAV = [['#annonce', 'Mon annonce', I.list], ['#contact', 'Contact après accord', I.user], ['#verification', 'Vérification', I.shield], ['#abonnement', 'Abonnement', I.star], ['#profil', 'Poste et souhaits', I.user], ['#securite', 'Sécurité', I.lock], ['#donnees', 'Mes données', I.trash]];
  const Section = ({ id, t, d, children, action }: { id: string; t: string; d?: string; children: React.ReactNode; action?: React.ReactNode }) => (
    <section id={id} className="bg-white border border-[#E6E9F0] rounded-2xl p-5 md:p-6 scroll-mt-40">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4"><div><h2 className="text-[17px] font-extrabold text-navy">{t}</h2>{d && <p className="text-[13px] text-[#6F7789] mt-0.5">{d}</p>}</div>{action}</div>
      {children}
    </section>
  );
  const Ligne = ({ ok, t, s, action }: { ok: boolean | null; t: string; s: string; action?: React.ReactNode }) => (
    <div className="flex items-center gap-3 py-3 border-t border-[#F0F2F6] first:border-t-0">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ok === true ? 'bg-[#DFF7EB] text-[#16804F]' : ok === false ? 'bg-[#FFF3D6] text-[#9A6A00]' : 'bg-paper text-[#A3AAB8]'}`}><Ico d={ok === true ? I.check : I.x} cls="w-4 h-4" /></span>
      <span className="flex-1 min-w-0"><b className="block text-[14px] text-navy">{t}</b><span className="text-[12.5px] text-[#6F7789]">{s}</span></span>
      {action}
    </div>
  );

  return (
    <div className="max-w-[1040px] mx-auto">
      {/* En-tête */}
      <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5 md:p-6 mb-5 flex flex-wrap items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4C86FF] to-[#1B4FD6] text-white font-extrabold text-[18px] flex items-center justify-center shrink-0">{initiales}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[20px] font-extrabold text-navy tracking-tight truncate">{gradeLibelle ?? 'Agent'}{svc ? ` · ${svc.ville}` : ''}</div>
          <div className="text-[13px] text-[#6F7789] truncate">{LIBELLES[profil?.institution] ?? '—'} · {email}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={verifie ? 'pill-mint' : 'pill-amber'}>{deux ? 'Vérifié deux fois' : verifie ? 'Vérifié' : 'À vérifier'}</span>
            <span className={premium ? 'pill-mint' : 'pill-bleu'}>{premium ? 'Premium' : 'Gratuit'}</span>
            {annonce && <span className="pill bg-paper text-navy">Annonce en ligne</span>}
            {nbMatchs > 0 && <span className="pill bg-paper text-navy">{nbMatchs} match{nbMatchs > 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link href="/matchs" className="btn-ghost !py-2.5 px-4 text-[14px]">Mes matchs</Link>
          <Link href={annonce ? '/deposer' : '/deposer'} className="btn !w-auto !py-2.5 px-4 text-[14px] whitespace-nowrap">{annonce ? 'Modifier mon annonce' : 'Déposer une annonce'}</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-5 items-start">
        <nav className="hidden lg:block sticky top-[84px] bg-white border border-[#E6E9F0] rounded-2xl p-2">
          {NAV.map(([h, t, d]) => <a key={h} href={h} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold text-[#3B4457] hover:bg-paper"><Ico d={d} cls="w-[18px] h-[18px] text-[#6F7789]" />{t}</a>)}
        </nav>

        <div className="flex flex-col gap-4">
          <Section id="annonce" t="Mon annonce" d={annonce ? `Publiée le ${new Date(annonce.created_at).toLocaleDateString('fr-FR')} · visible par les agents vérifiés de votre institution` : 'Aucune annonce en ligne. C\'est gratuit, anonyme, et c\'est ce qui déclenche les correspondances.'}
            action={annonce ? <div className="flex gap-2"><Link href={`/annonces/${annonce.id}`} className="btn-ghost !w-auto !py-2 px-3.5 text-[13px]">Voir</Link><Link href="/deposer" className="btn !w-auto !py-2 px-3.5 text-[13px]">Modifier</Link></div> : <Link href="/deposer" className="btn !w-auto !py-2 px-3.5 text-[13px]">Déposer</Link>}>
            {annonce ? (
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex items-center gap-2 bg-paper rounded-xl px-3 py-2 font-bold text-[13.5px] text-navy"><i className="w-2 h-2 rounded-full bg-navy" />{svc?.ville ?? '—'}</span><span className="text-[#A3AAB8]">→</span>
                  {(annonce.cibles ?? []).map((c: any, i: number) => <span key={i} className="flex items-center gap-2 bg-paper rounded-xl px-3 py-2 font-bold text-[13.5px] text-navy"><i className="w-2 h-2 rounded-full bg-mint" />{c.ville ?? c.departement}</span>)}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4 text-[13px]">
                  <span className={boost ? 'pill-amber' : 'pill bg-paper text-[#6F7789]'}>{boost ? `Mise en avant jusqu'au ${new Date(annonce.mise_en_avant_jusqua).toLocaleDateString('fr-FR')}` : premium ? 'Mise en avant permanente (Premium)' : 'Sans mise en avant'}</span>
                  {!boost && !premium && <Link href="/deposer" className="text-bleu font-semibold">Mettre en avant 7 jours · 4,99 €</Link>}
                  <button onClick={retirer} disabled={busy} className="ml-auto text-[#C8323B] font-semibold">Retirer l&apos;annonce</button>
                </div>
              </>
            ) : null}
          </Section>

          <section id="contact" className="bg-white border border-[#E6E9F0] rounded-2xl p-5 md:p-6 scroll-mt-40"><ContactForm /></section>

          <Section id="verification" t="Vérification" d="Une seule vérification suffit. La seconde donne le badge « Vérifié deux fois », mieux placé dans les résultats.">
            <Ligne ok={!!profil?.verifie_carte} t="Carte professionnelle" s={profil?.verifie_carte ? 'Lue puis détruite dans la seconde. Il ne reste qu\'une empreinte du matricule.' : 'Photo du verso, analysée puis détruite. Le plus discret.'} action={!profil?.verifie_carte && <Link href="/onboarding" className="btn-ghost !w-auto !py-2 px-3.5 text-[13px]">Vérifier</Link>} />
            <Ligne ok={!!profil?.verifie_mail_pro} t="Adresse professionnelle" s={profil?.verifie_mail_pro ? 'Confirmée par code. L\'adresse est chiffrée, jamais réutilisée.' : 'Code à 6 chiffres sur votre boîte nominative. Le plus rapide.'} action={!profil?.verifie_mail_pro && <Link href="/onboarding" className="btn-ghost !w-auto !py-2 px-3.5 text-[13px]">Vérifier</Link>} />
          </Section>

          <Section id="abonnement" t="Abonnement" action={<span className={premium ? 'pill-mint' : 'pill-bleu'}>{premium ? 'Premium' : 'Gratuit'}</span>}>
            {premium ? (
              <div className="grid sm:grid-cols-2 gap-3 text-[13.5px]">
                <div className="bg-paper rounded-xl p-3"><b className="block text-navy">Actif jusqu&apos;au {new Date(profil.premium_jusqua).toLocaleDateString('fr-FR')}</b><span className="text-[#6F7789]">{profil?.premium_offert_le && !profil?.stripe_customer_id ? 'Mois de lancement offert, sans carte bancaire. Rien ne se renouvelle tout seul : à la fin, vous repassez en Gratuit sauf si vous vous abonnez.' : 'Renouvelé automatiquement chaque mois.'}</span></div>
                <div className="bg-paper rounded-xl p-3"><b className="block text-navy">Résilier</b><span className="text-[#6F7789]">Depuis le portail Stripe (lien dans votre reçu) ou en écrivant à contact@labourseauxpermut.fr. Effet en fin de période.</span></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
                <ul className="text-[13.5px] text-[#3B4457] grid sm:grid-cols-2 gap-x-4 gap-y-1.5">{['Toutes les annonces en clair', 'Réponses et mises en relation illimitées', 'Votre annonce mise en avant en permanence', 'Alertes de match immédiates (au lieu de 48 h)'].map(t => <li key={t} className="flex gap-2"><span className="text-mint font-extrabold">✓</span>{t}</li>)}</ul>
                <button className="btn !w-auto !py-3 px-5" onClick={() => setPay(true)}>Passer en Premium · 9,99 €/mois</button>
              </div>
            )}
          </Section>

          <Section id="profil" t="Poste et souhaits" d="Ce que le matching utilise. Jamais visible tel quel par les autres agents." action={<Link href="/deposer" className="btn-ghost !w-auto !py-2 px-3.5 text-[13px]">Modifier</Link>}>
            <div className="grid sm:grid-cols-2 gap-x-6 text-[13.5px]">
              <div>
                <div className="kv"><span>Institution</span><b>{LIBELLES[profil?.institution] ?? '—'}</b></div>
                <div className="kv"><span>Corps · grade</span><b>{profil?.corps ?? '—'} · {gradeLibelle ?? '—'}</b></div>
                <div className="kv"><span>Affectation</span><b>{svc ? `${svc.libelle} (${svc.departement})` : '—'}</b></div>
                <div className="kv"><span>Type de service</span><b>{profil?.type_service ?? '—'}</b></div>
              </div>
              <div>
                <div className="kv"><span>Ancienneté dans le poste</span><b>{profil?.anciennete_poste_mois != null ? `${Math.floor(profil.anciennete_poste_mois / 12)} ans ${profil.anciennete_poste_mois % 12} mois` : '—'}</b></div>
                <div className="kv"><span>Départ possible dès</span><b>{profil?.depart_des ? new Date(profil.depart_des).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}</b></div>
                <div className="kv"><span>Cycles à 3 ou 4</span><b>{profil?.accepte_cycles ? 'Acceptés' : 'Refusés'}</b></div>
                <div className="kv"><span>Souhaits</span><b className="text-right">{souhaits.length ? souhaits.map((s: any) => s.services?.ville ?? s.services?.departement).join(' · ') : '—'}</b></div>
              </div>
            </div>
          </Section>

          <Section id="securite" t="Sécurité">
            <div className="flex flex-wrap gap-2">
              <Link href="/compte/mot-de-passe" className="btn-ghost !w-auto !py-2.5 px-4 text-[13.5px]">Changer mon mot de passe</Link>
              <button className="btn-ghost !w-auto !py-2.5 px-4 text-[13.5px]" onClick={async () => { await sb.auth.signOut(); location.href = '/'; }}>Se déconnecter</button>
            </div>
            <p className="text-[12.5px] text-[#6F7789] mt-3">Connexion avec votre adresse personnelle. Membre depuis le {profil?.created_at ? new Date(profil.created_at).toLocaleDateString('fr-FR') : '—'}.</p>
          </Section>

          <Section id="donnees" t="Mes données" d="Ce que La Bourse aux permut' conserve, et rien d'autre.">
            <div className="grid sm:grid-cols-2 gap-x-6 text-[13.5px] mb-4">
              <div><div className="kv"><span>Nom et prénom</span><b>Chiffrés, table séparée</b></div><div className="kv"><span>Matricule</span><b>Empreinte uniquement</b></div></div>
              <div><div className="kv"><span>Photo de la carte</span><b className="text-[#16804F]">Jamais stockée</b></div><div className="kv"><span>Adresse pro</span><b>Chiffrée, jamais réutilisée</b></div></div>
            </div>
            <div className="flex flex-wrap items-center gap-3 bg-[#FFF5F5] border border-[#FFD3D6] rounded-xl p-4">
              <span className="flex-1 min-w-[220px] text-[13px] text-[#3B4457]"><b className="text-navy">Supprimer mon compte.</b> Compte, annonce, souhaits, correspondances, identité chiffrée : tout est effacé immédiatement et définitivement.</span>
              <button className="text-[13.5px] font-bold text-white bg-[#C8323B] rounded-xl px-4 py-2.5" onClick={supprimer}>Supprimer mon compte</button>
            </div>
          </Section>
        </div>
      </div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
