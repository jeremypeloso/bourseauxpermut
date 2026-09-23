import { supabaseServer, currentUser } from '@/lib/supabase-server';
import ListeMatchs from './Liste';

export const dynamic = 'force-dynamic';

export default async function Matchs() {
  const sb = supabaseServer(); const user = (await currentUser())!;
  const { data: profil } = await sb.from('profils').select('premium_jusqua, verifie_carte, verifie_mail_pro').eq('id', user.id).maybeSingle();
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();
  const { data: rows } = await sb.from('v_mes_correspondances').select('*').order('score', { ascending: false });
  const { data: ignorees } = await sb.from('correspondances_ignorees').select('correspondance_id');
  const ign = new Set((ignorees ?? []).map(i => i.correspondance_id));
  const map = new Map<string, any>();
  for (const r of rows ?? []) { if (ign.has(r.id)) continue; const c = map.get(r.id) ?? { id: r.id, type: r.type, score: r.score, statut: r.statut, detail: r.detail, membres: [] }; c.membres.push(r); map.set(r.id, c); }
  const corrs = [...map.values()].map(c => ({ ...c, membres: c.membres.sort((a: any, b: any) => a.position - b.position) }));
  return <ListeMatchs corrs={corrs} premium={premium} verifie={!!(profil?.verifie_carte || profil?.verifie_mail_pro)} />;
}
