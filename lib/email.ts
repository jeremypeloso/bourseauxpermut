import { Resend } from 'resend';

let client: Resend | null = null;
const resend = () => { if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY manquante'); return (client ??= new Resend(process.env.RESEND_API_KEY)); };

/** Mail volontairement neutre : aucune mention de mutation, au cas où l'écran serait visible. */
export async function envoyerCodePro(to: string, code: string) {
  await resend().emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Votre code : ${code}`,
    text: `Bonjour,\n\nVotre code de confirmation est : ${code}\nIl reste valable 7 jours.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\nLa Bourse aux permut'`,
  });
}

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://labourseauxpermut.fr';
const gabarit = (titre: string, texte: string, bouton: string, lien: string) => `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#141A26">
  <p style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1E6BFF;margin:0 0 12px">La Bourse aux permut'</p>
  <h1 style="font-size:22px;margin:0 0 12px;color:#0F1B33">${titre}</h1>
  <p style="font-size:15px;line-height:1.55;margin:0 0 20px">Bonjour,<br><br>${texte}</p>
  <p style="margin:0 0 24px"><a href="${lien}" style="display:inline-block;background:#1E6BFF;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">${bouton}</a></p>
  <p style="font-size:13px;line-height:1.55;color:#6F7789;margin:0">Ce message ne contient volontairement aucun détail. Tout se passe sur le site, après connexion.</p>
  <hr style="border:0;border-top:1px solid #E6E9F0;margin:28px 0 16px"><p style="font-size:12px;color:#A3AAB8;margin:0">La Bourse aux permut' · labourseauxpermut.fr</p></div>`;

/** Nouvelle correspondance trouvée par le matching (mail neutre, sans détail). */
export async function mailCorrespondance(to: string) {
  await resend().emails.send({ from: process.env.EMAIL_FROM!, to, subject: 'Une correspondance est disponible', html: gabarit('Une correspondance est disponible', 'Le rapprochement automatique a trouvé une correspondance avec vos souhaits. Connectez-vous pour la consulter et, si elle vous convient, proposer la mise en relation.', 'Voir mes matchs', `${SITE()}/matchs`) });
}
/** Un collègue a répondu à votre annonce. */
export async function mailReponseAnnonce(to: string) {
  await resend().emails.send({ from: process.env.EMAIL_FROM!, to, subject: 'Quelqu\'un a répondu à votre annonce', html: gabarit('Quelqu\'un a répondu à votre annonce', 'Un collègue vérifié propose une permutation à partir de votre annonce. Connectez-vous pour voir la proposition et y répondre.', 'Voir la proposition', `${SITE()}/matchs`) });
}
/** Tous les agents ont accepté : identités disponibles. */
export async function mailConfirmation(to: string) {
  await resend().emails.send({ from: process.env.EMAIL_FROM!, to, subject: 'Votre mise en relation est confirmée', html: gabarit('Votre mise en relation est confirmée', 'Tous les agents de la correspondance ont accepté. Vous pouvez maintenant voir les identités et prendre contact.', 'Voir les identités', `${SITE()}/matchs`) });
}

/** Un agent du cycle a accepté ; le destinataire n'a pas encore répondu. */
export async function mailAVousDeRepondre(to: string) {
  await resend().emails.send({ from: process.env.EMAIL_FROM!, to, subject: 'Un agent a accepté, à vous de répondre', html: gabarit('Un agent a accepté', 'Un agent de votre correspondance vient d\'accepter la mise en relation. Elle ne se fera que si tous acceptent : connectez-vous pour donner votre réponse.', 'Répondre', `${SITE()}/matchs`) });
}
/** Un agent a refusé : la correspondance est fermée. */
export async function mailCycleFerme(to: string, raison?: string) {
  await resend().emails.send({ from: process.env.EMAIL_FROM!, to, subject: 'Une correspondance s\'est refermée', html: gabarit('Une correspondance s\'est refermée', `Un des agents a décliné${raison ? ` (${raison})` : ''}. Cette correspondance est close, sans suite pour vous. Le rapprochement continue toutes les heures avec vos souhaits.`, 'Voir mes matchs', `${SITE()}/matchs`) });
}
