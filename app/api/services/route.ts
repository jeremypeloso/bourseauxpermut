import { NextRequest, NextResponse } from 'next/server';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { DEPARTEMENTS } from '@/lib/departements';

export const runtime = 'nodejs';
/** Types de service par institution : liste fermée (pas de texte libre pour le type). */
const TYPES: Record<string, string[]> = {
  PN: ['CSP', 'BAC', 'CRS', 'PAF', 'PJ', 'CSI', 'DSPAP', 'Renseignement', 'Police-secours', 'Unité de nuit', 'Brigade cynophile', 'Formation', 'État-major', 'PTS', 'Autre'],
  GN: ['BTA', 'COB', 'PSIG', 'BR', 'BMO', 'EDSR', 'Escadron GM', 'PGHM', 'GIGN', 'Gendarmerie aérienne', 'Gendarmerie maritime', 'Formation', 'État-major', 'GGD', 'Autre'],
  AP: ['MA', 'CD', 'CP', 'MC', 'EPM', 'CSL', 'SPIP', 'ERIS', 'PREJ', 'ENAP', 'EP', 'Autre'],
};

/**
 * POST { ville, departement, type, libelle? } → crée une affectation absente du référentiel, dans l'institution de l'agent.
 * Champ libre encadré : ville et libellé courts, sans chiffres de matricule ni email, type dans la liste fermée.
 */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: p } = await admin.from('profils').select('institution').eq('id', user.id).maybeSingle();
  if (!p) return NextResponse.json({ ok: false, message: 'profil manquant' }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const dep = String(b.departement ?? '').toUpperCase();
  const ville = String(b.ville ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const type = String(b.type ?? '');
  const libelle = String(b.libelle ?? '').trim().replace(/\s+/g, ' ').slice(0, 60) || `${type} ${ville}`;
  const propre = (t: string) => /^[A-Za-zÀ-ÿ0-9' \-().]+$/.test(t) && !/@|\d{5,}/.test(t);
  if (!(dep in DEPARTEMENTS) && !/^(97[1-6]|98[78])$/.test(dep)) return NextResponse.json({ ok: false, message: 'Département inconnu.' }, { status: 400 });
  if (!TYPES[p.institution]?.includes(type)) return NextResponse.json({ ok: false, message: 'Type de service inconnu.' }, { status: 400 });
  if (ville.length < 2 || !propre(ville) || !propre(libelle)) return NextResponse.json({ ok: false, message: 'Nom de ville ou libellé invalide (lettres uniquement, pas de matricule ni d\'adresse).' }, { status: 400 });
  const { data: ex } = await admin.from('services').select('id').eq('institution', p.institution).eq('departement', dep).ilike('ville', ville).eq('type', type).maybeSingle();
  if (ex) return NextResponse.json({ ok: true, id: ex.id, existant: true });
  const c = DEPARTEMENTS[dep];
  const { data: s, error } = await admin.from('services').insert({ institution: p.institution, ville, departement: dep, type, libelle, outre_mer: /^9[78]/.test(dep), lat: c?.[1] ?? null, lng: c?.[0] ?? null, ajoute_par: user.id }).select('id').single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: s.id });
}
