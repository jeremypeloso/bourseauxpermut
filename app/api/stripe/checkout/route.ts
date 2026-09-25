import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { clientStripe } from '@/lib/stripe-client';
import { currentUser, supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST() {
  try {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'non connecté' }, { status: 401 });
  const admin = supabaseAdmin();
  const customer = await clientStripe(user.id, user.email);
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription', customer,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/annonces?premium=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/annonces`,
    metadata: { profil_id: user.id }, locale: 'fr',
  });
  return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('stripe', e?.message);
    return NextResponse.json({ ok: false, message: `Paiement indisponible : ${e?.raw?.message ?? e?.message ?? 'erreur Stripe'}` }, { status: 500 });
  }
}
