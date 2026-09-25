'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDialog } from '@/components/Dialog';

export function Bouton({ action, id, label, danger = false, confirm: conf, extra }: { action: string; id?: string; label: string; danger?: boolean; confirm?: string; extra?: any }) {
  const r = useRouter(); const [busy, setBusy] = useState(false); const { confirmer, notifier } = useDialog();
  const go = async () => {
    if (conf && !await confirmer({ titre: label, texte: conf, ok: label, danger })) return;
    setBusy(true);
    const j = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id, ...extra }) }).then(x => x.json());
    setBusy(false);
    if (!j.ok) notifier(j.message ?? 'Erreur', 'erreur'); else if (j.resultat) notifier(`Matching : ${j.resultat.agents} agents, ${j.resultat.cycles} cycle(s), ${j.resultat.crees} nouveau(x), ${j.resultat.mails} mail(s)`); else notifier('Fait');
    r.refresh();
  };
  return <button onClick={go} disabled={busy} className={`text-[12px] font-bold px-2.5 py-1.5 rounded-lg border ${danger ? 'border-[#FFD3D6] text-[#C8323B] bg-white' : 'border-[#E6E9F0] text-navy bg-white'} hover:bg-paper disabled:opacity-50`}>{busy ? '…' : label}</button>;
}
