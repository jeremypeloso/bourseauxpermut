/**
 * Détection de cycles de permutation (longueur 2 à 4).
 * Graphe : un arc A -> B signifie "A veut aller là où B est".
 * Un cycle A -> B -> C -> A est une permutation où chacun obtient un poste souhaité.
 */
export type Agent = {
  id: string; institution: string; corps: string | null; grade: string | null;
  service_id: number | null; departement: string | null; type_service: string | null;
  anciennete_poste_mois: number; depart_des: string | null;
  accepte_cycles: boolean; accepte_souhait_2_3: boolean; accepte_changer_service: boolean;
  premium: boolean;
  souhaits: { rang: number; service_id: number | null; departement: string | null; contrainte_type_service: string | null }[];
};

type Edge = { to: string; rang: number };

export function construireGraphe(agents: Agent[]) {
  const parService = new Map<number, Agent[]>();
  const parDep = new Map<string, Agent[]>();
  for (const a of agents) {
    if (a.service_id) parService.set(a.service_id, [...(parService.get(a.service_id) ?? []), a]);
    if (a.departement) parDep.set(a.departement, [...(parDep.get(a.departement) ?? []), a]);
  }
  const arcs = new Map<string, Edge[]>();
  for (const a of agents) {
    const out: Edge[] = [];
    for (const s of a.souhaits) {
      if (s.rang > 1 && !a.accepte_souhait_2_3) continue;
      const cibles = s.service_id ? (parService.get(s.service_id) ?? []) : s.departement ? (parDep.get(s.departement) ?? []) : [];
      for (const b of cibles) {
        if (b.id === a.id) continue;
        if (b.institution !== a.institution) continue;           // jamais de mélange
        if (b.corps !== a.corps || b.grade !== a.grade) continue; // même corps et grade en v1
        if (s.contrainte_type_service && b.type_service !== s.contrainte_type_service) continue;
        out.push({ to: b.id, rang: s.rang });
      }
    }
    arcs.set(a.id, out);
  }
  return arcs;
}

export function trouverCycles(arcs: Map<string, Edge[]>, agents: Map<string, Agent>, maxLen = 4) {
  const cycles: { ids: string[]; rangs: number[] }[] = [];
  const vu = new Set<string>();
  const ids = [...arcs.keys()].sort();
  for (const start of ids) {
    const dfs = (path: string[], rangs: number[]) => {
      const last = path[path.length - 1];
      for (const e of arcs.get(last) ?? []) {
        if (e.to === start && path.length >= 2) {
          const sig = [...path].sort().join('|');
          if (!vu.has(sig)) { vu.add(sig); cycles.push({ ids: [...path], rangs: [...rangs, e.rang] }); }
          continue;
        }
        if (path.length >= maxLen) continue;
        if (e.to < start || path.includes(e.to)) continue;   // canonique : start est le plus petit id
        const b = agents.get(e.to)!;
        if (path.length >= 2 && !b.accepte_cycles) continue;
        dfs([...path, e.to], [...rangs, e.rang]);
      }
    };
    if (agents.get(start)) dfs([start], []);
  }
  return cycles.filter(c => c.ids.length === 2 || c.ids.every(id => agents.get(id)!.accepte_cycles));
}

export function scorer(c: { ids: string[]; rangs: number[] }, agents: Map<string, Agent>) {
  const membres = c.ids.map(id => agents.get(id)!);
  let score = 100;
  const detail: Record<string, string> = {}; const bareme: string[] = [];
  // Souhaits : -8 par rang au-delà du 1er
  const penalRang = c.rangs.reduce((s, r) => s + (r - 1) * 8, 0); score -= penalRang; if (penalRang) bareme.push(`−${penalRang} souhaits au-delà du n°1`);
  detail.souhaits = c.rangs.every(r => r === 1) ? `${c.ids.length} souhaits n°1` : `${c.rangs.filter(r => r === 1).length}/${c.ids.length} en n°1`;
  // Type de service : -12 si différents
  const types = new Set(membres.map(m => m.type_service ?? '?'));
  if (types.size > 1) { score -= 12; detail.service = [...types].join(' ↔ '); bareme.push('−12 types de service différents'); } else detail.service = [...types].join('');
  // Fenêtre de départ : -10 si écart > 6 mois entre les dates
  const dates = membres.map(m => m.depart_des ? new Date(m.depart_des).getTime() : null).filter(Boolean) as number[];
  if (dates.length > 1 && (Math.max(...dates) - Math.min(...dates)) > 1000 * 3600 * 24 * 183) { score -= 10; detail.depart = 'fenêtres de départ éloignées'; bareme.push('−10 dates de départ éloignées'); }
  // Ancienneté poste renseignée et < 24 mois : -6 par agent (une ancienneté inconnue n'est pas pénalisée)
  const jeunes = membres.filter(m => m.anciennete_poste_mois > 0 && m.anciennete_poste_mois < 24).length;
  if (jeunes) { score -= 6 * jeunes; bareme.push(`−${6 * jeunes} ancienneté < 2 ans (${jeunes} agent${jeunes > 1 ? 's' : ''})`); }
  // Longueur : -4 par maillon au-delà de 2
  if (c.ids.length > 2) { score -= (c.ids.length - 2) * 4; bareme.push(`−${(c.ids.length - 2) * 4} cycle à ${c.ids.length}`); }
  detail.bareme = bareme.length ? bareme.join(' · ') : 'aucune pénalité';
  return { score: Math.max(0, Math.min(100, score)), detail };
}
