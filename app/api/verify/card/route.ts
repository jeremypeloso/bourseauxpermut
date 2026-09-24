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
  // Normalisation : majuscules, accents retirés, O/I confondus par l'OCR remis en chiffres après un libellé numérique
  const texte = data.text.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const num = (t?: string) => t?.replace(/[OQD]/g, '0').replace(/[IL|]/g, '1').replace(/[^0-9]/g, '');
  const ligne = (label: RegExp) => texte.match(label)?.[1]?.replace(/[^A-Z' \-]/g, ' ').replace(/\s+/g, ' ').trim();

  // Verso de la carte (côté identité) : Nom / Prénoms / Matricule (8 ch., police) / Identifiant RIO (7 ch.) / NIGEND (gendarmerie)
  const nom = ligne(/NOM\s*[:\-.]?\s*([A-Z' \-]{2,40})/);
  const prenom = ligne(/PRENOM[S]?\s*[:\-.]?\s*([A-Z' \-]{2,40})/);
  const matPolice = num(texte.match(/MATRICULE\s*[:\-.]?\s*([0-9OQDIL|]{6,10})/)?.[1]);
  const rio = num(texte.match(/RIO\s*[:\-.]?\s*([0-9OQDIL|]{6,8})/)?.[1]);
  const nigend = num(texte.match(/NIGEND\s*[:\-.]?\s*([0-9OQDIL|]{6,10})/)?.[1]);
  const matAP = num(texte.match(/(?:MATRICULE|N[°O])\s*[:\-.]?\s*([0-9OQDIL|]{5,10})/)?.[1]);
  const carteOfficielle = /MINIST[EÈ]RE DE L'?INT[EÉ]RIEUR|R[EÉ]PUBLIQUE FRAN[CÇ]AISE|GENDARMERIE|JUSTICE|P[EÉ]NITENTIAIRE/.test(texte);

  const institution = /GENDARMERIE|NIGEND/.test(texte) ? 'GN' : /PENITENTIAIRE|JUSTICE/.test(texte) ? 'AP' : /INTERIEUR|POLICE|RIO/.test(texte) ? 'PN' : null;
  // Empreinte anti-doublon : matricule ; à défaut le RIO (police) ou le NIGEND (gendarmerie)
  const matricule = (institution === 'GN' ? (nigend ?? matAP) : institution === 'AP' ? matAP : (matPolice ?? rio)) || undefined;

  if (!carteOfficielle || !matricule || !nom || !prenom || matricule.length < 6) {
    // OCR_DEBUG=1 (jamais en production) : renvoie le texte lu pour recaler les regex sur de vraies cartes. Rien n'est stocké.
    const debug = process.env.OCR_DEBUG === '1' && process.env.NODE_ENV !== 'production' ? { texte_lu: data.text.slice(0, 1500), confiance: data.confidence } : {};
    return NextResponse.json({ ok: false, lecture: { matricule: !!matricule, nom: !!nom, prenom: !!prenom }, message: 'Lecture incomplète, reprenez la photo ou demandez une revue manuelle.', ...debug });
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
