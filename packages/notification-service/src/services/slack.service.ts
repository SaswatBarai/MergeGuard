import axios from 'axios';

export class SlackService {
  static async sendNotification(webhookUrl: string, message: string, jobId: number, status: string) {
    const color = status === 'completed' ? '#36a64f' : '#ff0000';
    const payload = {
      attachments: [
        {
          fallback: `Review Job #${jobId} ${status}`,
          color: color,
          title: `MergeGuard Review: Job #${jobId}`,
          text: message,
          fields: [
            {
              title: 'Status',
              value: status.toUpperCase(),
              short: true,
            },
          ],
          footer: 'MergeGuard AI',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      await axios.post(webhookUrl, payload);
      console.log(`Slack notification sent for job ${jobId}`);
    } catch (error) {
      console.error(`Failed to send Slack notification for job ${jobId}:`, error);
    }
  }
}
