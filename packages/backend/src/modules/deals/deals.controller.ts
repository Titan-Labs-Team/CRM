import { Request, Response, NextFunction } from 'express';
import * as DealsService from './deals.service';
import {
  createDealSchema,
  updateDealSchema,
  moveDealSchema,
  lostDealSchema,
  reorderDealsSchema,
  listDealsQuerySchema,
} from './deals.schema';

export async function getKanban(req: Request, res: Response, next: NextFunction) {
  try {
    const pipelineId = req.query.pipeline as string;
    if (!pipelineId) { res.status(400).json({ error: 'pipeline query param required' }); return; }
    const data = await DealsService.getKanban(req.user!.tenantId, pipelineId);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function listDeals(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listDealsQuerySchema.parse(req.query);
    const result = await DealsService.listDeals(req.user!.tenantId, query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getDeal(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await DealsService.getDeal(req.user!.tenantId, req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createDeal(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createDealSchema.parse(req.body);
    const data = await DealsService.createDeal(req.user!.tenantId, req.user!.id, input);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function updateDeal(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateDealSchema.parse(req.body);
    const data = await DealsService.updateDeal(req.user!.tenantId, req.params.id, input);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function moveDeal(req: Request, res: Response, next: NextFunction) {
  try {
    const { stageId, position } = moveDealSchema.parse(req.body);
    const data = await DealsService.moveDeal(
      req.user!.tenantId, req.user!.id, req.params.id, stageId, position,
    );
    res.json({ data });
  } catch (err) { next(err); }
}

export async function markWon(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await DealsService.markWon(req.user!.tenantId, req.user!.id, req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function markLost(req: Request, res: Response, next: NextFunction) {
  try {
    const { lostReason } = lostDealSchema.parse(req.body);
    const data = await DealsService.markLost(
      req.user!.tenantId, req.user!.id, req.params.id, lostReason,
    );
    res.json({ data });
  } catch (err) { next(err); }
}

export async function reorderDeals(req: Request, res: Response, next: NextFunction) {
  try {
    const { stageId, dealIds } = reorderDealsSchema.parse(req.body);
    await DealsService.reorderDeals(req.user!.tenantId, stageId, dealIds);
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}

export async function deleteDeal(req: Request, res: Response, next: NextFunction) {
  try {
    await DealsService.deleteDeal(req.user!.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
