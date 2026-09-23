'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Mode = 'signup' | 'login' | 'oubli';
/**
 * Inscription : email personnel obligatoire → lien de confirmation → onboarding (carte pro OU code mail pro)
 * → définition du mot de passe. Connexion ensuite : email perso + mot de passe.
 */
export default function AuthModal({ open, initial, onClose }: { open: boolean; initial: Mode; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [voie, setVoie] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [pro, setPro] = useState('');
  const [mdp, setMdp] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const sb = supabaseBrowser();

  const inscrire = async () => {
    setBusy(true); setErr(null);
    const next = `/onboarding?voie=${voie}${voie === 2 && pro ? `&pro=${encodeURIComponent(pro)}` : ''}`;
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    setBusy(false); if (error) setErr(error.message); else setEnvoye(true);
  };
  const connecter = async () => {
    setBusy(true); setErr(null);
    const { error } = await sb.auth.signInWithPassword({ email, password: mdp });
    setBusy(false);
    if (error) return setErr(/Invalid login/i.test(error.message) ? 'Email ou mot de passe incorrect.' : error.message);
    location.href = '/annonces';
  };
  const oubli = async () => {
    setBusy(true); setErr(null);
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent('/compte/mot-de-passe')}` });
    setBusy(false); if (error) setErr(error.message); else setEnvoye(true);
  };
  const Tab = ({ m, t }: { m: Mode; t: string }) => <button onClick={() => { setMode(m); setEnvoye(false); setErr(null); }} className={`rounded-full px-4 py-2 text-[13px] font-bold ${mode === m ? 'bg-navy text-white' : 'bg-[#F5F7FB] text-[#6F7789]'}`}>{t}</button>;

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-[920px] max-w-full p-7 relative max-h-[92vh] overflow-y-auto">
        <button className="absolute right-4 top-3 text-2xl text-[#A3AAB8]" onClick={onClose}>×</button>
        <div className="flex gap-1.5"><Tab m="signup" t="Créer mon compte" /><Tab m="login" t="Connexion" /></div>

        {envoye ? (
          <div className="mt-6 text-center py-8"><b className="text-navy text-lg">Lien envoyé sur {email}</b><p className="sub mt-2">{mode === 'oubli' ? 'Ouvrez-le pour choisir un nouveau mot de passe.' : 'Ouvrez-le depuis l\'appareil sur lequel vous voulez utiliser le site. La vérification puis le choix du mot de passe suivent.'}</p></div>
        ) : mode === 'signup' ? (
          <>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy mt-4">Créer mon compte</h3>
            <p className="sub mt-1">Toujours avec votre <b>adresse personnelle</b> : c&apos;est elle qui servira à vous connecter. Aucun lien de connexion n&apos;ira jamais sur un poste de service.</p>
            <input className="field mt-4" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
            <p className="text-[13px] font-bold text-navy mt-5">Comment prouver que vous êtes des nôtres ?</p>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              {([1, 2] as const).map(v => (
                <button key={v} onClick={() => setVoie(v)} className={`text-left rounded-2xl p-4 border-[1.5px] ${voie === v ? 'border-bleu bg-[#E6EEFF]' : 'border-[#E6E9F0] bg-white'}`}>
                  <b className="block text-navy text-[14px]">{v === 1 ? 'Carte professionnelle' : 'Code sur ma boîte mail pro'}</b>
                  <p className="text-[12.5px] text-[#6F7789] mt-1">{v === 1 ? 'Photographiée dans l\'app à l\'étape suivante, lue puis détruite dans la seconde. Le plus discret.' : 'Un code à 6 chiffres sur votre adresse nominative de service, valable 7 jours. Le plus rapide.'}</p>
                </button>
              ))}
            </div>
            {voie === 2 && <input className="field mt-3" type="email" placeholder="prenom.nom@interieur.gouv.fr (adresse pro nominative)" value={pro} onChange={e => setPro(e.target.value)} />}
            <p className="sub mt-3">Vous recevrez un lien de confirmation. Une fois vérifié, vous choisirez votre mot de passe. En créant un compte, vous acceptez les <a href="/legal/cgv" target="_blank" className="text-bleu font-semibold">conditions générales</a> et la <a href="/legal/confidentialite" target="_blank" className="text-bleu font-semibold">politique de confidentialité</a>.</p>
            {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
            <button className="btn mt-3" onClick={inscrire} disabled={busy || !email.includes('@') || (voie === 2 && !pro.includes('@'))}>{busy ? 'Envoi…' : 'Recevoir mon lien de confirmation'}</button>
            <p className="sub text-center mt-3">Déjà un compte ? <button className="text-bleu font-semibold" onClick={() => setMode('login')}>Connexion</button></p>
          </>
        ) : mode === 'login' ? (
          <>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy mt-4">Connexion</h3>
            <p className="sub mt-1">Votre adresse personnelle et votre mot de passe.</p>
            <input className="field mt-3" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="field mt-2" type="password" placeholder="Mot de passe" value={mdp} onChange={e => setMdp(e.target.value)} onKeyDown={e => e.key === 'Enter' && connecter()} />
            {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
            <button className="btn mt-3" onClick={connecter} disabled={busy || !email.includes('@') || mdp.length < 6}>{busy ? 'Connexion…' : 'Se connecter'}</button>
            <div className="flex justify-between mt-3 text-[13px]"><button className="text-bleu font-semibold" onClick={() => setMode('oubli')}>Mot de passe oublié</button><button className="text-bleu font-semibold" onClick={() => setMode('signup')}>Créer mon compte</button></div>
          </>
        ) : (
          <>
            <h3 className="text-[24px] font-extrabold tracking-tight text-navy mt-4">Mot de passe oublié</h3>
            <p className="sub mt-1">Un lien vous sera envoyé sur votre adresse personnelle pour en choisir un nouveau.</p>
            <input className="field mt-3" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
            {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
            <button className="btn mt-3" onClick={oubli} disabled={busy || !email.includes('@')}>{busy ? 'Envoi…' : 'Recevoir le lien'}</button>
            <p className="sub text-center mt-3"><button className="text-bleu font-semibold" onClick={() => setMode('login')}>Retour à la connexion</button></p>
          </>
        )}
      </div>
    </div>
  );
}
