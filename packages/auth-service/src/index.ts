import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/auth', authRoutes);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.listen(config.port, () => {
  console.log(`auth-service running on port ${config.port}`);
});
