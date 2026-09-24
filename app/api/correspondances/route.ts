import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin, supabaseServer } from '@/lib/supabase-server';
import { decrypt } from '@/lib/crypto';
import { mailConfirmation, mailAVousDeRepondre, mailCycleFerme } from '@/lib/email';

export const runtime = 'nodejs';

/** POST { id, action:'accepter'|'refuser'|'ignorer'|'reveler' } */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const { id, action } = await req.json();
  const sb = supabaseServer();
  const admin = supabaseAdmin();

  const { data: profil } = await sb.from('profils').select('premium_jusqua').eq('id', user.id).single();
  const premium = !!profil?.premium_jusqua && new Date(profil.premium_jusqua) > new Date();

  if (action === 'ignorer') {
    await sb.from('correspondances_ignorees').upsert({ profil_id: user.id, correspondance_id: id });
    return NextResponse.json({ ok: true });
  }
  if (action === 'accepter' || action === 'refuser') {
    if (!premium) return NextResponse.json({ ok: false, paywall: true }, { status: 402 });
    const { error: ue } = await admin.from('correspondance_membres').update({ reponse: action === 'accepter' ? 'accepte' : 'refuse' })
      .eq('correspondance_id', id).eq('profil_id', user.id);
    if (ue) return NextResponse.json({ ok: false, message: ue.message }, { status: 400 });
    const { data: membres } = await admin.from('correspondance_membres').select('reponse, profil_id').eq('correspondance_id', id);
    const statut = membres?.some(m => m.reponse === 'refuse') ? 'refusee' : membres?.every(m => m.reponse === 'accepte') ? 'confirmee' : 'en_cours';
    await admin.from('correspondances').update({ statut, updated_at: new Date().toISOString() }).eq('id', id);
    // Notifications : tout le monde a accepté → confirmation à tous ; un accepte → « à vous de répondre » aux membres en attente ; un refuse → cycle fermé aux autres
    if (process.env.RESEND_API_KEY) for (const m of membres ?? []) {
      if (m.profil_id === user.id) continue;
      try {
        const { data: u } = await admin.auth.admin.getUserById(m.profil_id); const to = u?.user?.email; if (!to) continue;
        if (statut === 'confirmee') await mailConfirmation(to);
        else if (statut === 'refusee') await mailCycleFerme(to);
        else if (action === 'accepter' && m.reponse === 'attente') await mailAVousDeRepondre(to);
      } catch {}
    }
    return NextResponse.json({ ok: true, statut });
  }
  if (action === 'reveler') {
    const { data: membres } = await admin.from('correspondance_membres').select('profil_id, position, reponse').eq('correspondance_id', id);
    if (!membres?.some(m => m.profil_id === user.id)) return NextResponse.json({ error: 'non membre' }, { status: 403 });
    if (!membres.every(m => m.reponse === 'accepte')) return NextResponse.json({ error: 'cycle non confirmé' }, { status: 409 });
    await admin.from('journal_identites').insert({ profil_id: user.id, par_fonction: 'reveler_identites', correspondance_id: id });
    const autres = membres.filter(m => m.profil_id !== user.id);
    const { data: idents } = await admin.from('identites').select('profil_id, nom_enc, prenom_enc, telephone_enc, contact_email_enc, mail_pro_enc').in('profil_id', autres.map(a => a.profil_id));
    return NextResponse.json({
      ok: true,
      agents: (idents ?? []).map(i => ({
        position: autres.find(a => a.profil_id === i.profil_id)!.position,
        prenom: i.prenom_enc ? decrypt(i.prenom_enc) : '', nom: i.nom_enc ? decrypt(i.nom_enc) : '',
        telephone: i.telephone_enc ? decrypt(i.telephone_enc) : null,
        email: i.contact_email_enc ? decrypt(i.contact_email_enc) : (i.mail_pro_enc ? decrypt(i.mail_pro_enc) : null),
      })),
    });
  }
  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}
