import express, { Request, Response } from 'express';
import { createKafkaManager, TOPICS, ReviewJobRequestedMessage } from '@mergeguard/events';

const app = express();
const PORT = process.env.PORT || 3002;
const KAFKA_BROKERS = (process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:9092').split(',');

const kafka = createKafkaManager('review-service', KAFKA_BROKERS);

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'review-service' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Review Service is running' });
});

app.post('/review', async (req: Request, res: Response) => {
  const { jobId, prNumber, repositoryId, branchName, githubToken } = req.body as ReviewJobRequestedMessage;

  if (!jobId || !prNumber || !repositoryId || !githubToken) {
    res.status(400).json({ error: 'jobId, prNumber, repositoryId, and githubToken are required' });
    return;
  }

  const message: ReviewJobRequestedMessage = { jobId, prNumber, repositoryId, branchName, githubToken };
  await kafka.publish(TOPICS.REVIEW_JOB_REQUESTED, message);

  res.status(202).json({ status: 'accepted', jobId });
});

app.listen(PORT, () => {
  console.log(`review-service running on port ${PORT}`);
});
