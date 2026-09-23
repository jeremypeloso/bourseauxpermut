import { supabaseServer, currentUser } from '@/lib/supabase-server';
import Compte from './Compte';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sb = supabaseServer(); const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('institution, corps, grade, verifie_carte, verifie_mail_pro, premium_jusqua, services(libelle)').eq('id', user.id).maybeSingle();
  const { data: annonce } = await sb.from('annonces').select('id, statut, mise_en_avant_jusqua, created_at').eq('profil_id', user.id).eq('statut', 'active').maybeSingle();
  return <Compte email={user.email ?? ''} profil={profil} annonce={annonce} />;
}
