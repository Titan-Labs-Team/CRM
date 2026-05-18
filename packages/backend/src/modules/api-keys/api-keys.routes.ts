import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireTier } from '../../shared/middleware/requireTier';
import { requireRole } from '../../shared/middleware/requireRole';
import * as ctrl from './api-keys.controller';

const router = Router();

router.use(requireAuth, requireTier('starter'));

router.get('/', ctrl.list);
router.post('/', requireRole('admin'), ctrl.create);
router.delete('/:id', requireRole('admin'), ctrl.revoke);

export default router;
