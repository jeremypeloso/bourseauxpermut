'use client';
import { useState } from 'react';
import Image from 'next/image';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const envoyer = async () => {
    setErr(null);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email, options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setErr(error.message); else setEnvoye(true);
  };

  return (
    <main className="flex-1 flex flex-col justify-center px-6">
      <Image src="/porte.png" alt="" width={90} height={110} className="mx-auto drop-shadow-xl" priority />
      <h1 className="h1 text-center mt-6">Connexion</h1>
      <p className="sub text-center mt-2">Votre adresse personnelle, pas la pro. Un lien de connexion vous sera envoyé, sans mot de passe.</p>
      {envoye ? (
        <div className="card mt-6 text-center"><b>Lien envoyé.</b><div className="sub mt-1">Ouvrez le mail depuis ce téléphone.</div></div>
      ) : (
        <>
          <input className="field mt-6" type="email" placeholder="vous@exemple.fr" value={email} onChange={e => setEmail(e.target.value)} />
          {err && <p className="text-coral text-[12px] mt-2">{err}</p>}
          <button className="btn mt-3" onClick={envoyer} disabled={!email.includes('@')}>Recevoir mon lien</button>
        </>
      )}
    </main>
  );
}
