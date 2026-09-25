import { NextRequest, NextResponse } from 'next/server';
import { adminRequis } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

/** Actions d'administration. POST { action, id, ... } */
export async function POST(req: NextRequest) {
  const me = await adminRequis();
  if (!me) return NextResponse.json({ error: 'interdit' }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const admin = supabaseAdmin();
  try {
    switch (b.action) {
      case 'verifier': await admin.from('profils').update({ verifie_carte: true, verifie_le: new Date().toISOString() }).eq('id', b.id); break;
      case 'deverifier': await admin.from('profils').update({ verifie_carte: false, verifie_mail_pro: false, verifie_le: null }).eq('id', b.id); break;
      case 'premium': await admin.from('profils').update({ premium_jusqua: new Date(Date.now() + (b.jours ?? 30) * 86400e3).toISOString() }).eq('id', b.id); break;
      case 'premium_off': await admin.from('profils').update({ premium_jusqua: null }).eq('id', b.id); break;
      case 'supprimer_compte': await admin.auth.admin.deleteUser(b.id); break;
      case 'retirer_annonce': await admin.from('annonces').update({ statut: 'retiree', updated_at: new Date().toISOString() }).eq('id', b.id); break;
      case 'reactiver_annonce': await admin.from('annonces').update({ statut: 'active', updated_at: new Date().toISOString() }).eq('id', b.id); break;
      case 'boost_annonce': await admin.from('annonces').update({ mise_en_avant_jusqua: new Date(Date.now() + 7 * 86400e3).toISOString() }).eq('id', b.id); break;
      case 'supprimer_annonce': await admin.from('annonces').delete().eq('id', b.id); break;
      case 'fermer_corr': await admin.from('correspondances').update({ statut: 'refusee', updated_at: new Date().toISOString() }).eq('id', b.id); break;
      case 'valider_service': await admin.from('services').update({ valide: true }).eq('id', b.id); break;
      case 'supprimer_service': await admin.from('services').delete().eq('id', b.id); break;
      case 'supprimer_preinscrit': await admin.from('preinscriptions').delete().eq('id', b.id); break;
      case 'signalement_traiter': await admin.from('signalements').update({ statut: 'traite' }).eq('id', b.id); if (b.retirer && b.annonce_id) await admin.from('annonces').update({ statut: 'retiree', updated_at: new Date().toISOString() }).eq('id', b.annonce_id); break;
      case 'signalement_rejeter': await admin.from('signalements').update({ statut: 'rejete' }).eq('id', b.id); break;
      case 'institution': await admin.from('institutions').update({ ouverte: !!b.ouverte }).eq('code', b.id); break;
      case 'retirer_exemples': await admin.from('annonces').delete().eq('demo', true); break;
      case 'rembourser': { const { stripe } = await import('@/lib/stripe'); await stripe().refunds.create({ payment_intent: b.id }); break; }
      case 'annuler_abonnement': { const { stripe } = await import('@/lib/stripe'); await stripe().subscriptions.update(b.id, { cancel_at_period_end: true }); break; }
      case 'matching': { const r = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/matching`, { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } }).then(x => x.json()); return NextResponse.json({ ok: true, resultat: r }); }
      default: return NextResponse.json({ ok: false, message: 'action inconnue' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ ok: false, message: e?.message }, { status: 400 }); }
}
