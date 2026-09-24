'use client';
import { useMemo, useState } from 'react';
import { DEPARTEMENTS, OUTRE_MER_CODES } from '@/lib/departements';

export type Service = { id: number; ville: string; type: string; libelle: string; departement: string };
const TYPES: Record<string, string[]> = {
  PN: ['CSP', 'BAC', 'CRS', 'PAF', 'PJ', 'CSI', 'DSPAP', 'Renseignement', 'Police-secours', 'Unité de nuit', 'Brigade cynophile', 'Formation', 'État-major', 'PTS', 'Autre'],
  GN: ['BTA', 'COB', 'PSIG', 'BR', 'BMO', 'EDSR', 'Escadron GM', 'PGHM', 'GIGN', 'Gendarmerie aérienne', 'Gendarmerie maritime', 'Formation', 'État-major', 'GGD', 'Autre'],
  AP: ['MA', 'CD', 'CP', 'MC', 'EPM', 'CSL', 'SPIP', 'ERIS', 'PREJ', 'ENAP', 'EP', 'Autre'],
};
const DEPS = [...Object.keys(DEPARTEMENTS).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true })), ...Object.keys(OUTRE_MER_CODES)];
const nomDep = (d: string) => OUTRE_MER_CODES[d] ?? d;

/**
 * Choix d'une affectation en deux temps : département, puis service de la liste.
 * Si l'affectation manque : « Autre » → ville + type (liste fermée) + libellé court, créée à la volée via /api/services.
 */
export default function ChoixAffectation({ institution, services, value, onChange, onAjout, compact = false }: { institution: string; services: Service[]; value: string; onChange: (id: string) => void; onAjout: (s: Service) => void; compact?: boolean }) {
  const actuel = services.find(s => String(s.id) === String(value));
  const [dep, setDep] = useState(actuel?.departement ?? '');
  const [autre, setAutre] = useState(false);
  const [n, setN] = useState({ ville: '', type: TYPES[institution]?.[0] ?? 'Autre', libelle: '' });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const liste = useMemo(() => services.filter(s => s.departement === dep).sort((a, b) => a.libelle.localeCompare(b.libelle)), [services, dep]);
  const creer = async () => {
    setBusy(true); setErr(null);
    const j = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...n, departement: dep }) }).then(r => r.json()).catch(() => ({ ok: false, message: 'réseau' }));
    setBusy(false);
    if (!j.ok) return setErr(j.message ?? 'Erreur');
    const s: Service = { id: j.id, ville: n.ville, type: n.type, libelle: n.libelle || `${n.type} ${n.ville}`, departement: dep };
    onAjout(s); onChange(String(s.id)); setAutre(false); setN({ ville: '', type: TYPES[institution]?.[0] ?? 'Autre', libelle: '' });
  };
  const py = compact ? '!py-2.5' : '';
  return (
    <div className="grid gap-2">
      <div className={`grid ${compact ? 'grid-cols-[110px_1fr]' : 'sm:grid-cols-[130px_1fr]'} gap-2`}>
        <select className={`field ${py}`} value={dep} onChange={e => { setDep(e.target.value); onChange(''); setAutre(false); }}>
          <option value="">Dép.</option>{DEPS.map(d => <option key={d} value={d}>{d}{OUTRE_MER_CODES[d] ? ` · ${nomDep(d)}` : ''}</option>)}
        </select>
        <select className={`field ${py}`} value={autre ? '__autre' : value} disabled={!dep} onChange={e => { if (e.target.value === '__autre') { setAutre(true); onChange(''); } else { setAutre(false); onChange(e.target.value); } }}>
          <option value="">{dep ? 'Choisir le service…' : 'Choisissez d\'abord le département'}</option>
          {liste.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
          {dep && <option value="__autre">＋ Mon affectation n&apos;est pas dans la liste</option>}
        </select>
      </div>
      {autre && (
        <div className="rounded-xl bg-paper p-3 grid gap-2">
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="field !py-2.5" placeholder="Ville" value={n.ville} onChange={e => setN({ ...n, ville: e.target.value })} maxLength={40} />
            <select className="field !py-2.5" value={n.type} onChange={e => setN({ ...n, type: e.target.value })}>{(TYPES[institution] ?? ['Autre']).map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <input className="field !py-2.5" placeholder="Libellé court (ex. CSP Cannes, BTA Lannion, MA Fresnes)" value={n.libelle} onChange={e => setN({ ...n, libelle: e.target.value })} maxLength={60} />
          <p className="text-[11.5px] text-[#6F7789]">Ville et intitulé du service uniquement : pas d&apos;unité précise, pas de matricule, pas de nom. L&apos;affectation devient disponible pour tous les collègues du département.</p>
          {err && <p className="text-coral text-[12px]">{err}</p>}
          <div className="flex gap-2"><button className="btn !w-auto !py-2.5 px-4 text-[13px]" onClick={creer} disabled={busy || n.ville.length < 2}>{busy ? 'Ajout…' : 'Ajouter cette affectation'}</button><button className="btn-ghost !w-auto !py-2.5 px-4 text-[13px]" onClick={() => setAutre(false)}>Annuler</button></div>
        </div>
      )}
    </div>
  );
}
