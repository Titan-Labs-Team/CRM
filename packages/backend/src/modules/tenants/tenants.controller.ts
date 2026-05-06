import { Request, Response, NextFunction } from 'express';
import * as TenantsService from './tenants.service';

export async function getTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = await TenantsService.getTenant(req.user!.tenantId);
    res.json({ data: tenant });
  } catch (err) {
    next(err);
  }
}

export async function updateTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const input = TenantsService.updateTenantSchema.parse(req.body);
    const tenant = await TenantsService.updateTenant(req.user!.tenantId, input);
    res.json({ data: tenant });
  } catch (err) {
    next(err);
  }
}
