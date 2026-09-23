import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { encrypt, hashMatricule } from '@/lib/crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST multipart : image de la carte pro.
 * L'image est traitée en mémoire, jamais écrite, jamais stockée.
 * On conserve : nom/prénom chiffrés, empreinte du matricule, corps/grade si lus.
 */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('image') as File | null;
  if (!file) return NextResponse.json({ error: 'image manquante' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());

  const worker = await createWorker('fra');
  const { data } = await worker.recognize(buf);
  await worker.terminate();
  const texte = data.text.toUpperCase();

  // Extraction très tolérante : à affiner avec de vraies cartes (PN, GN, AP n'ont pas le même gabarit)
  const matricule = (texte.match(/(?:MATRICULE|N[°O]|NIGEND|IDENT)[^0-9]{0,12}([0-9]{5,9})/) ?? texte.match(/\b([0-9]{6,9})\b/))?.[1];
  const nom = texte.match(/NOM\s*[:\-]?\s*([A-ZÀ-Ÿ' \-]{2,40})/)?.[1]?.trim();
  const prenom = texte.match(/PR[ÉE]NOM\s*[:\-]?\s*([A-ZÀ-Ÿ' \-]{2,40})/)?.[1]?.trim();
  const institution = /GENDARMERIE/.test(texte) ? 'GN' : /P[ÉE]NITENTIAIRE|JUSTICE/.test(texte) ? 'AP' : /POLICE/.test(texte) ? 'PN' : null;

  if (!matricule || !nom || !prenom) {
    return NextResponse.json({ ok: false, lecture: { matricule: !!matricule, nom: !!nom, prenom: !!prenom }, message: 'Lecture incomplète, reprenez la photo ou demandez une revue manuelle.' });
  }

  const admin = supabaseAdmin();
  const empreinte = hashMatricule(matricule);
  const { data: existant } = await admin.from('empreintes_matricule').select('profil_id').eq('empreinte', empreinte).maybeSingle();
  if (existant && existant.profil_id !== user.id) {
    return NextResponse.json({ ok: false, message: 'Cette carte est déjà associée à un autre compte.' }, { status: 409 });
  }

  await admin.from('identites').upsert({
    profil_id: user.id, nom_enc: encrypt(nom), prenom_enc: encrypt(prenom), mail_pro_enc: encrypt(''),
  });
  await admin.from('empreintes_matricule').upsert({ empreinte, profil_id: user.id });
  await admin.from('profils').update({ verifie_carte: true, ...(institution ? {} : {}) }).eq('id', user.id);

  // On renvoie uniquement ce qu'il faut afficher ; le matricule est masqué.
  return NextResponse.json({ ok: true, nom, prenom, institution, matricule_masque: '•••• ••' + matricule.slice(-2) });
}
