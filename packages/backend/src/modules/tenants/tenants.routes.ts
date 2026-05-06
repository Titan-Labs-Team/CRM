import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireRole } from '../../shared/middleware/requireRole';
import * as TenantsController from './tenants.controller';

const router = Router();

router.get('/', requireAuth, TenantsController.getTenant);
router.patch('/', requireAuth, requireRole('admin'), TenantsController.updateTenant);

export default router;
