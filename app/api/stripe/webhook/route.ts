import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  const admin = supabaseAdmin();
  const majPremium = async (customer: string, fin: number | null) => {
    await admin.from('profils').update({ premium_jusqua: fin ? new Date(fin * 1000).toISOString() : null }).eq('stripe_customer_id', customer);
  };
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const s = event.data.object as Stripe.Subscription;
      const actif = ['active', 'trialing', 'past_due'].includes(s.status);
      await majPremium(s.customer as string, actif ? s.current_period_end : null);
      break;
    }
    case 'customer.subscription.deleted': {
      const s = event.data.object as Stripe.Subscription;
      await majPremium(s.customer as string, null);
      break;
    }
  }
  return NextResponse.json({ received: true });
}
