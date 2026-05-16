import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resendApiKey);

export class EmailService {
  static async sendReviewSummary(email: string, jobId: number, status: string, summary: string) {
    if (!config.resendApiKey) {
      console.warn('Resend API Key is missing. Skipping email notification.');
      return;
    }

    try {
      await resend.emails.send({
        from: 'MergeGuard <onboarding@resend.dev>', // Should be a verified domain in production
        to: email,
        subject: `[MergeGuard] Review #${jobId} - ${status.toUpperCase()}`,
        html: `
          <h1>Review Summary for Job #${jobId}</h1>
          <p>Status: <strong>${status.toUpperCase()}</strong></p>
          <hr />
          <div>${summary.replace(/\n/g, '<br />')}</div>
          <hr />
          <p>View the full report on your <a href="${config.frontendUrl}/reviews/${jobId}">MergeGuard Dashboard</a>.</p>
        `,
      });
      console.log(`Email notification sent to ${email} for job ${jobId}`);
    } catch (error) {
      console.error(`Failed to send email to ${email} for job ${jobId}:`, error);
    }
  }
}
