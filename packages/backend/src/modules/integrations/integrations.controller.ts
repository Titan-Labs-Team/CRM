import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as integrationsService from './integrations.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await integrationsService.listIntegrations(req.user!.tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = integrationsService.integrationSchema.parse(req.body);
    const data = await integrationsService.createIntegration(req.user!.tenantId, input);
    res.status(201).json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: 'Validation error', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = integrationsService.updateIntegrationSchema.parse(req.body);
    const data = await integrationsService.updateIntegration(req.user!.tenantId, req.params.id, input);
    res.json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: 'Validation error', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await integrationsService.deleteIntegration(req.user!.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function test(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await integrationsService.testIntegration(req.user!.tenantId, req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
