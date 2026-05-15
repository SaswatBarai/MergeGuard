import express, { Request, Response } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { config } from './config/index.js';
import proxyRoutes from './routes/proxy.js';

const app = express();

// 1. Global Middleware
app.use(cors());
// We don't use express.json() globally here because it can interfere with proxying 
// large payloads/multipart data to downstream services. 
// Downstream services will handle their own body parsing.

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// 3. Health Check (Directly on Gateway)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// 4. Proxy Routes
app.use('/', proxyRoutes);

app.listen(config.port, () => {
  console.log(`api-gateway running on port ${config.port}`);
});
