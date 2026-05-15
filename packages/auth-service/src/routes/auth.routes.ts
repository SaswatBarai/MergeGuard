import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

// OAuth Routes
router.get('/github', AuthController.githubLogin);
router.get('/github/callback', AuthController.githubCallback);

// API Key Routes (Protected)
router.post('/api-keys', verifyToken as any, AuthController.createApiKey as any);
router.get('/api-keys', verifyToken as any, AuthController.listApiKeys as any);
router.delete('/api-keys/:id', verifyToken as any, AuthController.revokeApiKey as any);

export default router;
