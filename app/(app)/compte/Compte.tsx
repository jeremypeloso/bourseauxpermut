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
          <Link href="/compte/mot-de-passe" className="btn-ghost !py-2.5">Changer mon mot de passe</Link>
          <button className="btn-ghost mt-2 !py-2.5" onClick={async () => { await sb.auth.signOut(); location.href = '/'; }}>Se déconnecter</button>
          <button className="btn-ghost mt-2 !py-2.5 text-[#C8323B] border-[#FFD3D6]" onClick={supprimer}>Supprimer mon compte et toutes mes données</button>
        </Panel>
      </div>
      <Paywall open={pay} onClose={() => setPay(false)} />
    </div>
  );
}
