import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireRole } from '../../shared/middleware/requireRole';
import * as DealsController from './deals.controller';

const router = Router();

router.get('/kanban', requireAuth, DealsController.getKanban);
router.post('/reorder', requireAuth, DealsController.reorderDeals);
router.get('/', requireAuth, DealsController.listDeals);
router.post('/', requireAuth, DealsController.createDeal);
router.get('/:id', requireAuth, DealsController.getDeal);
router.patch('/:id', requireAuth, DealsController.updateDeal);
router.delete('/:id', requireAuth, requireRole('manager', 'admin'), DealsController.deleteDeal);
router.patch('/:id/stage', requireAuth, DealsController.moveDeal);
router.patch('/:id/won', requireAuth, DealsController.markWon);
router.patch('/:id/lost', requireAuth, DealsController.markLost);

export default router;
