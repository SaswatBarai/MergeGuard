import { createKafkaManager, TOPICS } from '@mergeguard/events';
import { prisma } from '@mergeguard/db';
import { config } from '../config/index.js';
import { SlackService } from '../services/slack.service.js';
import { GithubService } from '../services/github.service.js';
import { EmailService } from '../services/email.service.js';

const kafka = createKafkaManager(config.kafka.clientId, config.kafka.bootstrapServers);

export const setupKafkaConsumer = async () => {
  const consumer = await kafka.getConsumer(config.kafka.groupId);
  await consumer.subscribe({ topics: [TOPICS.REVIEW_JOB_COMPLETED], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const payload = JSON.parse(message.value.toString());
      const { jobId, status, findings } = payload;

      console.log(`Received Kafka event: ${topic} for job ${jobId}`);

      if (topic === TOPICS.REVIEW_JOB_COMPLETED) {
        try {
          // 1. Fetch Job and User preferences
          const job = await prisma.reviewJob.findUnique({
            where: { id: jobId },
            include: {
              repository: true,
              requester: {
                include: {
                  notificationConfigs: true,
                },
              },
            },
          });

          if (!job) {
            console.error(`Job ${jobId} not found for notifications`);
            return;
          }

          const summary = findings?.find((f: any) => f.agent_name === 'summary')?.content || 'Review completed with no summary.';
          const repoFullName = job.repository.fullName;
          const prNumber = job.prNumber;
          const userEmail = job.requester.email;

          // 2. Send Slack Notifications
          const slackConfigs = job.requester.notificationConfigs.filter(c => c.type === 'SLACK' && c.isEnabled);
          for (const conf of slackConfigs) {
            await SlackService.sendNotification(conf.webhookUrl, summary, jobId, status);
          }

          // 3. Send GitHub Comment
          const githubConfigs = job.requester.notificationConfigs.filter(c => c.type === 'GITHUB_COMMENT' && c.isEnabled);
          if (githubConfigs.length > 0) {
            await GithubService.postComment(repoFullName, prNumber, summary);
          }

          // 4. Send Email Notifications
          const emailConfigs = job.requester.notificationConfigs.filter(c => c.type === 'EMAIL' && c.isEnabled);
          if (emailConfigs.length > 0) {
            // Send to the primary email or the one specified in webhookUrl (if used as an email override)
            const targetEmail = emailConfigs[0].webhookUrl || userEmail;
            await EmailService.sendReviewSummary(targetEmail, jobId, status, summary);
          }

        } catch (error) {
          console.error(`Error processing notifications for job ${jobId}:`, error);
        }
      }
    },
  });
};
