import { supabaseServer, currentUser } from '@/lib/supabase-server';
import Compte from './Compte';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sb = supabaseServer(); const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('institution, corps, grade, type_service, anciennete_poste_mois, depart_des, accepte_cycles, verifie_carte, verifie_mail_pro, verifie_le, premium_jusqua, premium_offert_le, stripe_customer_id, created_at, services!profils_service_id_fkey(libelle, ville, departement)').eq('id', user.id).maybeSingle();
  const { data: souhaits } = await sb.from('souhaits').select('rang, services(ville, departement, libelle)').eq('profil_id', user.id).order('rang');
  const { data: annonce } = await sb.from('annonces').select('id, statut, mise_en_avant_jusqua, created_at, cibles').eq('profil_id', user.id).eq('statut', 'active').eq('demo', false).maybeSingle();
  const { data: grade } = profil?.grade ? await sb.from('grades').select('libelle').eq('code', profil.grade).maybeSingle() : { data: null };
  const { data: m } = await sb.from('v_mes_correspondances').select('id').eq('est_moi', true);
  return <Compte email={user.email ?? ''} profil={profil} gradeLibelle={grade?.libelle ?? null} souhaits={souhaits ?? []} annonce={annonce} nbMatchs={new Set((m ?? []).map(x => x.id)).size} />;
}
