import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from './Actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Admin() {
  const a = supabaseAdmin();
  const [{ data: users }, { data: profils }, { data: annonces }, { data: corrs }, { data: pre }, { data: stats }, { data: svcs }, { data: sigs }] = await Promise.all([
    a.auth.admin.listUsers({ perPage: 1000 }).then(r => ({ data: r.data.users })),
    a.from('profils').select('id, institution, verifie_carte, verifie_mail_pro, premium_jusqua, premium_offert_le, stripe_customer_id, created_at'),
    a.from('annonces').select('id, statut, demo, mise_en_avant_jusqua, created_at'),
    a.from('correspondances').select('id, type, statut, created_at'),
    a.from('preinscriptions').select('id, created_at, institution'),
    a.from('stats_publiques').select('cle, valeur'),
    a.from('services').select('id').not('ajoute_par', 'is', null),
    a.from('signalements').select('id').eq('statut', 'ouvert'),
  ]);
  const now = Date.now(), j7 = now - 7 * 86400e3;
  const P = profils ?? [], U = users ?? [], A = annonces ?? [], C = corrs ?? [];
  const verif = P.filter(p => p.verifie_carte || p.verifie_mail_pro); const prem = P.filter(p => p.premium_jusqua && new Date(p.premium_jusqua).getTime() > now);
  const payants = prem.filter(p => p.stripe_customer_id); const offerts = P.filter(p => p.premium_offert_le);
  const K = ({ n, t, s, cls = '' }: { n: any; t: string; s?: string; cls?: string }) => <div className={`bg-white border border-[#E6E9F0] rounded-2xl p-4 ${cls}`}><b className="block text-[28px] font-extrabold tracking-tight text-navy leading-none">{n}</b><span className="block text-[12.5px] text-[#3B4457] mt-1.5">{t}</span>{s && <span className="text-[11.5px] text-[#6F7789]">{s}</span>}</div>;
  // inscriptions par jour (14 jours)
  const jours = Array.from({ length: 14 }, (_, i) => { const d = new Date(now - (13 - i) * 86400e3); return d.toISOString().slice(0, 10); });
  const parJour = jours.map(j => U.filter(u => (u.created_at ?? '').slice(0, 10) === j).length); const max = Math.max(1, ...parJour);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4"><div><h1 className="text-[22px] font-extrabold text-navy">Tableau de bord</h1><p className="text-[13px] text-[#6F7789]">Vue d&apos;ensemble en temps réel.</p></div><div className="flex gap-2"><Bouton action="matching" label="Lancer le matching maintenant" /></div></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K n={U.length} t="Comptes" s={`${U.filter(u => new Date(u.created_at).getTime() > j7).length} sur 7 jours`} />
        <K n={verif.length} t="Vérifiés" s={`${P.filter(p => p.verifie_carte && p.verifie_mail_pro).length} deux fois · ${U.length - P.length} sans profil`} />
        <K n={prem.length} t="Premium actifs" s={`${payants.length} payants · ${offerts.length}/100 offerts`} cls="border-[#BFE9D3]" />
        <K n={`${(payants.length * 9.99).toFixed(2)} €`} t="MRR estimé" s="abonnements payants × 9,99 €" />
        <K n={A.filter(x => x.statut === 'active' && !x.demo).length} t="Annonces réelles actives" s={`${A.filter(x => x.demo).length} exemples · ${A.filter(x => x.mise_en_avant_jusqua && new Date(x.mise_en_avant_jusqua).getTime() > now).length} mises en avant`} />
        <K n={C.filter(c => c.statut !== 'refusee').length} t="Correspondances ouvertes" s={`${C.filter(c => c.statut === 'confirmee').length} confirmées · ${C.filter(c => c.type !== 'directe').length} cycles à 3/4`} />
        <K n={(pre ?? []).length} t="Pré-inscrits" s={`${(pre ?? []).filter(p => p.institution !== 'PN').length} gendarmerie / pénitentiaire`} />
        <K n={(sigs ?? []).length} t="Signalements à traiter" s={`${(svcs ?? []).length} affectation(s) ajoutée(s) par des agents`} cls={(sigs ?? []).length ? 'border-[#FFD3D6]' : ''} />
      </div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mt-4">
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4"><b className="text-[14px] text-navy">Inscriptions, 14 derniers jours</b>
          <div className="flex items-end gap-1.5 h-32 mt-3">{parJour.map((n, i) => <div key={i} className="flex-1 flex flex-col items-center gap-1"><span className="text-[10px] text-[#6F7789]">{n || ''}</span><div className="w-full rounded-t bg-bleu" style={{ height: `${(n / max) * 100}%`, minHeight: n ? 4 : 0 }} /><span className="text-[9px] text-[#A3AAB8]">{jours[i].slice(8)}</span></div>)}</div></div>
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4"><b className="text-[14px] text-navy">Par institution</b>
          {['PN', 'GN', 'AP'].map(i => { const n = P.filter(p => p.institution === i).length; return <div key={i} className="kv"><span>{i}</span><b>{n} profil{n > 1 ? 's' : ''} · {A.filter(x => x.statut === 'active' && !x.demo).length ? '' : ''}{verif.filter(p => p.institution === i).length} vérifié{n > 1 ? 's' : ''}</b></div>; })}
          <div className="kv"><span>Compteurs publics</span><b className="text-right text-[12px]">{(stats ?? []).map(s => `${s.cle} ${s.valeur}`).join(' · ')}</b></div>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-[13px]">
        {[['/admin/signalements', 'Traiter les signalements', 'engagement 24 h'], ['/admin/comptes', 'Gérer les comptes', 'vérifier, offrir Premium, supprimer'], ['/admin/paiements', 'Paiements et abonnements', 'rembourser, résilier']].map(([h, t, s]) => <Link key={h} href={h} className="bg-white border border-[#E6E9F0] rounded-2xl p-4 hover:bg-paper"><b className="block text-navy">{t}</b><span className="text-[#6F7789]">{s}</span></Link>)}
      </div>
    </>
  );
}
