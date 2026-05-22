import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { requireRole } from '../../shared/middleware/requireRole';
import { requireTier } from '../../shared/middleware/requireTier';
import * as ContactsController from './contacts.controller';

const router = Router();

router.post('/import', requireAuth, requireTier('pro'), ContactsController.csvUpload.single('file'), ContactsController.importContacts);
router.post('/import-bulk', requireAuth, ContactsController.importContactsBulk);
router.get('/export', requireAuth, requireTier('pro'), ContactsController.exportContacts);
router.get('/', requireAuth, ContactsController.listContacts);
router.get('/:id', requireAuth, ContactsController.getContact);
router.post('/', requireAuth, ContactsController.createContact);
router.patch('/:id', requireAuth, ContactsController.updateContact);
router.delete('/:id', requireAuth, requireRole('manager', 'admin'), ContactsController.deleteContact);

export default router;
