'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/** Courrier de demande de mutation par permutation, pré-rempli, à imprimer ou enregistrer en PDF (impression du navigateur). */
export default function Courrier() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<any>(null); const [err, setErr] = useState<string | null>(null);
  const [champs, setChamps] = useState({ matricule: '', service: '', ville: '', lieu: '', destinataire: 'Monsieur le Directeur départemental de la police nationale' });
  useEffect(() => {
    fetch('/api/correspondances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reveler' }) }).then(r => r.json()).then(j => { if (j.ok === false || j.error) setErr(j.message ?? j.error ?? 'Correspondance non confirmée'); else setD(j); });
    fetch('/api/annonces').then(r => r.json()).then(() => {});
  }, [id]);
  if (err) return <div className="card"><b className="text-navy">Courrier indisponible</b><div className="sub mt-1">{err}. Le courrier n&apos;est disponible qu&apos;une fois la correspondance confirmée par tous.</div><Link href={`/matchs/${id}`} className="btn mt-3 !w-auto">Retour</Link></div>;
  if (!d) return <div className="card"><div className="sub">Préparation…</div></div>;
  const autres: any[] = d.agents ?? []; const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const F = ({ k, l, w = '' }: { k: keyof typeof champs; l: string; w?: string }) => <label className={`block text-[12px] text-[#6F7789] ${w}`}>{l}<input className="field !py-2 mt-1" value={champs[k]} onChange={e => setChamps({ ...champs, [k]: e.target.value })} /></label>;
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="print:hidden bg-white border border-[#E6E9F0] rounded-2xl p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-[20px] font-extrabold text-navy">Courrier de demande de mutation par permutation</h1><p className="text-[13px] text-[#6F7789]">Pré-rempli avec les identités révélées. Complétez les champs, relisez, imprimez ou enregistrez en PDF. Chaque agent fait le sien.</p></div><div className="flex gap-2"><Link href={`/matchs/${id}`} className="btn-ghost !w-auto !py-2.5 px-4 text-[13px]">Retour</Link><button className="btn !w-auto !py-2.5 px-4 text-[13px]" onClick={() => window.print()}>Imprimer / PDF</button></div></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          <F k="destinataire" l="Destinataire" w="lg:col-span-3" /><F k="matricule" l="Votre matricule" /><F k="service" l="Votre service d'affectation (libellé complet)" /><F k="ville" l="Ville" /><F k="lieu" l="Fait à" />
        </div>
        <p className="text-[12px] text-[#9A6A00] bg-[#FFF3D6] rounded-xl px-3 py-2 mt-3">La permutation n&apos;est pas un droit : ce courrier est une demande de mutation classique qui mentionne l&apos;accord réciproque. Vérifiez la voie hiérarchique et le calendrier de votre institution avant envoi.</p>
      </div>

      <div className="bg-white border border-[#E6E9F0] rounded-2xl p-8 md:p-12 text-[14px] leading-relaxed text-[#141A26] print:border-0 print:p-0" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        <p>{d.moi?.prenom} {d.moi?.nom}<br />{champs.matricule ? `Matricule ${champs.matricule}` : 'Matricule ____________'}<br />{champs.service || 'Service d\'affectation ____________'}<br />{champs.ville || 'Ville ____________'}</p>
        <p className="mt-6">{champs.destinataire}<br />Sous couvert de la voie hiérarchique</p>
        <p className="mt-6 text-right">{champs.lieu || '____________'}, le {date}</p>
        <p className="mt-6 font-bold">Objet : demande de mutation dans le cadre d&apos;une permutation</p>
        <p className="mt-6">Monsieur le Directeur,</p>
        <p className="mt-4">J&apos;ai l&apos;honneur de solliciter ma mutation vers {autres[0]?.email ? '' : ''}le service d&apos;affectation actuel de {autres.map(a => `${a.prenom} ${a.nom}`).join(' et de ')}, dans le cadre d&apos;une permutation{autres.length > 1 ? ' à plusieurs agents' : ''} pour laquelle {autres.length > 1 ? 'les agents concernés ont' : 'l\'agent concerné a'} donné {autres.length > 1 ? 'leur' : 'son'} accord et {autres.length > 1 ? 'déposent' : 'dépose'} parallèlement une demande réciproque.</p>
        <p className="mt-4">{autres.length > 1 ? 'Les agents concernés sont' : 'L\'agent concerné est'} :</p>
        <ul className="list-disc pl-6 mt-2">{autres.map(a => <li key={a.position}>{a.prenom} {a.nom}, grade ____________, affecté(e) à ____________</li>)}</ul>
        <p className="mt-4">Cette permutation, souhaitée de part et d&apos;autre, s&apos;effectuerait à grade et corps équivalents et sans création ni suppression de poste. Je me tiens à votre disposition pour tout complément et vous prie de bien vouloir examiner ma demande avec bienveillance.</p>
        <p className="mt-4">Je vous prie d&apos;agréer, Monsieur le Directeur, l&apos;expression de mon respect.</p>
        <p className="mt-10">{d.moi?.prenom} {d.moi?.nom}<br /><br />Signature : ____________</p>
        <p className="mt-8 text-[11px] text-[#6F7789] print:hidden">Pièces à joindre selon votre institution : accord écrit du ou des permutants, dernier compte rendu d&apos;évaluation, justificatifs éventuels (rapprochement de conjoint, CIMM).</p>
      </div>
    </div>
  );
}
