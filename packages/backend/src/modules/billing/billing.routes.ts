import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireRole } from '../../shared/middleware/requireRole';
import * as billing from './billing.controller';

const router = Router();

// Raw body is applied at server level before express.json() for this path
router.post('/webhook', billing.handleWebhook);

router.use(requireAuth);

router.get('/subscription', billing.getSubscription);
router.post('/checkout', requireRole('admin'), billing.createCheckoutSession);
router.post('/portal', requireRole('admin'), billing.createPortalSession);

export default router;
