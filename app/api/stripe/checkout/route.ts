import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: p } = await admin.from('profils').select('stripe_customer_id').eq('id', user.id).single();
  let customer = p?.stripe_customer_id;
  if (!customer) {
    const c = await stripe().customers.create({ email: user.email ?? undefined, metadata: { profil_id: user.id } });
    customer = c.id;
    await admin.from('profils').update({ stripe_customer_id: customer }).eq('id', user.id);
  }
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription', customer,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/annonces?premium=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/annonces`,
    metadata: { profil_id: user.id }, locale: 'fr',
  });
  return NextResponse.json({ url: session.url });
}
