import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config/index.js';
import { verifyJwt } from '../middleware/auth.js';

const router: Router = Router();

// Public Routes
router.use('/auth', createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
}));

// Protected Routes
router.use('/reviews', verifyJwt, createProxyMiddleware({
  target: config.services.review,
  changeOrigin: true,
}));

router.use('/notifications', verifyJwt, createProxyMiddleware({
  target: config.services.notification,
  changeOrigin: true,
}));

export default router;
