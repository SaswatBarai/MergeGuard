import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import { config } from './config/index.js';
import { setupKafkaConsumer } from './kafka/consumer.js';

const app: Application = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

const start = async () => {
  try {
    await setupKafkaConsumer();
    console.log('Kafka consumer started for notifications');

    app.listen(config.port, () => {
      console.log(`notification-service running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start notification-service:', error);
    process.exit(1);
  }
};

start();
