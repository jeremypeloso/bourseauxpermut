import { supabaseServer, currentUser } from '@/lib/supabase-server';
import FormDepot from './Form';

export const dynamic = 'force-dynamic';

export default async function Deposer() {
  const sb = supabaseServer(); const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('*').eq('id', user.id).maybeSingle();
  const { data: souhaits } = await sb.from('souhaits').select('*').eq('profil_id', user.id).order('rang');
  const { data: services } = await sb.from('services').select('id, ville, type, libelle, departement').eq('institution', profil?.institution ?? 'PN').order('ville');
  const { data: corps } = await sb.from('corps').select('code, libelle').eq('institution', profil?.institution ?? 'PN');
  const { data: grades } = await sb.from('grades').select('code, libelle, corps');
  const { data: annonce } = await sb.from('annonces').select('id, mise_en_avant_jusqua').eq('profil_id', user.id).eq('statut', 'active').maybeSingle();
  return <FormDepot profil={profil} souhaits={souhaits ?? []} services={services ?? []} corps={corps ?? []} grades={grades ?? []} annonce={annonce} />;
}
