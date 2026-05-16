import express, { Application } from 'express';
import cors from 'cors';
import reviewRoutes from './routes/review.routes.js';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/reviews', reviewRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'review-service' });
});

export default app;
