import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
const DOMAINES_PRO = ['interieur.gouv.fr', 'gendarmerie.interieur.gouv.fr', 'justice.fr', 'justice.gouv.fr'];

/** POST { email, institution?, departement?, canal? } → pré-inscription + mail de confirmation neutre. */
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ ok: false, message: 'Adresse invalide.' }, { status: 400 });
  if (DOMAINES_PRO.some(d => email.endsWith('@' + d))) return NextResponse.json({ ok: false, message: 'Utilisez votre adresse personnelle, pas celle du service : rien ne doit passer par la boîte.' }, { status: 400 });
  const institution = ['PN', 'GN', 'AP'].includes(b.institution) ? b.institution : null;
  const departement = /^(\d{2,3}|2A|2B)$/i.test(String(b.departement ?? '')) ? String(b.departement).toUpperCase() : null;
  const admin = supabaseAdmin();
  const { error } = await admin.from('preinscriptions').insert({ email, institution, departement, canal: b.canal ?? null });
  if (error && !/duplicate/i.test(error.message)) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  if (!error && process.env.RESEND_API_KEY) {
    try {
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.EMAIL_FROM!, to: email, subject: 'Votre pré-inscription est enregistrée',
        text: `Bonjour,\n\nVotre pré-inscription est bien enregistrée. Vous recevrez un message le jour de l'ouverture, avec votre accès.\n\nD'ici là, rien ne vous est demandé, et cette adresse ne sert qu'à ça.\n\nLa Bourse aux permut'`,
      });
    } catch {}
  }
  const { data: s } = await admin.from('stats_publiques').select('valeur').eq('cle', 'preinscrits').single();
  return NextResponse.json({ ok: true, deja: !!error, total: s?.valeur ?? 0 });
}
