import Stripe from 'stripe';
/** Instancié à la demande : le build ne doit pas dépendre de la présence de la clé. */
let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY manquante');
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY));
}
