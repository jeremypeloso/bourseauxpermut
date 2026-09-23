'use client';
import { useState } from 'react';

export default function Paywall({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const go = async () => {
    setBusy(true);
    const { url } = await fetch('/api/stripe/checkout', { method: 'POST' }).then(r => r.json());
    if (url) location.href = url; else setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-end" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[430px] mx-auto bg-paper rounded-t-[30px] px-5 pt-3 pb-8">
        <div className="w-10 h-1.5 bg-[#CBD0DA] rounded-full mx-auto mb-4" />
        <h2 className="h1 text-center text-[22px]">Voir cette correspondance</h2>
        <p className="sub text-center my-3">Le prix d&apos;un aller-retour en train par mois, pour ne plus en faire.</p>
        <div className="rounded-3xl p-5 text-white bg-gradient-to-br from-navy2 to-navy">
          <div className="flex justify-between items-center"><span className="pill bg-[#22B573]/25 text-[#8FF0C0]">Premium</span><span className="text-[34px] font-extrabold tracking-tight">9,99 €<small className="text-[13px] text-[#A9B7D6] font-semibold"> / mois</small></span></div>
          <ul className="mt-3 text-[13.5px] text-[#DCE4F5] space-y-1.5">
            {['Toutes les annonces en clair, réponse illimitée', 'Votre annonce mise en avant en permanence', 'Alertes immédiates, au lieu de 48 h de retard', 'Mise en relation illimitée', 'Simulateur de points, courriers prêts à signer', '1 € par mois reversé à l\'écoute entre collègues'].map(t => <li key={t} className="flex gap-2"><span className="text-[#8FF0C0]">✓</span>{t}</li>)}
          </ul>
          <button className="btn mt-4" onClick={go} disabled={busy}>{busy ? 'Redirection…' : 'Passer en Premium'}</button>
          <p className="text-center text-[11px] text-[#A9B7D6] mt-2">Sans engagement, sans période d&apos;essai. Résiliable en un geste dès votre mutation obtenue.</p>
        </div>
        <button className="btn-ghost mt-3" onClick={onClose}>Plus tard</button>
      </div>
    </div>
  );
}
