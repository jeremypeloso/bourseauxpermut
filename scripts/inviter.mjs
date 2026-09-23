// Jour de l'ouverture : envoie l'invitation aux pré-inscrits non encore invités (par lots de 50).
// Usage : node scripts/inviter.mjs [--dry]
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const resend = new Resend(env.RESEND_API_KEY); const dry = process.argv.includes('--dry');
const { data } = await admin.from('preinscriptions').select('id, email').is('invite_le', null).limit(50);
for (const p of data ?? []) {
  if (!dry) {
    await resend.emails.send({ from: env.EMAIL_FROM, to: p.email, subject: 'C\'est ouvert', text: `Bonjour,\n\nLa Bourse aux permut' est ouverte. Créez votre compte avec cette adresse, puis vérifiez-le (carte pro ou mail pro) :\n${env.NEXT_PUBLIC_SITE_URL}\n\nÀ bientôt entre collègues.` });
    await admin.from('preinscriptions').update({ invite_le: new Date().toISOString() }).eq('id', p.id);
  }
  console.log(dry ? 'à inviter' : 'invité', p.email);
}
console.log(`${(data ?? []).length} traité(s). Relancez pour le lot suivant.`);
