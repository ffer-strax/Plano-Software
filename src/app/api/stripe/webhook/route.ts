import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Use service role client to bypass RLS for webhook updates
  const supabase = createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription as string;

    if (!userId) {
      console.error('No userId in session metadata');
      return NextResponse.json({ error: 'No userId in session metadata' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const priceId = subscription.items.data[0].price.id;
    
    const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'studio';

    const { error } = await supabase.from('subscriptions').upsert({
      architect_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      plan,
      status: 'active',
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'architect_id' });

    if (error) {
      console.error('Error upserting subscription:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any;
    const { error } = await supabase
      .from('subscriptions')
      .update({ plan: 'free', status: 'canceled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription status on delete:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  if (event.type === 'customer.subscription.updated') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any;
    const priceId = subscription.items.data[0].price.id;
    const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'studio';

    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_price_id: priceId,
        plan,
        status: subscription.status,
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription on update event:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
