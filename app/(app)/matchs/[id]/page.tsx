import { supabaseServer, currentUser } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Detail from './Detail';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const sb = supabaseServer(); const user = (await currentUser())!;
  const { data: rows } = await sb.from('v_mes_correspondances').select('*').eq('id', params.id).order('position');
  if (!rows?.length) notFound();
  const { data: profil } = await sb.from('profils').select('premium_jusqua').eq('id', user.id).single();
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();
  return <Detail id={params.id} rows={rows} premium={premium} />;
}
