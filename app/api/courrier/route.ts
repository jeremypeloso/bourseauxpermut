import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';
import { decrypt } from '@/lib/crypto';

export const runtime = 'nodejs';

/** POST { id, matricule, service, ville, lieu, destinataire } → PDF du courrier de demande de mutation par permutation. */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const admin = supabaseAdmin();
  const { data: c } = await admin.from('correspondances').select('id, statut, correspondance_membres(profil_id, position, profils(grade, services!profils_service_id_fkey(libelle, ville)))').eq('id', b.id).maybeSingle();
  if (!c || c.statut !== 'confirmee') return NextResponse.json({ ok: false, message: 'Courrier disponible uniquement pour une correspondance confirmée.' }, { status: 400 });
  const membres: any[] = c.correspondance_membres ?? [];
  if (!membres.some(m => m.profil_id === user.id)) return NextResponse.json({ error: 'interdit' }, { status: 403 });
  const { data: idents } = await admin.from('identites').select('profil_id, nom_enc, prenom_enc').in('profil_id', membres.map(m => m.profil_id));
  const nom = (pid: string) => { const i = idents?.find(x => x.profil_id === pid); return i ? `${i.prenom_enc ? decrypt(i.prenom_enc) : ''} ${i.nom_enc ? decrypt(i.nom_enc) : ''}`.trim() : 'Agent'; };
  const { data: grades } = await admin.from('grades').select('code, libelle');
  const gl = (code?: string) => grades?.find(g => g.code === code)?.libelle ?? code ?? '';
  const moi = membres.find(m => m.profil_id === user.id); const autres = membres.filter(m => m.profil_id !== user.id).sort((x, y) => x.position - y.position);
  await admin.from('journal_identites').insert({ profil_id: user.id, par_fonction: 'courrier_pdf', correspondance_id: c.id });

  const nettoyer = (t: string) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, m => m).replace(/[^\x00-\xFF]/g, '');
  const pdf = await PDFDocument.create(); const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.TimesRoman); const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const M = 60, W = 595.28 - 2 * M; let y = 841.89 - 60;
  const write = (t: string, f = font, size = 11, lh = 15) => {
    const mots = nettoyer(t).split(' '); let ligne = '';
    for (const w of mots) { const test = (ligne + ' ' + w).trim(); if (f.widthOfTextAtSize(test, size) > W && ligne) { page.drawText(ligne, { x: M, y, size, font: f, color: rgb(0.08, 0.1, 0.15) }); y -= lh; ligne = w; } else ligne = test; }
    if (ligne) { page.drawText(ligne, { x: M, y, size, font: f, color: rgb(0.08, 0.1, 0.15) }); y -= lh; }
  };
  const saut = (n = 1) => { y -= 15 * n; };
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const monService = b.service || moi?.profils?.services?.libelle || '____________';
  write(nom(user.id), bold); write(`${gl(moi?.profils?.grade)}${b.matricule ? ` · Matricule ${b.matricule}` : ' · Matricule ____________'}`); write(monService); write(b.ville || moi?.profils?.services?.ville || '____________');
  saut(2); write(b.destinataire || 'Monsieur le Directeur'); write('Sous couvert de la voie hiérarchique');
  saut(2); const d = `${b.lieu || '____________'}, le ${date}`; page.drawText(nettoyer(d), { x: 595.28 - M - font.widthOfTextAtSize(nettoyer(d), 11), y, size: 11, font }); y -= 15;
  saut(2); write("Objet : demande de mutation dans le cadre d'une permutation", bold);
  saut(2); write('Monsieur le Directeur,');
  saut(); write(`J'ai l'honneur de solliciter ma mutation vers le service d'affectation actuel de ${autres.map(a => nom(a.profil_id)).join(' et de ')}, dans le cadre d'une permutation${autres.length > 1 ? ' à plusieurs agents' : ''} pour laquelle ${autres.length > 1 ? 'les agents concernés ont donné leur accord et déposent' : "l'agent concerné a donné son accord et dépose"} parallèlement une demande réciproque.`);
  saut(); write(autres.length > 1 ? 'Les agents concernés sont :' : "L'agent concerné est :");
  for (const a of autres) write(`  •  ${nom(a.profil_id)}, ${gl(a.profils?.grade)}, affecté(e) à ${a.profils?.services?.libelle ?? '____________'} (${a.profils?.services?.ville ?? ''})`);
  saut(); write("Cette permutation, souhaitée de part et d'autre, s'effectuerait à grade et corps équivalents et sans création ni suppression de poste. Je me tiens à votre disposition pour tout complément et vous prie de bien vouloir examiner ma demande avec bienveillance.");
  saut(); write("Je vous prie d'agréer, Monsieur le Directeur, l'expression de mon respect.");
  saut(3); write(nom(user.id), bold); saut(2); write('Signature :');
  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="demande-mutation-permutation.pdf"` } });
}
