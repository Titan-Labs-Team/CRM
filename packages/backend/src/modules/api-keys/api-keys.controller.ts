import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as apiKeysService from './api-keys.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await apiKeysService.listApiKeys(req.user!.tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = apiKeysService.createApiKeySchema.parse(req.body);
    const data = await apiKeysService.createApiKey(req.user!.tenantId, input);
    res.status(201).json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: 'Validation error', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function revoke(req: Request, res: Response, next: NextFunction) {
  try {
    await apiKeysService.revokeApiKey(req.user!.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
