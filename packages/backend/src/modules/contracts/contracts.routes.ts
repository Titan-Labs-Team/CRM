import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import * as ContractsController from './contracts.controller';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, ContractsController.listContracts);
router.post('/', requireAuth, ContractsController.contractUpload.single('file'), ContractsController.uploadContract);
router.get('/:contractId/download', requireAuth, ContractsController.downloadContract);
router.delete('/:contractId', requireAuth, ContractsController.deleteContract);

export default router;
