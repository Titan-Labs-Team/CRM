import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireTier } from '../../shared/middleware/requireTier';
import { requireRole } from '../../shared/middleware/requireRole';
import * as ctrl from './integrations.controller';

const router = Router();

router.use(requireAuth, requireTier('starter'));

router.get('/', ctrl.list);
router.post('/', requireRole('admin', 'manager'), ctrl.create);
router.patch('/:id', requireRole('admin', 'manager'), ctrl.update);
router.delete('/:id', requireRole('admin', 'manager'), ctrl.remove);
router.post('/:id/test', requireRole('admin', 'manager'), ctrl.test);

export default router;
