import Stripe from 'stripe';
import { db } from '../../db';
import { env } from '../../config/env';

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  starter: env.STRIPE_PRICE_STARTER,
  pro: env.STRIPE_PRICE_PRO,
};

export async function getSubscription(tenantId: string) {
  const tenant = await db('tenants').where({ id: tenantId }).first();
  if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });

  const subscription = await db('subscriptions')
    .where({ tenant_id: tenantId })
    .orderBy('created_at', 'desc')
    .first();

  return {
    plan: tenant.plan as string,
    maxUsers: tenant.max_users as number,
    stripeCustomerId: tenant.stripe_customer_id as string | null,
    subscription: subscription ?? null,
  };
}

export async function createCheckoutSession(tenantId: string, plan: 'starter' | 'pro') {
  if (!stripe) throw Object.assign(new Error('Stripe not configured'), { status: 503 });

  const priceId = PLAN_PRICE_MAP[plan];
  if (!priceId) throw Object.assign(new Error(`Price not configured for plan: ${plan}`), { status: 503 });

  const tenant = await db('tenants').where({ id: tenantId }).first();
  if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });

  let customerId = tenant.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: tenant.name as string,
      metadata: { tenant_id: tenantId },
    });
    customerId = customer.id;
    await db('tenants').where({ id: tenantId }).update({
      stripe_customer_id: customerId,
      updated_at: new Date(),
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.FRONTEND_URL}/settings?billing=success`,
    cancel_url: `${env.FRONTEND_URL}/settings?billing=cancel`,
    metadata: { tenant_id: tenantId, plan },
  });

  return { url: session.url };
}

export async function createPortalSession(tenantId: string) {
  if (!stripe) throw Object.assign(new Error('Stripe not configured'), { status: 503 });

  const tenant = await db('tenants').where({ id: tenantId }).first();
  if (!tenant?.stripe_customer_id) {
    throw Object.assign(new Error('No active subscription found'), { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id as string,
    return_url: `${env.FRONTEND_URL}/settings`,
  });

  return { url: session.url };
}

const PLAN_MAX_USERS: Record<string, number> = {
  free: 3,
  starter: 10,
  pro: 50,
  enterprise: 999,
};

export async function handleWebhook(payload: Buffer, signature: string) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    throw Object.assign(new Error('Stripe not configured'), { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw Object.assign(new Error('Invalid webhook signature'), { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenant_id;
      const plan = session.metadata?.plan;
      if (!tenantId || !plan) break;

      await db('tenants').where({ id: tenantId }).update({
        plan,
        max_users: PLAN_MAX_USERS[plan] ?? 3,
        stripe_customer_id: session.customer as string,
        updated_at: new Date(),
      });

      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await db('subscriptions')
          .insert({
            tenant_id: tenantId,
            stripe_subscription_id: sub.id,
            stripe_customer_id: session.customer as string,
            status: sub.status,
            plan,
            current_period_start: new Date((sub as any).current_period_start * 1000),
            current_period_end: new Date((sub as any).current_period_end * 1000),
          })
          .onConflict('stripe_subscription_id')
          .merge();
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const tenantId = sub.metadata?.tenant_id;

      const existing = await db('subscriptions')
        .where({ stripe_subscription_id: sub.id })
        .first('tenant_id');
      const resolvedTenantId = tenantId ?? existing?.tenant_id;
      if (!resolvedTenantId) break;

      const plan = (sub.items.data[0]?.price?.metadata?.plan as string) ?? 'free';
      const isActive = sub.status === 'active';

      await db('subscriptions')
        .where({ stripe_subscription_id: sub.id })
        .update({
          status: sub.status,
          current_period_start: new Date((sub as any).current_period_start * 1000),
          current_period_end: new Date((sub as any).current_period_end * 1000),
          updated_at: new Date(),
        });

      if (isActive) {
        await db('tenants').where({ id: resolvedTenantId }).update({
          plan,
          max_users: PLAN_MAX_USERS[plan] ?? 3,
          updated_at: new Date(),
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await db('subscriptions')
        .where({ stripe_subscription_id: sub.id })
        .first('tenant_id');
      if (!existing) break;

      await db('subscriptions')
        .where({ stripe_subscription_id: sub.id })
        .update({ status: 'canceled', canceled_at: new Date(), updated_at: new Date() });

      await db('tenants').where({ id: existing.tenant_id }).update({
        plan: 'free',
        max_users: 3,
        updated_at: new Date(),
      });
      break;
    }
  }

  return { received: true };
}
