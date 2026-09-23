import { supabaseServer, currentUser } from '@/lib/supabase-server';
import FormProfil from './Form';

export const dynamic = 'force-dynamic';

export default async function Profil() {
  const sb = supabaseServer();
  const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('*').eq('id', user.id).single();
  const { data: souhaits } = await sb.from('souhaits').select('*').eq('profil_id', user.id).order('rang');
  const { data: services } = await sb.from('services').select('id, ville, type, libelle, departement').eq('institution', profil?.institution).order('ville');
  const { data: corps } = await sb.from('corps').select('code, libelle').eq('institution', profil?.institution);
  const { data: grades } = await sb.from('grades').select('code, libelle, corps');
  return <FormProfil profil={profil} souhaits={souhaits ?? []} services={services ?? []} corps={corps ?? []} grades={grades ?? []} />;
}
