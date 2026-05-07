import { Request, Response, NextFunction } from 'express';
import * as ActivitiesService from './activities.service';
import { createActivitySchema, updateActivitySchema, listActivitiesQuerySchema } from './activities.schema';

export async function listActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listActivitiesQuerySchema.parse(req.query);
    const result = await ActivitiesService.listActivities(req.user!.tenantId, query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ActivitiesService.getActivity(req.user!.tenantId, req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createActivitySchema.parse(req.body);
    const data = await ActivitiesService.createActivity(req.user!.tenantId, req.user!.id, input);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function updateActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateActivitySchema.parse(req.body);
    const data = await ActivitiesService.updateActivity(req.user!.tenantId, req.params.id, input);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function markDone(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ActivitiesService.markDone(req.user!.tenantId, req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function deleteActivity(req: Request, res: Response, next: NextFunction) {
  try {
    await ActivitiesService.deleteActivity(req.user!.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
