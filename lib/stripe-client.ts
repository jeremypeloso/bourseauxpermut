import { stripe } from './stripe';
import { supabaseAdmin } from './supabase-server';

/** Retourne un client Stripe valide pour cet agent : réutilise l'existant s'il existe encore sur ce compte Stripe, sinon en crée un. */
export async function clientStripe(userId: string, email?: string | null) {
  const admin = supabaseAdmin();
  const { data: p } = await admin.from('profils').select('stripe_customer_id').eq('id', userId).single();
  if (p?.stripe_customer_id) {
    try { const c = await stripe().customers.retrieve(p.stripe_customer_id); if (!(c as any).deleted) return p.stripe_customer_id; } catch { /* client d'un autre compte Stripe ou supprimé : on en recrée un */ }
  }
  const c = await stripe().customers.create({ email: email ?? undefined, metadata: { profil_id: userId } });
  await admin.from('profils').update({ stripe_customer_id: c.id }).eq('id', userId);
  return c.id;
}
