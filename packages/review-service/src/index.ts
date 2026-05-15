import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'review-service' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Review Service is running' });
});

app.listen(PORT, () => {
  console.log(`review-service running on port ${PORT}`);
});
