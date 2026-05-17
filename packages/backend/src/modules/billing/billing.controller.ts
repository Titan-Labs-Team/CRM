import { Request, Response, NextFunction } from 'express';
import * as billingService from './billing.service';

export async function getSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.getSubscription(req.user!.tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createCheckoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { plan } = req.body as { plan: 'starter' | 'pro' };
    if (!plan || !['starter', 'pro'].includes(plan)) {
      res.status(422).json({ error: 'plan must be starter or pro' });
      return;
    }
    const data = await billingService.createCheckoutSession(req.user!.tenantId, plan);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createPortalSession(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await billingService.createPortalSession(req.user!.tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const data = await billingService.handleWebhook(req.body as Buffer, signature);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
