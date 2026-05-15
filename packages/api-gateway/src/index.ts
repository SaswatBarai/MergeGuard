import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Gateway is running' });
});

app.listen(PORT, () => {
  console.log(`api-gateway running on port ${PORT}`);
});
