import { Router, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import http from 'http';
import { config } from '../config/index.js';
import { verifyJwt } from '../middleware/auth.js';

const router: Router = Router();

// Express strips the matched prefix before passing to proxy middleware.
// pathRewrite adds it back so downstream services receive the full path.

router.use('/auth', createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: { '^': '/auth' },
}));

// SSE stream endpoint — bypass http-proxy-middleware (it buffers SSE).
// Pipe the upstream response directly back to the client.
router.get('/reviews/:id/stream', verifyJwt, (req: Request, res: Response) => {
  const upstreamUrl = new URL(`${config.services.review}/reviews/${req.params.id}/stream`);
  const options = {
    hostname: upstreamUrl.hostname,
    port: upstreamUrl.port || 80,
    path: upstreamUrl.pathname,
    headers: { Accept: 'text/event-stream' },
  };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const upstream = http.get(options, (upstreamRes) => {
    upstreamRes.pipe(res, { end: true });
  });

  upstream.on('error', (err) => {
    console.error('[sse-proxy] upstream error:', err.message);
    res.end();
  });

  req.on('close', () => upstream.destroy());
});

router.use('/reviews', verifyJwt, createProxyMiddleware({
  target: config.services.review,
  changeOrigin: true,
  pathRewrite: { '^': '/reviews' },
}));

router.use('/notifications', verifyJwt, createProxyMiddleware({
  target: config.services.notification,
  changeOrigin: true,
  pathRewrite: { '^': '/notifications' },
}));

export default router;
