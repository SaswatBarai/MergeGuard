import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Auth Service is running' });
});

app.listen(PORT, () => {
  console.log(`auth-service running on port ${PORT}`);
});
