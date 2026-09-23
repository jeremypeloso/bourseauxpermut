import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { decrypt, encrypt, hashCode } from '@/lib/crypto';
import { envoyerCodePro } from '@/lib/email';

export const runtime = 'nodejs';

function normalise(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
}

/** POST { action:'send', email } | { action:'confirm', code } */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const body = await req.json();
  const admin = supabaseAdmin();

  if (body.action === 'send') {
    const email: string = String(body.email ?? '').trim().toLowerCase();
    const [local, domaine] = email.split('@');
    if (!local || !domaine) return NextResponse.json({ ok: false, message: 'Adresse invalide.' });

    const { data: profil } = await admin.from('profils').select('institution').eq('id', user.id).single();
    const { data: inst } = await admin.from('institutions').select('domaines_mail').eq('code', profil?.institution).single();
    if (!inst?.domaines_mail?.includes(domaine)) {
      return NextResponse.json({ ok: false, message: 'Le domaine ne correspond pas à votre institution. Utilisez votre adresse nominative, pas celle de l\'unité.' });
    }
    // Cohérence avec le nom lu sur la carte
    const { data: ident } = await admin.from('identites').select('nom_enc, prenom_enc').eq('profil_id', user.id).maybeSingle();
    if (ident && decrypt(ident.nom_enc)) {
      // Voie 1 + 2 : l'adresse doit correspondre au nom lu sur la carte
      const nom = normalise(decrypt(ident.nom_enc)), prenom = normalise(decrypt(ident.prenom_enc));
      const l = normalise(local);
      if (!(l.includes(nom) && l.includes(prenom.slice(0, 3)))) {
        return NextResponse.json({ ok: false, message: 'L\'adresse ne semble pas être la vôtre (prénom.nom attendu).' });
      }
    } else if (!/^[a-z]+[.\-][a-z\-]+\d*$/.test(normalise(local).length ? local : '')) {
      // Voie 2 seule : on exige au moins la forme prenom.nom (pas une boîte fonctionnelle)
      return NextResponse.json({ ok: false, message: 'Utilisez votre adresse nominative (prenom.nom@…), pas une boîte de service.' });
    }
    if (!ident) {
      // Voie 2 seule : prénom.nom déduits de l'adresse pour la révélation ultérieure
      const [pre, nomAdr] = local.split(/[.\-]/);
      await admin.from('identites').insert({ profil_id: user.id, nom_enc: encrypt((nomAdr ?? '').toUpperCase()), prenom_enc: encrypt(pre ?? ''), mail_pro_enc: encrypt(email) });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await admin.from('codes_mail_pro').upsert({
      profil_id: user.id, code_hash: hashCode(code), expire_le: new Date(Date.now() + 7 * 86400e3).toISOString(), tentatives: 0,
    });
    await admin.from('identites').update({ mail_pro_enc: encrypt(email) }).eq('profil_id', user.id);
    await envoyerCodePro(email, code.slice(0, 3) + ' ' + code.slice(3));
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'confirm') {
    const code = String(body.code ?? '').replace(/\s+/g, '');
    const { data: row } = await admin.from('codes_mail_pro').select('*').eq('profil_id', user.id).single();
    if (!row || new Date(row.expire_le) < new Date()) return NextResponse.json({ ok: false, message: 'Code expiré, demandez-en un nouveau.' });
    if (row.tentatives >= 5) return NextResponse.json({ ok: false, message: 'Trop de tentatives.' });
    if (row.code_hash !== hashCode(code)) {
      await admin.from('codes_mail_pro').update({ tentatives: row.tentatives + 1 }).eq('profil_id', user.id);
      return NextResponse.json({ ok: false, message: 'Code incorrect.' });
    }
    await admin.from('codes_mail_pro').delete().eq('profil_id', user.id);
    await admin.from('profils').update({ verifie_mail_pro: true, verifie_le: new Date().toISOString() }).eq('id', user.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'action inconnue' }, { status: 400 });
}
