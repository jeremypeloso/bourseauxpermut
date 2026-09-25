import { supabaseServer, currentUser } from '@/lib/supabase-server';
import FormDepot from './Form';

export const dynamic = 'force-dynamic';

export default async function Deposer() {
  const sb = supabaseServer(); const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('*').eq('id', user.id).maybeSingle();
  const inst = profil?.institution ?? 'PN';
  const [{ data: souhaits }, { data: services }, { data: corps }, { data: grades }, { data: annonce }] = await Promise.all([
    sb.from('souhaits').select('*').eq('profil_id', user.id).order('rang'),
    sb.from('services').select('id, ville, type, libelle, departement').eq('institution', inst).order('ville'),
    sb.from('corps').select('code, libelle').eq('institution', inst),
    sb.from('grades').select('code, libelle, corps, rang'),
    sb.from('annonces').select('id, mise_en_avant_jusqua').eq('profil_id', user.id).eq('statut', 'active').eq('demo', false).maybeSingle(),
  ]);
  return <FormDepot profil={profil} souhaits={souhaits ?? []} services={services ?? []} corps={corps ?? []} grades={grades ?? []} annonce={annonce} />;
}
