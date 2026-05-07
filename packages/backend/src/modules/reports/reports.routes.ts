import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import * as ReportsController from './reports.controller';

const router = Router();

router.get('/kpis', requireAuth, ReportsController.getKpis);
router.get('/funnel', requireAuth, ReportsController.getFunnel);
router.get('/revenue', requireAuth, ReportsController.getRevenue);

export default router;
