import { currentUser } from './supabase-server';
/** Admins : liste d'emails dans ADMIN_EMAILS (séparés par des virgules). */
export const ADMINS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
export const estAdmin = (email?: string | null) => !!email && ADMINS.includes(email.toLowerCase());
export async function adminRequis() { const u = await currentUser(); return u && estAdmin(u.email) ? u : null; }
