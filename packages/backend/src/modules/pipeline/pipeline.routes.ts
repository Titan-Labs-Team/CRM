import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireRole } from '../../shared/middleware/requireRole';
import * as PipelineController from './pipeline.controller';

const router = Router();

router.get('/', requireAuth, PipelineController.listPipelines);
router.post('/', requireAuth, requireRole('manager', 'admin'), PipelineController.createPipeline);
router.get('/:id', requireAuth, PipelineController.getPipeline);
router.patch('/:id', requireAuth, requireRole('manager', 'admin'), PipelineController.updatePipeline);
router.delete('/:id', requireAuth, requireRole('admin'), PipelineController.deletePipeline);

router.get('/:id/stages', requireAuth, PipelineController.listStages);
router.post('/:id/stages', requireAuth, requireRole('manager', 'admin'), PipelineController.createStage);
router.post('/:id/stages/reorder', requireAuth, requireRole('manager', 'admin'), PipelineController.reorderStages);
router.patch('/:id/stages/:stageId', requireAuth, requireRole('manager', 'admin'), PipelineController.updateStage);
router.delete('/:id/stages/:stageId', requireAuth, requireRole('manager', 'admin'), PipelineController.deleteStage);

export default router;
