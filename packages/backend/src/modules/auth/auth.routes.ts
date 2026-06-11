import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/requireAuth';
import * as AuthController from './auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.patch('/me', requireAuth, AuthController.updateMe);
router.get('/workspaces', requireAuth, AuthController.listWorkspaces);
router.post('/switch-workspace', requireAuth, AuthController.switchWorkspace);

export default router;
