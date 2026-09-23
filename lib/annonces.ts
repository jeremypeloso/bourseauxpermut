import { supabaseAdmin } from '@/lib/supabase-server';

export const estBoost = (a: any) => !!a.mise_en_avant_jusqua && new Date(a.mise_en_avant_jusqua) > new Date();
export const entete = (a: any) => ({
  id: a.id, grade: a.grade, institution: a.institution, ville: a.services?.ville ?? null, departement: a.services?.departement ?? null,
  cibles_villes: (a.cibles ?? []).map((c: any) => c.ville ?? c.departement).filter(Boolean).slice(0, 3),
  mise_en_avant: estBoost(a), created_at: a.created_at, flou: true, demo: !!a.demo,
});
export const clair = (a: any, mienne: boolean, score: number) => ({
  ...entete(a), flou: false, mienne, score,
  corps: a.corps, type_service: a.type_service, anciennete_poste_mois: a.anciennete_poste_mois, depart_des: a.depart_des,
  cibles: a.cibles, accepte_cycles: a.accepte_cycles ?? true, statut: a.statut, deux_fois: !!a.deux_fois,
});

export async function contexte(userId: string) {
  const admin = supabaseAdmin();
  const { data: moi } = await admin.from('profils').select('institution, premium_jusqua, verifie_carte, verifie_mail_pro, service_id, services(departement), souhaits(service_id, departement, services(departement))').eq('id', userId).maybeSingle();
  if (!moi) return null;
  const premium = !!moi.premium_jusqua && new Date(moi.premium_jusqua) > new Date();
  const verifie = !!(moi.verifie_carte || moi.verifie_mail_pro);
  const monDep = (moi as any).services?.departement as string | undefined;
  const mesDeps = new Set<string>(((moi as any).souhaits ?? []).map((s: any) => s.departement ?? s.services?.departement).filter(Boolean));
  const score = (a: any) => {
    let s = 40;
    if ((a.cibles ?? []).some((c: any) => c.departement === monDep)) s += 30;   // elle veut venir chez moi
    if (mesDeps.has(a.services?.departement)) s += 30;                          // elle part de là où je veux aller
    if (estBoost(a)) s += 5;
    return Math.min(99, s);
  };
  return { admin, moi, premium, verifie, monDep, mesDeps, score };
}
