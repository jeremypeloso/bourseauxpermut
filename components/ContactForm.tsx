'use client';
import { useEffect, useState } from 'react';

/** Téléphone + email de contact, révélés uniquement après accord de tous les agents d'une correspondance. */
export default function ContactForm({ onDone, titre = 'Comment vous joindre après un accord', bouton = 'Enregistrer' }: { onDone?: () => void; titre?: string; bouton?: string }) {
  const [tel, setTel] = useState(''); const [email, setEmail] = useState(''); const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(false);
  useEffect(() => { fetch('/api/contact').then(r => r.json()).then(j => { if (j.ok) { setTel(j.telephone ?? ''); setEmail(j.email ?? ''); } }); }, []);
  const save = async () => {
    setBusy(true); setMsg(null);
    const j = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telephone: tel, email }) }).then(r => r.json());
    setBusy(false);
    if (!j.ok) return setMsg(j.message ?? 'Erreur');
    setOk(true); setMsg('Enregistré.'); onDone?.();
  };
  return (
    <div>
      <h2 className="text-[17px] font-extrabold text-navy">{titre}</h2>
      <p className="text-[13px] text-[#6F7789] mt-1 mb-3">Chiffrés, jamais affichés avant que tous les agents d&apos;une correspondance aient accepté. C&apos;est ce que vos permutants verront pour vous appeler.</p>
      <div className="grid sm:grid-cols-2 gap-2">
        <label className="block text-[12px] text-[#6F7789]">Téléphone portable<input className="field mt-1" type="tel" inputMode="tel" placeholder="06 12 34 56 78" value={tel} onChange={e => setTel(e.target.value)} /></label>
        <label className="block text-[12px] text-[#6F7789]">Email de contact<input className="field mt-1" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} /></label>
      </div>
      {msg && <p className={`text-[12.5px] mt-2 ${ok ? 'text-[#16804F]' : 'text-coral'}`}>{msg}</p>}
      <button className="btn mt-3" onClick={save} disabled={busy || tel.replace(/\D/g, '').length < 10}>{busy ? 'Enregistrement…' : bouton}</button>
    </div>
  );
}
