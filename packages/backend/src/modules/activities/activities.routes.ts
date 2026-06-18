import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireTier } from '../../shared/middleware/requireTier';
import * as ActivitiesController from './activities.controller';

const router = Router();

router.get('/export', requireAuth, requireTier('starter'), ActivitiesController.exportActivities);
router.get('/', requireAuth, ActivitiesController.listActivities);
router.post('/', requireAuth, ActivitiesController.createActivity);
router.get('/:id', requireAuth, ActivitiesController.getActivity);
router.patch('/:id', requireAuth, ActivitiesController.updateActivity);
router.patch('/:id/done', requireAuth, ActivitiesController.markDone);
router.delete('/:id', requireAuth, ActivitiesController.deleteActivity);

export default router;
