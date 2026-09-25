import { supabaseAdmin } from '@/lib/supabase-server';
import { Bouton } from '../Actions';
export const dynamic = 'force-dynamic';
export default async function Parametres() {
  const a = supabaseAdmin();
  const { data: inst } = await a.from('institutions').select('code, libelle, ouverte').order('code');
  const { data: stats } = await a.from('stats_publiques').select('cle, valeur, maj');
  const { data: demo } = await a.from('annonces').select('id').eq('demo', true);
  const env = [['NEXT_PUBLIC_PRELAUNCH', process.env.NEXT_PUBLIC_PRELAUNCH ?? '0'], ['NEXT_PUBLIC_OFFRE_LANCEMENT', process.env.NEXT_PUBLIC_OFFRE_LANCEMENT ?? '1'], ['NEXT_PUBLIC_INSTITUTIONS', process.env.NEXT_PUBLIC_INSTITUTIONS ?? 'PN'], ['NEXT_PUBLIC_OUVERTURE', process.env.NEXT_PUBLIC_OUVERTURE ?? '—'], ['ADMIN_EMAILS', (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.replace(/(.{2}).+(@.+)/, '$1…$2')).join(', ')], ['Stripe', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : process.env.STRIPE_SECRET_KEY ? 'test' : 'absent'], ['Resend', process.env.RESEND_API_KEY ? 'configuré' : 'absent']];
  return (
    <>
      <h1 className="text-[22px] font-extrabold text-navy mb-4">Paramètres</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5"><b className="text-[14px] text-navy">Institutions ouvertes à l&apos;inscription</b><p className="text-[12px] text-[#6F7789] mb-2">Verrou en base. Pense aussi à `NEXT_PUBLIC_INSTITUTIONS` sur Vercel pour l&apos;affichage.</p>
          {(inst ?? []).map(i => <div key={i.code} className="kv"><span>{i.libelle} <small className="text-[#A3AAB8]">({i.code})</small></span><span className="flex items-center gap-2"><span className={i.ouverte ? 'pill-mint' : 'pill-amber'}>{i.ouverte ? 'Ouverte' : 'Fermée'}</span><Bouton action="institution" id={i.code} label={i.ouverte ? 'Fermer' : 'Ouvrir'} extra={{ ouverte: !i.ouverte }} /></span></div>)}
        </div>
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5"><b className="text-[14px] text-navy">Configuration en production</b>{env.map(([k, v]) => <div key={k} className="kv"><span className="text-[12.5px]">{k}</span><code className="text-[12px]">{v}</code></div>)}</div>
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5"><b className="text-[14px] text-navy">Compteurs publics</b>{(stats ?? []).map(s => <div key={s.cle} className="kv"><span className="text-[12.5px]">{s.cle}</span><b>{s.valeur}</b></div>)}</div>
        <div className="bg-white border border-[#E6E9F0] rounded-2xl p-5"><b className="text-[14px] text-navy">Annonces d&apos;exemple</b><p className="text-[12px] text-[#6F7789] mb-3">{(demo ?? []).length} en base. Elles s&apos;effacent d&apos;elles-mêmes à mesure des vraies ; tu peux aussi tout retirer d&apos;un coup.</p><div className="flex gap-2"><Bouton action="retirer_exemples" label="Retirer tous les exemples" danger confirm="Supprimer toutes les annonces d'exemple ?" /><Bouton action="matching" label="Lancer le matching" /></div></div>
      </div>
    </>
  );
}
