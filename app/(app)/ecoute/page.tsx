import Link from 'next/link';
import Urgence from '@/components/Urgence';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function Ecoute() {
  const { data: refs } = await supabaseServer().from('referents').select('id, presentation, disponible, partenaire, institution').order('disponible', { ascending: false });
  return (
    <>
      <div className="flex justify-between items-center mb-3"><h1 className="h1">Écoute entre collègues</h1><span className="pill-mint">Gratuit</span></div>
      <Urgence />
      <p className="sub">Parler à quelqu&apos;un qui connaît le métier, sans passer par la hiérarchie, le service médical ou un formulaire. Des collègues volontaires, formés à l&apos;écoute, qui ne vous demanderont ni votre nom ni votre service.</p>
      <div className="bg-[#F5F7FB] rounded-2xl px-3 py-2.5 text-[12.5px] text-[#3B4457] border-l-[3px] border-bleu mt-3"><b className="text-bleud">Cloisonné.</b> Ce module n&apos;utilise pas votre compte vérifié. Vous y entrez sous un pseudo tiré au hasard, sans lien avec votre profil ou vos correspondances. Rien n&apos;est conservé.</div>
      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Collègues référents</h2>
      <div className="card">
        {(refs ?? []).length === 0 && <p className="sub">Les référents arrivent avec le partenariat PEPS. En attendant, le 3114 répond 24 h/24.</p>}
        {(refs ?? []).map(r => (
          <div key={r.id} className="flex gap-3 py-3 border-t border-[#E6E9F0] first:border-t-0">
            <span className="w-10 h-10 rounded-full bg-paper text-navy text-[13px] font-extrabold flex items-center justify-center shrink-0">{r.institution}</span>
            <span className="flex-1"><small className="sub block">{r.presentation}</small>{r.partenaire && <span className="pill-bleu mt-1">Pair-aidant {r.partenaire}</span>}</span>
            <span className={`pill ${r.disponible ? 'bg-[#DFF7EB] text-[#16804F]' : 'bg-[#EEF2F8] text-[#6F7789]'}`}>{r.disponible ? 'Disponible' : 'Indisponible'}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <b className="text-[14px] text-navy">Ressources dans votre institution</b>
        <div className="kv"><span>Police · psychologues SSPO</span><span className="text-bleu">›</span></div>
        <div className="kv"><span>Gendarmerie · psychologues cliniciens</span><span className="text-bleu">›</span></div>
        <div className="kv"><span>Pénitentiaire · cellule d&apos;écoute</span><span className="text-bleu">›</span></div>
        <div className="kv"><span>PEPS-SOS, policiers en détresse</span><a className="text-bleu" href="https://peps-sos.fr" target="_blank" rel="noreferrer">peps-sos.fr ›</a></div>
      </div>
      <p className="text-center text-[11.5px] text-[#A3AAB8] mt-2">La messagerie éphémère (Supabase Realtime, rien en base) arrive avec les premiers référents.</p>
    </>
  );
}
