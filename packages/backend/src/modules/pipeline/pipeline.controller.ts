import { Request, Response, NextFunction } from 'express';
import * as PipelineService from './pipeline.service';
import {
  createPipelineSchema,
  updatePipelineSchema,
  createStageSchema,
  updateStageSchema,
  reorderStagesSchema,
} from './pipeline.schema';

// Pipelines
export async function listPipelines(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await PipelineService.listPipelines(req.user!.tenantId);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getPipeline(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await PipelineService.getPipeline(req.user!.tenantId, req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createPipeline(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPipelineSchema.parse(req.body);
    const data = await PipelineService.createPipeline(req.user!.tenantId, input);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function updatePipeline(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updatePipelineSchema.parse(req.body);
    const data = await PipelineService.updatePipeline(req.user!.tenantId, req.params.id, input);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function deletePipeline(req: Request, res: Response, next: NextFunction) {
  try {
    await PipelineService.deletePipeline(req.user!.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

// Stages
export async function listStages(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await PipelineService.listStages(req.user!.tenantId, req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
}

export async function createStage(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createStageSchema.parse(req.body);
    const data = await PipelineService.createStage(req.user!.tenantId, req.params.id, input);
    res.status(201).json({ data });
  } catch (err) { next(err); }
}

export async function updateStage(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateStageSchema.parse(req.body);
    const data = await PipelineService.updateStage(
      req.user!.tenantId, req.params.id, req.params.stageId, input,
    );
    res.json({ data });
  } catch (err) { next(err); }
}

export async function deleteStage(req: Request, res: Response, next: NextFunction) {
  try {
    await PipelineService.deleteStage(req.user!.tenantId, req.params.id, req.params.stageId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function reorderStages(req: Request, res: Response, next: NextFunction) {
  try {
    const { stageIds } = reorderStagesSchema.parse(req.body);
    await PipelineService.reorderStages(req.user!.tenantId, req.params.id, stageIds);
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}
