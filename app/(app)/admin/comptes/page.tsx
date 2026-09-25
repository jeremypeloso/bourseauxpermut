import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from '../Actions';
import { Table, d, Pill } from '../Table';

export const dynamic = 'force-dynamic';

export default async function Comptes({ searchParams }: { searchParams: { q?: string } }) {
  const a = supabaseAdmin();
  const { data: { users } } = await a.auth.admin.listUsers({ perPage: 1000 });
  const { data: profils } = await a.from('profils').select('id, institution, grade, verifie_carte, verifie_mail_pro, premium_jusqua, premium_offert_le, stripe_customer_id, created_at, services!profils_service_id_fkey(ville)');
  const { data: annonces } = await a.from('annonces').select('profil_id').eq('statut', 'active').eq('demo', false);
  const q = (searchParams.q ?? '').toLowerCase();
  const rows = users.filter(u => !q || (u.email ?? '').includes(q)).sort((x, y) => (y.created_at > x.created_at ? 1 : -1)).map(u => {
    const p: any = (profils ?? []).find(x => x.id === u.id); const prem = p?.premium_jusqua && new Date(p.premium_jusqua) > new Date();
    return [
      <span key="e"><b className="text-navy">{u.email}</b><br /><small className="text-[#6F7789]">{u.id.slice(0, 8)} · inscrit le {d(u.created_at)} · dernière connexion {d(u.last_sign_in_at)}</small></span>,
      p ? <span key="p">{p.institution} · {p.grade ?? '—'} · {p.services?.ville ?? '—'}</span> : <Pill key="p" ok={false} t="Sans profil" warn />,
      <span key="v" className="flex flex-col gap-1"><Pill ok={!!p?.verifie_carte} t={p?.verifie_carte ? 'Carte' : 'Carte non'} /><Pill ok={!!p?.verifie_mail_pro} t={p?.verifie_mail_pro ? 'Mail pro' : 'Mail pro non'} /></span>,
      <span key="m">{prem ? <Pill ok t={`Premium → ${d(p.premium_jusqua)}`} /> : <Pill ok={false} t="Gratuit" />}<br /><small className="text-[#6F7789]">{p?.stripe_customer_id ? 'payant' : p?.premium_offert_le ? 'offert' : ''}</small></span>,
      <span key="an">{(annonces ?? []).some(x => x.profil_id === u.id) ? <Pill ok t="Annonce" /> : '—'}</span>,
      <span key="ac" className="flex flex-wrap gap-1">
        {p && !(p.verifie_carte || p.verifie_mail_pro) && <Bouton action="verifier" id={u.id} label="Vérifier" />}
        {p && (p.verifie_carte || p.verifie_mail_pro) && <Bouton action="deverifier" id={u.id} label="Dévérifier" />}
        {p && (prem ? <Bouton action="premium_off" id={u.id} label="Retirer Premium" /> : <Bouton action="premium" id={u.id} label="Premium 30 j" extra={{ jours: 30 }} />)}
        <Bouton action="supprimer_compte" id={u.id} label="Supprimer" danger confirm={`Supprimer définitivement ${u.email} et toutes ses données ?`} />
      </span>,
    ];
  });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4"><div><h1 className="text-[22px] font-extrabold text-navy">Comptes</h1><p className="text-[13px] text-[#6F7789]">{users.length} comptes.</p></div>
        <form className="flex gap-2"><input name="q" defaultValue={searchParams.q} placeholder="Rechercher un email" className="field !py-2 w-64" /><button className="btn !w-auto !py-2 px-4 text-[13px]">Chercher</button></form></div>
      <Table cols={['Compte', 'Profil', 'Vérification', 'Formule', 'Annonce', 'Actions']} rows={rows} />
    </>
  );
}
