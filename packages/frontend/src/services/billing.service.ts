import { api } from './api';

export interface Subscription {
  id: string;
  stripe_subscription_id: string | null;
  status: string;
  plan: string;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
}

export interface BillingInfo {
  plan: string;
  maxUsers: number;
  stripeCustomerId: string | null;
  subscription: Subscription | null;
}

export const billingService = {
  getSubscription: () =>
    api.get('/billing/subscription').then((r) => r.data.data as BillingInfo),
  createCheckoutSession: (plan: 'starter' | 'pro') =>
    api.post('/billing/checkout', { plan }).then((r) => r.data.data as { url: string }),
  createPortalSession: () =>
    api.post('/billing/portal').then((r) => r.data.data as { url: string }),
};
