import { Request, Response, NextFunction } from 'express';
import * as ReportsService from './reports.service';

export async function getActivitiesReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ReportsService.getActivitiesReport(req.user!.tenantId, {
      userId: req.query.user as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ReportsService.getLeaderboard(req.user!.tenantId, {
      pipelineId: req.query.pipeline as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getKpis(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ReportsService.getKpis(req.user!.tenantId);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getFunnel(req: Request, res: Response, next: NextFunction) {
  try {
    const pipelineId = req.query.pipeline as string | undefined;
    const data = await ReportsService.getFunnel(req.user!.tenantId, pipelineId);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getRevenue(req: Request, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as 'week' | 'month' | undefined) ?? 'month';
    const data = await ReportsService.getRevenue(req.user!.tenantId, period);
    res.json({ data });
  } catch (err) { next(err); }
}
