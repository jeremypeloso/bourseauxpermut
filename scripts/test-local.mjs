// Jeu de test local : crée 3 comptes vérifiés (2 policiers qui permutent, 1 gendarme), leurs annonces,
// lance le matching et vérifie qu'une correspondance apparaît.
// Usage : node scripts/test-local.mjs [http://localhost:3000]
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; }));
const SITE = process.argv[2] || env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ok = (t) => console.log('✓', t), ko = (t) => { console.log('✗', t); process.exitCode = 1; };

const COMPTES = [
  { email: 'test1@labourseauxpermut.fr', mdp: 'Test1234!', institution: 'PN', corps: 'CEA', grade: 'GPX', ville: 'Montpellier', service: 'SP jour', souhaits: ['Nice', 'Toulouse'] },
  { email: 'test2@labourseauxpermut.fr', mdp: 'Test1234!', institution: 'PN', corps: 'CEA', grade: 'GPX', ville: 'Nice', service: 'SP jour', souhaits: ['Montpellier'] },
  { email: 'test3@labourseauxpermut.fr', mdp: 'Test1234!', institution: 'GN', corps: 'SOG', grade: 'GEN', ville: 'Nice', service: 'Brigade', souhaits: ['Nice'] },
];

console.log('\n== La Bourse aux permut\' · test local ==', SITE, '\n');

// 0. Santé Supabase
const h = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`).then(r => r.status).catch(() => 0);
h === 200 ? ok('Supabase joignable') : ko(`Supabase injoignable (${h}) : vérifie NEXT_PUBLIC_SUPABASE_URL`);

// 1. Comptes
const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
const ids = {};
for (const c of COMPTES) {
  let u = users.users.find(x => x.email === c.email);
  if (!u) {
    const { data, error } = await admin.auth.admin.createUser({ email: c.email, password: c.mdp, email_confirm: true, user_metadata: { mdp: true } });
    if (error) { ko(`création ${c.email} : ${error.message}`); continue; }
    u = data.user; ok(`compte créé ${c.email}`);
  } else {
    await admin.auth.admin.updateUserById(u.id, { password: c.mdp, user_metadata: { mdp: true } });
    ok(`compte existant ${c.email} (mot de passe réinitialisé)`);
  }
  ids[c.email] = u.id;
  const { data: svc } = await admin.from('services').select('id').eq('institution', c.institution).eq('ville', c.ville).limit(1).maybeSingle();
  if (!svc) { ko(`service ${c.ville} (${c.institution}) absent de la table services`); continue; }
  const { error: pe } = await admin.from('profils').upsert({ id: u.id, institution: c.institution, corps: c.corps, grade: c.grade, service_id: svc.id, type_service: c.service, anciennete_poste_mois: 36, depart_des: '2027-03-01', accepte_cycles: true, verifie_carte: true, verifie_mail_pro: true, verifie_le: new Date().toISOString(), premium_jusqua: new Date(Date.now() + 365 * 86400e3).toISOString() });
  if (pe) { ko(`profil ${c.email} : ${pe.message}`); continue; }
  await admin.from('souhaits').delete().eq('profil_id', u.id);
  for (let i = 0; i < c.souhaits.length; i++) {
    const { data: s } = await admin.from('services').select('id').eq('institution', c.institution).eq('ville', c.souhaits[i]).limit(1).maybeSingle();
    if (s) await admin.from('souhaits').insert({ profil_id: u.id, rang: i + 1, service_id: s.id });
  }
  ok(`profil vérifié + Premium : ${c.email} · ${c.ville} → ${c.souhaits.join(', ')}`);
}

// 2. Annonces (une par compte, à partir du profil)
for (const c of COMPTES) {
  const uid = ids[c.email]; if (!uid) continue;
  const { data: p } = await admin.from('profils').select('*, souhaits(rang, service_id, services(ville, departement))').eq('id', uid).single();
  const cibles = (p.souhaits ?? []).sort((a, b) => a.rang - b.rang).map(s => ({ service_id: s.service_id, ville: s.services?.ville, departement: s.services?.departement }));
  const { data: ex } = await admin.from('annonces').select('id').eq('profil_id', uid).eq('statut', 'active').maybeSingle();
  const base = { profil_id: uid, institution: p.institution, corps: p.corps, grade: p.grade, service_id: p.service_id, type_service: p.type_service, anciennete_poste_mois: p.anciennete_poste_mois, depart_des: p.depart_des, cibles, statut: 'active' };
  const { error } = ex ? await admin.from('annonces').update(base).eq('id', ex.id) : await admin.from('annonces').insert(base);
  error ? ko(`annonce ${c.email} : ${error.message}`) : ok(`annonce en ligne : ${c.grade} · ${c.ville} → ${cibles.map(x => x.ville).join(', ')}`);
}

// 3. Matching
const m = await fetch(`${SITE}/api/cron/matching`, { headers: { Authorization: `Bearer ${env.CRON_SECRET}` } }).then(r => r.json()).catch(e => ({ error: e.message }));
m.error ? ko(`matching : ${m.error} (le serveur tourne-t-il sur ${SITE} ?)`) : ok(`matching lancé : ${m.agents} agents, ${m.cycles} cycle(s) trouvé(s), ${m.crees} nouveau(x)`);

// 4. Vérification
const { data: corr } = await admin.from('correspondance_membres').select('correspondance_id, profil_id').in('profil_id', Object.values(ids));
const n = new Set((corr ?? []).map(c => c.correspondance_id)).size;
n > 0 ? ok(`${n} correspondance(s) entre test1 (Montpellier→Nice) et test2 (Nice→Montpellier)`) : ko('aucune correspondance : vérifie les souhaits et que les deux profils sont vérifiés');
const { data: stats } = await admin.from('stats_publiques').select('cle, valeur');
ok(`compteurs publics : ${(stats ?? []).map(s => `${s.cle}=${s.valeur}`).join(' · ')}`);

console.log(`
Connexion sur ${SITE} :
  test1@labourseauxpermut.fr / Test1234!   (Montpellier → Nice, Premium)
  test2@labourseauxpermut.fr / Test1234!   (Nice → Montpellier, Premium)
  test3@labourseauxpermut.fr / Test1234!   (gendarme Nice, ne doit rien voir des annonces police)

À voir : /annonces (les annonces des autres), /matchs (la permutation directe), accepter des deux côtés puis "Voir les identités".
Pour tout effacer : node scripts/test-local.mjs --reset
`);

if (process.argv.includes('--reset')) {
  for (const id of Object.values(ids)) await admin.auth.admin.deleteUser(id);
  ok('comptes de test supprimés (cascade sur profils, annonces, correspondances)');
}
