import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { mailReponseAnnonce } from '@/lib/email';

export const runtime = 'nodejs';

/** POST { annonce_id } → Premium uniquement. Crée une correspondance directe (moi accepté, l'auteur en attente). */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const { annonce_id } = await req.json();
  const admin = supabaseAdmin();
  const { data: moi } = await admin.from('profils').select('institution, premium_jusqua, service_id, verifie_carte, verifie_mail_pro').eq('id', user.id).single();
  const premium = !!moi?.premium_jusqua && new Date(moi.premium_jusqua) > new Date();
  if (!premium) return NextResponse.json({ ok: false, paywall: true }, { status: 402 });
  const { data: a } = await admin.from('annonces').select('*').eq('id', annonce_id).eq('statut', 'active').single();
  if (!a || a.institution !== moi!.institution || a.profil_id === user.id) return NextResponse.json({ ok: false, message: 'Annonce indisponible.' }, { status: 404 });
  if (a.demo) return NextResponse.json({ ok: false, message: 'Annonce d\'exemple : elle montre le format en attendant les premières vraies annonces. Déposez la vôtre, le matching fera le reste.' }, { status: 400 });
  const { data: deja } = await admin.from('annonce_reponses').select('correspondance_id').eq('annonce_id', annonce_id).eq('profil_id', user.id).maybeSingle();
  if (deja) return NextResponse.json({ ok: true, correspondance_id: deja.correspondance_id, deja: true });

  const signature = [user.id, a.profil_id].sort().join('|');
  const { data: exist } = await admin.from('correspondances').select('id, statut').eq('signature', signature).maybeSingle();
  if (exist) return NextResponse.json({ ok: true, correspondance_id: exist.id, existante: true });
  const { data: corr, error } = await admin.from('correspondances').insert({ institution: a.institution, type: 'directe', score: 70, statut: 'en_cours', signature, detail: { source: 'annonce', souhaits: 'proposition manuelle' } }).select('id').single();
  if (error || !corr) return NextResponse.json({ ok: false, message: 'Une proposition existe déjà entre vous deux.' }, { status: 409 });
  const now = new Date().toISOString();
  await admin.from('correspondance_membres').insert([
    { correspondance_id: corr.id, profil_id: user.id, position: 1, vers_service_id: a.service_id, reponse: 'accepte', notifie_le: now },
    { correspondance_id: corr.id, profil_id: a.profil_id, position: 2, vers_service_id: moi!.service_id, reponse: 'attente', notifie_le: now },
  ]);
  await admin.from('annonce_reponses').insert({ annonce_id, profil_id: user.id, correspondance_id: corr.id });
  try { const { data: u } = await admin.auth.admin.getUserById(a.profil_id); if (u?.user?.email && process.env.RESEND_API_KEY) await mailReponseAnnonce(u.user.email); } catch {}
  return NextResponse.json({ ok: true, correspondance_id: corr.id });
}
