import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { Agent, construireGraphe, scorer, trouverCycles } from '@/lib/matching';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Appelé par Vercel Cron toutes les heures. Protégé par CRON_SECRET. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'interdit' }, { status: 401 });
  }
  const admin = supabaseAdmin();
  const { data: profils } = await admin
    .from('profils')
    .select('id, institution, corps, grade, service_id, type_service, anciennete_poste_mois, depart_des, accepte_cycles, accepte_souhait_2_3, accepte_changer_service, premium_jusqua, services(departement), souhaits(rang, service_id, departement, contrainte_type_service)')
    .or('verifie_carte.eq.true,verifie_mail_pro.eq.true');

  const agents: Agent[] = (profils ?? []).map((p: any) => ({
    id: p.id, institution: p.institution, corps: p.corps, grade: p.grade, service_id: p.service_id,
    departement: p.services?.departement ?? null, type_service: p.type_service,
    anciennete_poste_mois: p.anciennete_poste_mois, depart_des: p.depart_des,
    accepte_cycles: p.accepte_cycles, accepte_souhait_2_3: p.accepte_souhait_2_3, accepte_changer_service: p.accepte_changer_service,
    premium: !!p.premium_jusqua && new Date(p.premium_jusqua) > new Date(),
    souhaits: p.souhaits ?? [],
  }));
  const map = new Map(agents.map(a => [a.id, a]));
  const cycles = trouverCycles(construireGraphe(agents), map, 4);

  let crees = 0;
  for (const c of cycles) {
    const signature = [...c.ids].sort().join('|');
    const { score, detail } = scorer(c, map);
    if (score < 40) continue;
    const { data: corr, error } = await admin.from('correspondances').insert({
      institution: map.get(c.ids[0])!.institution,
      type: c.ids.length === 2 ? 'directe' : c.ids.length === 3 ? 'cycle3' : 'cycle4',
      score, detail, signature,
    }).select('id').single();
    if (error || !corr) continue; // signature déjà connue
    const now = Date.now();
    const membres = c.ids.map((id, i) => {
      const suivant = map.get(c.ids[(i + 1) % c.ids.length])!;
      const a = map.get(id)!;
      return {
        correspondance_id: corr.id, profil_id: id, position: i + 1, vers_service_id: suivant.service_id,
        // Premium : notifié tout de suite ; gratuit : 48 h plus tard
        notifie_le: new Date(now + (a.premium ? 0 : 48 * 3600e3)).toISOString(),
      };
    });
    await admin.from('correspondance_membres').insert(membres);
    crees++;
  }
  return NextResponse.json({ agents: agents.length, cycles: cycles.length, crees });
}
