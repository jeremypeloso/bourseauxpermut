'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

/** Définition (ou changement) du mot de passe. Marque user_metadata.mdp = true. */
export default function MotDePasse({ onDone, titre = 'Choisissez votre mot de passe' }: { onDone: () => void; titre?: string }) {
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const ok = a.length >= 8 && /[0-9]/.test(a) && /[a-zA-Z]/.test(a);
  const valider = async () => {
    if (a !== b) return setErr('Les deux mots de passe ne correspondent pas.');
    setBusy(true); setErr(null);
    const { error } = await supabaseBrowser().auth.updateUser({ password: a, data: { mdp: true } });
    setBusy(false); if (error) return setErr(error.message); onDone();
  };
  return (
    <>
      <h1 className="h1">{titre}</h1>
      <p className="sub mt-2">Il servira à chaque connexion, avec votre adresse personnelle. Au moins 8 caractères, avec des lettres et un chiffre.</p>
      <input className="field mt-5" type="password" placeholder="Mot de passe" value={a} onChange={e => setA(e.target.value)} autoComplete="new-password" />
      <input className="field mt-2" type="password" placeholder="Confirmer le mot de passe" value={b} onChange={e => setB(e.target.value)} autoComplete="new-password" />
      <div className="flex gap-1.5 mt-2">{[a.length >= 8, /[a-zA-Z]/.test(a), /[0-9]/.test(a)].map((v, i) => <span key={i} className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${v ? 'bg-[#DFF7EB] text-[#16804F]' : 'bg-paper text-[#A3AAB8]'}`}>{['8 caractères', 'une lettre', 'un chiffre'][i]}</span>)}</div>
      {err && <p className="text-coral text-[12.5px] mt-2">{err}</p>}
      <button className="btn mt-4" onClick={valider} disabled={busy || !ok || !b}>{busy ? 'Enregistrement…' : 'Enregistrer mon mot de passe'}</button>
    </>
  );
}
