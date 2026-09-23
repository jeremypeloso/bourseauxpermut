'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function FormProfil({ profil, souhaits, services, corps, grades }: any) {
  const r = useRouter();
  const sb = supabaseBrowser();
  const [p, setP] = useState({ corps: profil?.corps ?? '', grade: profil?.grade ?? '', service_id: profil?.service_id ?? '', type_service: profil?.type_service ?? '', anciennete_poste_mois: profil?.anciennete_poste_mois ?? 0, depart_des: profil?.depart_des ?? '', cimm_departement: profil?.cimm_departement ?? '', accepte_cycles: profil?.accepte_cycles ?? true, accepte_souhait_2_3: profil?.accepte_souhait_2_3 ?? true, accepte_changer_service: profil?.accepte_changer_service ?? false });
  const [s, setS] = useState<any[]>(souhaits.length ? souhaits : [{ rang: 1, service_id: '' }]);
  const [msg, setMsg] = useState<string | null>(null);
  const verifie = profil?.verifie_carte || profil?.verifie_mail_pro;
  const deuxFois = profil?.verifie_carte && profil?.verifie_mail_pro;

  const save = async () => {
    setMsg(null);
    const { error } = await sb.from('profils').update({ ...p, service_id: p.service_id || null, depart_des: p.depart_des || null, cimm_departement: p.cimm_departement || null }).eq('id', profil.id);
    if (error) return setMsg(error.message);
    await sb.from('souhaits').delete().eq('profil_id', profil.id);
    const rows = s.filter(x => x.service_id).map((x, i) => ({ profil_id: profil.id, rang: i + 1, service_id: +x.service_id, contrainte_type_service: x.contrainte_type_service || null }));
    if (rows.length) { const { error: e2 } = await sb.from('souhaits').insert(rows); if (e2) return setMsg(e2.message); }
    setMsg('Enregistré. Le prochain passage du matching en tiendra compte.'); r.refresh();
  };
  const monter = (i: number) => { if (i === 0) return; const a = [...s]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setS(a); };
  const supprimerCompte = async () => {
    if (!confirm('Supprimer définitivement votre compte et toutes vos données ?')) return;
    await fetch('/api/compte', { method: 'DELETE' }); await sb.auth.signOut(); location.href = '/';
  };
  const Sw = ({ k }: { k: 'accepte_cycles' | 'accepte_souhait_2_3' | 'accepte_changer_service' }) => <button onClick={() => setP({ ...p, [k]: !p[k] })} className={`w-[46px] h-[27px] rounded-full relative transition ${p[k] ? 'bg-bleu' : 'bg-[#D5D9E2]'}`}><span className={`absolute top-[3px] w-[21px] h-[21px] rounded-full bg-white shadow transition-all ${p[k] ? 'left-[22px]' : 'left-[3px]'}`} /></button>;
  const sel = 'field mt-1';

  return (
    <>
      <div className="flex justify-between items-center mb-3"><h1 className="h1">Mon profil</h1><span className={verifie ? 'pill-mint' : 'pill-amber'}>{deuxFois ? 'Vérifié deux fois' : verifie ? 'Vérifié' : 'À vérifier'}</span></div>
      {!verifie && <a href="/onboarding" className="btn mb-3">Terminer la vérification</a>}
      <div className="card">
        <div className="kv"><span>Institution</span><b>{profil?.institution}</b></div>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Corps<select className={sel} value={p.corps} onChange={e => setP({ ...p, corps: e.target.value, grade: '' })}><option value="">—</option>{corps.map((c: any) => <option key={c.code} value={c.code}>{c.libelle}</option>)}</select></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Grade<select className={sel} value={p.grade} onChange={e => setP({ ...p, grade: e.target.value })}><option value="">—</option>{grades.filter((g: any) => g.corps === p.corps).map((g: any) => <option key={g.code} value={g.code}>{g.libelle}</option>)}</select></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Affectation actuelle<select className={sel} value={p.service_id} onChange={e => setP({ ...p, service_id: e.target.value })}><option value="">—</option>{services.map((x: any) => <option key={x.id} value={x.id}>{x.libelle} ({x.departement})</option>)}</select></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Type de service<input className={sel} value={p.type_service} onChange={e => setP({ ...p, type_service: e.target.value })} placeholder="SP jour, BAC nuit, brigade, détention…" /></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Ancienneté dans le poste (mois)<input type="number" className={sel} value={p.anciennete_poste_mois} onChange={e => setP({ ...p, anciennete_poste_mois: +e.target.value })} /></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">Départ possible dès<input type="date" className={sel} value={p.depart_des} onChange={e => setP({ ...p, depart_des: e.target.value })} /></label>
        <label className="block mt-2 text-[12px] text-[#6F7789]">CIMM déclaré (département, outre-mer)<input className={sel} value={p.cimm_departement} onChange={e => setP({ ...p, cimm_departement: e.target.value })} placeholder="974, 971…" /></label>
      </div>

      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Mes souhaits, par ordre</h2>
      <div className="card">
        {s.map((x, i) => (
          <div key={i} className="flex items-center gap-2 py-2 border-t border-[#E6E9F0] first:border-t-0">
            <span className="w-7 h-7 rounded-lg bg-navy text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
            <select className="field py-2" value={x.service_id} onChange={e => { const a = [...s]; a[i] = { ...a[i], service_id: e.target.value }; setS(a); }}><option value="">Choisir…</option>{services.map((y: any) => <option key={y.id} value={y.id}>{y.libelle}</option>)}</select>
            <button onClick={() => monter(i)} className="w-8 h-8 rounded-lg bg-[#F5F7FB] text-[#6F7789]">↑</button>
            <button onClick={() => setS(s.filter((_, j) => j !== i))} className="w-8 h-8 rounded-lg bg-[#F5F7FB] text-[#C8323B]">×</button>
          </div>
        ))}
        {s.length < 5 && <button className="btn-ghost mt-2 py-2.5" onClick={() => setS([...s, { rang: s.length + 1, service_id: '' }])}>Ajouter un souhait</button>}
      </div>

      <h2 className="text-[15px] font-bold text-navy mt-4 mb-2">Réglages du matching</h2>
      <div className="card">
        <div className="kv"><span>Accepter les cycles à 3 et 4</span><Sw k="accepte_cycles" /></div>
        <div className="kv"><span>Accepter un souhait n°2 ou n°3</span><Sw k="accepte_souhait_2_3" /></div>
        <div className="kv"><span>Changer de type de service</span><Sw k="accepte_changer_service" /></div>
      </div>
      {msg && <p className="sub text-center my-2">{msg}</p>}
      <button className="btn mt-2" onClick={save}>Enregistrer</button>

      <h2 className="text-[15px] font-bold text-navy mt-6 mb-2">Discrétion</h2>
      <div className="card">
        <div className="kv"><span>Relire les engagements</span><a href="/onboarding" className="text-bleu">Voir ›</a></div>
        <div className="kv"><span>Se déconnecter</span><button className="text-bleu" onClick={async () => { await sb.auth.signOut(); location.href = '/'; }}>Sortir ›</button></div>
      </div>
      <button className="btn-ghost mt-2 text-[#C8323B] border-[#FFD3D6]" onClick={supprimerCompte}>Supprimer mon compte et toutes mes données</button>
    </>
  );
}
