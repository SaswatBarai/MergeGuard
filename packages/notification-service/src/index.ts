import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Notification Service is running' });
});

app.listen(PORT, () => {
  console.log(`notification-service running on port ${PORT}`);
});
