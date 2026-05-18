import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import { search } from './search.controller';

const router = Router();

router.get('/', requireAuth, search);

export default router;
