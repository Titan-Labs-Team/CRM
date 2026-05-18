import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { list, unreadCount, read, readAll } from './notifications.controller';

const router = Router();

router.get('/', requireAuth, list);
router.get('/unread-count', requireAuth, unreadCount);
router.patch('/:id/read', requireAuth, read);
router.post('/read-all', requireAuth, readAll);

export default router;
