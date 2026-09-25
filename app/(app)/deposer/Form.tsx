'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Paywall from '@/components/Paywall';
import ChoixAffectation, { Service } from '@/components/ChoixAffectation';

// Hors du composant : définis à l'intérieur, React les remonterait à chaque rendu et perdrait l'état des sélecteurs
const Fld = ({ l, children }: { l: string; children: React.ReactNode }) => <label className="block text-[12px] text-[#6F7789]">{l}{children}</label>;
const Panel = ({ t, children, right }: { t: string; children: React.ReactNode; right?: React.ReactNode }) => <div className="bg-white border border-[#E6E9F0] rounded-2xl p-4 md:p-5 mb-3.5"><div className="flex justify-between items-center mb-2"><h4 className="text-[13px] font-extrabold text-navy">{t}</h4>{right}</div>{children}</div>;

export default function FormDepot({ profil, souhaits, services, corps, grades, annonce }: any) {
  const r = useRouter(); const sb = supabaseBrowser();
  const [svcs, setSvcs] = useState<Service[]>(services);
  const ajouter = (x: Service) => setSvcs(l => l.some(y => y.id === x.id) ? l : [...l, x]);
  const [p, setP] = useState({ corps: profil?.corps ?? '', grade: profil?.grade ?? '', service_id: profil?.service_id ?? '', type_service: profil?.type_service ?? '', anciennete_poste_mois: profil?.anciennete_poste_mois ?? 0, depart_des: profil?.depart_des ?? '', accepte_cycles: profil?.accepte_cycles ?? true, accepte_changer_service: profil?.accepte_changer_service ?? false });
  const [s, setS] = useState<any[]>(souhaits.length ? souhaits : [{ rang: 1, service_id: '' }]);
  const [vis, setVis] = useState<'simple' | 'boost' | 'premium'>(annonce?.mise_en_avant_jusqua ? 'boost' : 'simple');
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [pay, setPay] = useState(false);
  const verifie = profil?.verifie_carte || profil?.verifie_mail_pro;
  const sv = (id: any) => svcs.find((x: any) => String(x.id) === String(id));
  const cibles = s.filter(x => x.service_id).map(x => sv(x.service_id)?.ville).filter(Boolean);

  const publier = async () => {
    if (!profil) return r.push('/onboarding');
    setBusy(true); setMsg(null);
    const { error } = await sb.from('profils').update({ ...p, service_id: p.service_id || null, depart_des: p.depart_des || null }).eq('id', profil.id);
    if (error) { setBusy(false); return setMsg(error.message); }
    await sb.from('souhaits').delete().eq('profil_id', profil.id);
    const rows = s.filter(x => x.service_id).map((x, i) => ({ profil_id: profil.id, rang: i + 1, service_id: +x.service_id }));
    if (rows.length) { const { error: e2 } = await sb.from('souhaits').insert(rows); if (e2) { setBusy(false); return setMsg(e2.message); } }
    const j = await fetch('/api/annonces', { method: 'POST' }).then(x => x.json());
    setBusy(false);
    if (!j.ok) return setMsg(j.message ?? j.error);
    if (vis === 'boost') { const b = await fetch('/api/stripe/boost', { method: 'POST' }).then(x => x.json()).catch(() => ({ message: 'Paiement indisponible (réponse serveur invalide).' })); if (b.url) return (location.href = b.url); return setMsg(b.message ?? b.error ?? 'Paiement indisponible.'); }
    if (vis === 'premium') return setPay(true);
    r.push(`/annonces/${j.id}`);
  };
  const retirer = async () => { await fetch('/api/annonces', { method: 'DELETE' }); r.push('/annonces'); };
  const Opt = ({ k, t, s: sub, prix }: { k: typeof vis; t: string; s: string; prix: string }) => <button onClick={() => setVis(k)} className={`w-full flex gap-3 items-start text-left border-[1.5px] rounded-2xl p-3.5 mt-2 ${vis === k ? 'border-bleu bg-[#E6EEFF]' : 'border-[#E6E9F0] bg-white'}`}><span className="flex-1"><b className="block text-[14px] text-navy">{t}</b><small className="text-[12.5px] text-[#6F7789]">{sub}</small></span><b className="text-navy whitespace-nowrap">{prix}</b></button>;

  return (
    <div className="max-w-[760px] mx-auto">
      <h1 className="text-[24px] md:text-[26px] font-extrabold tracking-tight text-navy">{annonce ? 'Modifier mon annonce' : 'Déposer une annonce'}</h1>
      <p className="text-[14px] text-[#6F7789] mb-4">Gratuit. Anonyme par construction : uniquement des champs fermés, aucun nom, aucun texte libre.</p>
      {!verifie && <div className="card mb-3.5 border border-[#FFD3D6]"><b className="text-navy">Compte à vérifier avant de publier</b><div className="sub mt-1">Carte pro ou mail pro, une seule fois.</div><Link href="/onboarding" className="btn mt-3 !w-auto">Vérifier mon compte</Link></div>}

      <Panel t="Votre poste actuel">
        <div className="grid md:grid-cols-2 gap-3">
          <Fld l="Institution"><input className="field mt-1" value={profil?.institution ?? ''} disabled /></Fld>
          <Fld l="Corps"><select className="field mt-1" value={p.corps} onChange={e => setP({ ...p, corps: e.target.value, grade: '' })}><option value="">—</option>{corps.map((c: any) => <option key={c.code} value={c.code}>{c.libelle}</option>)}</select></Fld>
          <Fld l="Grade"><select className="field mt-1" value={p.grade} onChange={e => setP({ ...p, grade: e.target.value })}><option value="">—</option>{grades.filter((g: any) => g.corps === p.corps).sort((a: any, b: any) => a.rang - b.rang).map((g: any) => <option key={g.code} value={g.code}>{g.libelle}</option>)}</select></Fld>
          <div className="md:col-span-2"><span className="block text-[12px] text-[#6F7789] mb-1">Affectation</span><ChoixAffectation institution={profil?.institution ?? 'PN'} services={svcs} value={p.service_id} onChange={v => setP({ ...p, service_id: v })} onAjout={ajouter} /></div>
          <Fld l="Type de service"><input className="field mt-1" value={p.type_service} onChange={e => setP({ ...p, type_service: e.target.value })} placeholder="SP jour, BAC nuit, brigade, détention…" /></Fld>
          <Fld l="Ancienneté dans le poste (mois)"><input type="number" className="field mt-1" value={p.anciennete_poste_mois} onChange={e => setP({ ...p, anciennete_poste_mois: +e.target.value })} /></Fld>
          <Fld l="Départ possible dès"><input type="date" className="field mt-1" value={p.depart_des} onChange={e => setP({ ...p, depart_des: e.target.value })} /></Fld>
        </div>
      </Panel>

      <Panel t="Vous souhaitez aller vers" right={<span className="text-[12px] text-[#6F7789]">jusqu&apos;à 5, par ordre</span>}>
        {s.map((x, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="w-7 h-7 rounded-lg bg-navy text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0"><ChoixAffectation compact institution={profil?.institution ?? 'PN'} services={svcs} value={x.service_id} onChange={v => { const a = [...s]; a[i] = { ...a[i], service_id: v }; setS(a); }} onAjout={ajouter} /></div>
            <button onClick={() => { if (i > 0) { const a = [...s]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setS(a); } }} className="w-9 h-9 rounded-lg bg-paper text-[#6F7789]">↑</button>
            <button onClick={() => setS(s.filter((_, j) => j !== i))} className="w-9 h-9 rounded-lg bg-paper text-[#C8323B]">×</button>
          </div>
        ))}
        {s.length < 5 && <button className="btn-ghost mt-3 !py-2.5" onClick={() => setS([...s, { rang: s.length + 1, service_id: '' }])}>Ajouter un souhait</button>}
        <label className="flex items-center gap-2 text-[13px] text-[#3B4457] mt-4"><input type="checkbox" className="w-4 h-4 accent-bleu" checked={p.accepte_cycles} onChange={e => setP({ ...p, accepte_cycles: e.target.checked })} />Accepter les cycles à 3 ou 4 agents (recommandé : ferme beaucoup plus de permutations)</label>
        <label className="flex items-center gap-2 text-[13px] text-[#3B4457] mt-2"><input type="checkbox" className="w-4 h-4 accent-bleu" checked={p.accepte_changer_service} onChange={e => setP({ ...p, accepte_changer_service: e.target.checked })} />Accepter un changement de type de service</label>
      </Panel>

      <Panel t="Aperçu de votre annonce">
        <div className="bg-paper rounded-xl px-4 py-3 text-[13.5px]"><b className="block text-navy">{p.grade || 'Grade'} · {sv(p.service_id)?.ville ?? 'Affectation'} → {cibles.join(', ') || 'souhaits'}</b>{[p.type_service, p.anciennete_poste_mois ? `${Math.floor(p.anciennete_poste_mois / 12)} ans dans le poste` : null, p.depart_des ? `départ dès ${new Date(p.depart_des).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` : null, p.accepte_cycles ? 'cycles acceptés' : null].filter(Boolean).join(' · ')}<div className="text-[12px] text-[#6F7789] mt-1">{sv(p.service_id)?.departement ? `Département ${sv(p.service_id)?.departement}` : ''} · agent vérifié</div></div>
      </Panel>

      <Panel t="Visibilité">
        <Opt k="simple" t="Annonce simple" s="Visible par tous les agents vérifiés de votre institution, triée par pertinence." prix="Gratuit" />
        <Opt k="boost" t="Mise en avant 7 jours" s="Épinglée en tête des résultats, badge « Mise en avant ». Paiement unique." prix="4,99 €" />
        <Opt k="premium" t="Premium" s="Mise en avant permanente, toutes les annonces en clair, réponses illimitées, matching prioritaire." prix="9,99 €/mois" />
      </Panel>

      {msg && <p className="sub mb-2">{msg}</p>}
      <button className="btn" onClick={publier} disabled={busy || !verifie}>{busy ? 'Publication…' : annonce ? 'Enregistrer mon annonce' : 'Publier mon annonce'}</button>
      {annonce && <button className="btn-ghost mt-2 text-[#C8323B] border-[#FFD3D6]" onClick={retirer}>Retirer mon annonce</button>}
      <Paywall open={pay} onClose={() => { setPay(false); r.push('/annonces'); }} />
    </div>
  );
}
