'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const SEUIL_AFFICHAGE = 50;   // en dessous, aucun chiffre n'est affiché

/** Formulaire de pré-inscription (mode avant lancement), avec objectif et barre de progression. */
export default function Preinscription({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const [email, setEmail] = useState(''); const [inst, setInst] = useState('PN'); const [dep, setDep] = useState('');
  const [etat, setEtat] = useState<'idle' | 'busy' | 'ok' | 'deja' | 'err'>('idle'); const [msg, setMsg] = useState('');
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from('stats_publiques').select('valeur').eq('cle', 'preinscrits').single().then(({ data }) => setTotal(data?.valeur ?? 0));
    const ch = sb.channel(`pre_${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stats_publiques', filter: 'cle=eq.preinscrits' }, (p: any) => setTotal(p.new.valeur)).subscribe();
    return () => { try { sb.removeChannel(ch); } catch {} };
  }, []);
  const envoyer = async () => {
    setEtat('busy');
    const j = await fetch('/api/preinscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, institution: inst, departement: dep, canal: new URLSearchParams(location.search).get('via') }) }).then(r => r.json()).catch(() => ({ ok: false, message: 'Réseau indisponible.' }));
    if (j.ok) { setEtat(j.deja ? 'deja' : 'ok'); if (typeof j.total === 'number') setTotal(j.total); } else { setEtat('err'); setMsg(j.message ?? 'Erreur'); }
  };
  const t = dark ? 'text-white' : 'text-navy', sub = dark ? 'text-white/70' : 'text-[#6F7789]';
  const n = total ?? 0;
  const Progression = () => (
    <p className={`text-[12px] mt-3 ${sub}`}>{n >= SEUIL_AFFICHAGE ? <><b className={t}>{n.toLocaleString('fr-FR')}</b> collègues déjà inscrits · </> : null}gratuit · aucune adresse pro demandée · rien avant l&apos;ouverture</p>
  );
  if (etat === 'ok' || etat === 'deja') return <div className={`rounded-2xl p-5 ${dark ? 'bg-white/10 border border-white/20' : 'bg-[#DFF7EB] border border-[#CDEFDC]'}`}><b className={`block text-[16px] ${dark ? 'text-white' : 'text-[#16804F]'}`}>{etat === 'deja' ? 'Vous étiez déjà inscrit.' : 'C\'est noté.'}</b><span className={`text-[13.5px] ${sub}`}>Vous recevrez un message le jour de l&apos;ouverture, avec votre accès. Rien d&apos;autre d&apos;ici là. Parlez-en à un collègue qui veut bouger : plus on est nombreux, plus les cycles se ferment.</span><Progression /></div>;
  return (
    <div className={compact ? '' : `rounded-3xl p-5 md:p-6 ${dark ? 'bg-white/10 border border-white/20 backdrop-blur' : 'bg-white border border-[#E6E9F0]'}`}>
      {!compact && <><b className={`block text-[17px] ${t}`}>Être prévenu à l&apos;ouverture</b><p className={`text-[13.5px] mt-1 mb-3 ${sub}`}>Votre adresse personnelle, votre institution, votre département. Rien ne passe par la boîte.</p></>}
      <div className="flex flex-col sm:flex-row gap-2">
        <input className="field !py-3 flex-1" type="email" placeholder="votre.adresse@perso.fr" value={email} onChange={e => setEmail(e.target.value)} />
        <select className="field !py-3 sm:w-40" value={inst} onChange={e => setInst(e.target.value)}><option value="PN">Police</option><option value="GN">Gendarmerie</option><option value="AP">Pénitentiaire</option></select>
        <input className="field !py-3 sm:w-24" placeholder="Dép." value={dep} onChange={e => setDep(e.target.value)} maxLength={3} />
      </div>
      {etat === 'err' && <p className="text-coral text-[12.5px] mt-2">{msg}</p>}
      <button className="btn mt-2.5" onClick={envoyer} disabled={etat === 'busy' || !email.includes('@')}>{etat === 'busy' ? 'Envoi…' : 'Me prévenir à l\'ouverture'}</button>
      <Progression />
    </div>
  );
}
