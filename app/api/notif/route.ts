import { NextRequest, NextResponse } from 'next/server';
import { mailAdmin } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

/** Appelé par les triggers Supabase (pg_net) avec le CRON_SECRET. Body : { type, ... }. */
export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'interdit' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const admin = supabaseAdmin();
  const n = async (t: string, f?: (q: any) => any) => { let q: any = admin.from(t).select('id', { count: 'exact', head: true }); if (f) q = f(q); const { count } = await q; return count ?? 0; };
  try {
    switch (b.type) {
      case 'inscription': await mailAdmin('Nouvelle inscription', [`Institution : ${b.institution ?? '—'}`, `Comptes avec profil : ${await n('profils')}`]); break;
      case 'verification': await mailAdmin('Compte vérifié', [`Institution : ${b.institution ?? '—'} · par ${b.voie ?? 'carte ou mail pro'}`, `Vérifiés : ${await n('profils', q => q.or('verifie_carte.eq.true,verifie_mail_pro.eq.true'))}`, `Premium offerts : ${await n('profils', q => q.not('premium_offert_le', 'is', null))} / 100`]); break;
      case 'annonce': await mailAdmin('Nouvelle annonce', [`${b.grade ?? ''} · département ${b.departement ?? '?'} → ${b.cibles ?? ''}`, `Annonces réelles actives : ${await n('annonces', q => q.eq('statut', 'active').eq('demo', false))}`]); break;
      case 'correspondance': await mailAdmin(b.statut === 'confirmee' ? 'Correspondance confirmée' : 'Nouvelle correspondance', [`Type : ${b.corr_type ?? ''} · score ${b.score ?? ''} %`, `Ouvertes : ${await n('correspondances', q => q.neq('statut', 'refusee'))} · confirmées : ${await n('correspondances', q => q.eq('statut', 'confirmee'))}`]); break;
      case 'signalement': await mailAdmin('Signalement à traiter', [`Motif : ${b.motif ?? ''}`, `À traiter : ${await n('signalements', q => q.eq('statut', 'ouvert'))}`, 'Engagement affiché : examen sous 24 h.']); break;
      case 'preinscription': await mailAdmin('Nouvelle pré-inscription', [`Institution : ${b.institution ?? '—'} · dép. ${b.departement ?? '—'} · canal ${b.canal ?? 'direct'}`, `Total : ${await n('preinscriptions')}`]); break;
      default: return NextResponse.json({ ok: false }, { status: 400 });
    }
  } catch (e: any) { console.error('notif admin', e?.message); }
  return NextResponse.json({ ok: true });
}
