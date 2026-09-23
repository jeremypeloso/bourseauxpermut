import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const key = () => Buffer.from(process.env.IDENTITIES_KEY!, 'hex'); // 32 octets

/** AES-256-GCM. Sortie : iv.tag.ciphertext en base64. */
export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64');
}
export function decrypt(b64: string): string {
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.subarray(0, 12), tag = buf.subarray(12, 28), data = buf.subarray(28);
  const d = createDecipheriv('aes-256-gcm', key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString('utf8');
}

/** Empreinte irréversible du matricule (sha256 + poivre serveur). */
export function hashMatricule(matricule: string): string {
  return createHash('sha256').update(matricule.replace(/\s+/g, '').toUpperCase() + process.env.MATRICULE_PEPPER!).digest('hex');
}
export function hashCode(code: string): string {
  return createHash('sha256').update(code + process.env.MATRICULE_PEPPER!).digest('hex');
}
