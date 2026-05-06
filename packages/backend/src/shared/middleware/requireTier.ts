import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';

type Plan = 'free' | 'starter' | 'pro' | 'enterprise';

const TIER_RANK: Record<Plan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export function requireTier(requiredPlan: Plan) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tenant = await db('tenants').where({ id: req.user.tenantId }).first('plan');
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const currentRank = TIER_RANK[tenant.plan as Plan] ?? 0;
    const requiredRank = TIER_RANK[requiredPlan];

    if (currentRank < requiredRank) {
      res.status(402).json({ error: 'upgrade_required', requiredPlan });
      return;
    }

    next();
  };
}
