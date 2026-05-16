import { TOPICS } from '@mergeguard/events';
import { kafka, ReviewService } from '../services/review.service.js';
import { sseService } from '../services/sse.service.js';
import { config } from '../config/index.js';

export const setupKafkaConsumer = async () => {
  const consumer = await kafka.getConsumer(config.KAFKA_GROUP_ID);
  await consumer.subscribe({
    topics: [TOPICS.AGENT_PROGRESS, TOPICS.REVIEW_JOB_COMPLETED],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const payload = JSON.parse(message.value.toString());
      const { jobId } = payload;

      console.log(`Received Kafka event: ${topic} for job ${jobId}`);

      if (topic === TOPICS.AGENT_PROGRESS) {
        // 1. Update UI via SSE
        sseService.broadcast(jobId, { type: 'agent_progress', ...payload });

        // 2. If it's a completed agent, save finding count (optional or update status)
        if (payload.status === 'completed' || payload.status === 'failed') {
          await ReviewService.updateJobStatus(jobId, 'IN_PROGRESS');
        }
      }

      if (topic === TOPICS.REVIEW_JOB_COMPLETED) {
        const { status, findings } = payload;

        // 1. Update Database
        await ReviewService.updateJobStatus(jobId, status.toUpperCase());

        // 2. Save Agent Findings & Summary
        if (findings && Array.isArray(findings)) {
          const summaryFinding = findings.find((f: any) => f.agent_name === 'summary');
          if (summaryFinding) {
            await ReviewService.saveFinalReport(jobId, summaryFinding.content);
          }

          const otherFindings = findings.filter((f: any) => f.agent_name !== 'summary');
          if (otherFindings.length > 0) {
            await ReviewService.addAgentResults(jobId, otherFindings);
          }
        }

        // 3. Broadcast final status
        sseService.broadcast(jobId, { type: 'job_completed', status });
      }
    },
  });
};
