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
