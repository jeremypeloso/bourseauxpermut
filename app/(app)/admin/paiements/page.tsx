import { stripe } from '@/lib/stripe';
import { Bouton } from '../Actions';
import { Table, Pill } from '../Table';
export const dynamic = 'force-dynamic';
export default async function Paiements() {
  let charges: any[] = [], subs: any[] = [], err: string | null = null;
  try {
    const [c, s] = await Promise.all([stripe().charges.list({ limit: 50 }), stripe().subscriptions.list({ limit: 50, status: 'all' })]);
    charges = c.data; subs = s.data;
  } catch (e: any) { err = e?.message ?? 'Stripe indisponible'; }
  const eur = (n: number) => `${(n / 100).toFixed(2).replace('.', ',')} €`;
  const dt = (t: number) => new Date(t * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const total = charges.filter(c => c.paid && !c.refunded).reduce((s, c) => s + c.amount - (c.amount_refunded ?? 0), 0);
  const actifs = subs.filter(s => s.status === 'active' || s.status === 'trialing');
  return (
    <>
      <h1 className="text-[22px] font-extrabold text-navy mb-4">Paiements</h1>
      {err && <div className="card mb-4 border border-[#FFD3D6]"><b className="text-[#C8323B]">Stripe indisponible</b><div className="sub mt-1">{err}</div></div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[[eur(total), 'encaissé (50 derniers paiements)'], [actifs.length, 'abonnements actifs'], [`${eur(actifs.length * 999)}`, 'MRR'], [subs.filter(s => s.cancel_at_period_end).length, 'résiliations en cours']].map(([n, t]) => <div key={String(t)} className="bg-white border border-[#E6E9F0] rounded-2xl p-4"><b className="block text-[24px] font-extrabold text-navy leading-none">{n}</b><span className="text-[12px] text-[#6F7789]">{t}</span></div>)}
      </div>
      <h2 className="text-[15px] font-extrabold text-navy mb-2">Abonnements</h2>
      <Table cols={['Client', 'Statut', 'Période', 'Actions']} rows={subs.map(s => [<span key="c" className="text-[12.5px]">{typeof s.customer === 'string' ? s.customer : ''}<br /><small className="text-[#6F7789]">{s.id}</small></span>, <Pill key="s" ok={s.status === 'active'} t={s.cancel_at_period_end ? 'résiliation en fin de période' : s.status} warn={s.status !== 'active'} />, <span key="p" className="text-[12.5px]">{dt(s.current_period_start)} → {dt(s.current_period_end)}</span>, <span key="a">{s.status === 'active' && !s.cancel_at_period_end && <Bouton action="annuler_abonnement" id={s.id} label="Résilier en fin de période" danger confirm="Résilier cet abonnement à la fin de la période ?" />}</span>])} />
      <h2 className="text-[15px] font-extrabold text-navy mt-6 mb-2">Paiements</h2>
      <Table cols={['Date', 'Client', 'Montant', 'Statut', 'Actions']} rows={charges.map(c => [<span key="d">{dt(c.created)}</span>, <span key="c" className="text-[12.5px]">{c.billing_details?.email ?? c.receipt_email ?? (typeof c.customer === 'string' ? c.customer : '—')}</span>, <b key="m">{eur(c.amount)}</b>, <Pill key="s" ok={c.paid && !c.refunded} t={c.refunded ? 'remboursé' : c.paid ? 'payé' : c.status} warn={!c.paid} />, <span key="a">{c.paid && !c.refunded && c.payment_intent && <Bouton action="rembourser" id={String(c.payment_intent)} label="Rembourser" danger confirm={`Rembourser ${eur(c.amount)} ?`} />}</span>])} />
    </>
  );
}
