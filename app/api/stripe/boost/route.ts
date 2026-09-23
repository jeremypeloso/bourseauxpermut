import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Mise en avant à l'unité : 7 jours, paiement unique (STRIPE_BOOST_PRICE_ID). */
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: a } = await admin.from('annonces').select('id').eq('profil_id', user.id).eq('statut', 'active').maybeSingle();
  if (!a) return NextResponse.json({ ok: false, message: 'Publiez d\'abord votre annonce.' }, { status: 400 });
  const { data: p } = await admin.from('profils').select('stripe_customer_id').eq('id', user.id).single();
  let customer = p?.stripe_customer_id;
  if (!customer) { const c = await stripe.customers.create({ email: user.email ?? undefined, metadata: { profil_id: user.id } }); customer = c.id; await admin.from('profils').update({ stripe_customer_id: customer }).eq('id', user.id); }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', customer, line_items: [{ price: process.env.STRIPE_BOOST_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/annonces?boost=1`, cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/annonces`,
    metadata: { profil_id: user.id, type: 'boost', annonce_id: a.id }, locale: 'fr',
  });
  return NextResponse.json({ url: session.url });
}
