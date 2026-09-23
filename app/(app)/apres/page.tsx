import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const VOIES_DEFAUT = [
  ['Disponibilité pour convenances personnelles', 'Réversible', 'Vous gardez votre grade et votre droit de retour. Pas de salaire ni de retraite pendant la période. Le bon choix pour tester le privé sans brûler le pont.'],
  ['Détachement', 'Réversible', 'Vers un autre employeur public ou certains organismes. Vous continuez à cotiser et à avancer. Rare vers le privé pur.'],
  ['Rupture conventionnelle', 'Négociée', 'Indemnité et droits au chômage, mais il faut l\'accord de l\'administration et le cadre a changé plusieurs fois. À vérifier au moment où vous vous lancez.'],
  ['Démission', 'Définitive', 'Pas de chômage sauf projet reconnu, pas de retour. Indemnité de départ volontaire possible sous conditions.'],
];
const METIERS = [
  ['Responsable sûreté d\'entreprise', 'Grands sites, logistique, retail · avis déontologie requis'],
  ['Enquêteur privé, compliance, fraude', 'Assurances, banques, plateformes'],
  ['Formateur sécurité, gestion de crise', 'Organismes de formation, collectivités'],
  ['Responsable d\'exploitation transport', 'Autocars, logistique, aéroportuaire'],
  ['Policier municipal, chef de service', 'Détachement possible, recrutement direct'],
];

export default async function Apres() {
  const sb = supabaseServer();
  const { data: voies } = await sb.from('apres_voies').select('titre, statut, texte').order('ordre');
  const liste = voies?.length ? voies.map(v => [v.titre, v.statut, v.texte]) : VOIES_DEFAUT;
  const pill = (s: string) => s === 'Réversible' ? 'pill-mint' : s === 'Négociée' ? 'pill-amber' : 'pill-coral';
  return (
    <>
      <div className="flex justify-between items-center mb-3"><h1 className="h1">Préparer l&apos;après</h1><span className="pill-bleu">Discret</span></div>
      <p className="sub">Y penser n&apos;engage à rien. Ici vous pouvez regarder ce que ça donnerait, calmement, sans que la boîte ne le sache.</p>
      <div className="bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#3B4457] border-l-[3px] border-bleu mt-3"><b className="text-bleud">Cloisonné.</b> Ce que vous consultez ici n&apos;apparaît nulle part ailleurs dans l&apos;app et n&apos;influence pas vos correspondances.</div>
      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Les voies de sortie</h2>
      <div className="card">
        {liste.map(([t, s, x]) => <div key={t} className="py-3 border-t border-[#E6E9F0] first:border-t-0"><div className="flex justify-between items-center"><b className="text-[14px] text-navy">{t}</b><span className={pill(s)}>{s}</span></div><p className="sub mt-1">{x}</p></div>)}
      </div>
      <div className="card">
        <b className="text-[14px] text-navy">Ce que vous emportez de toute façon</b>
        <div className="kv"><span>Trimestres de retraite acquis</span><b>Conservés</b></div>
        <div className="kv"><span>Bonification du cinquième</span><b className="text-[#C8323B]">Selon la durée de service</b></div>
        <div className="kv"><span>Permis, habilitations, formations</span><b className="text-[#16804F]">Conservés</b></div>
        <div className="kv"><span>Déontologie : avis requis</span><b>3 ans après le départ</b></div>
      </div>
      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Métiers où votre profil est recherché</h2>
      <div className="card">
        {METIERS.map(([t, s]) => <div key={t} className="py-2.5 border-t border-[#E6E9F0] first:border-t-0"><b className="block text-[14px] text-navy">{t}</b><small className="sub">{s}</small></div>)}
      </div>
      <p className="text-center text-[11.5px] text-[#A3AAB8] mt-2">Traduction de CV et mise en relation avec des anciens : Premium, à venir.</p>
    </>
  );
}
