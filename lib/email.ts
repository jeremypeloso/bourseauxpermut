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
