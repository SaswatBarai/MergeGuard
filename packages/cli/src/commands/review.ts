import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import * as api from '../api.js';
import { ui } from '../utils/ui.js';

export const registerReviewCommands = (program: Command) => {
  program
    .command('review')
    .description('Trigger a new AI Code Review and watch its progress live')
    .requiredOption('--pr <number>', 'Pull Request Number', parseInt)
    .requiredOption('--repo-id <number>', 'Repository ID', parseInt)
    .requiredOption('--full-name <string>', 'Repository Full Name (e.g., owner/repo)')
    .option('--github-token <string>', 'GitHub Token (defaults to GITHUB_TOKEN env var)', process.env.GITHUB_TOKEN)
    .requiredOption('--requester-id <number>', 'Requester User ID', parseInt)
    .action(async (options) => {
      const { pr, repoId, fullName, githubToken, requesterId } = options;

      if (!githubToken) {
        ui.error('Error: GitHub Token is required. Use --github-token or set GITHUB_TOKEN env var.');
        process.exit(1);
      }

      try {
        ui.info(`Queueing Review for PR #${pr}...`);
        const job = await api.createReview({
          prNumber: pr,
          repositoryId: repoId,
          fullRepoName: fullName,
          githubToken,
          requesterId,
        });

        const jobId = job.id;
        ui.success(`Job #${jobId} successfully queued!`);

        ui.info('Connecting to live stream...');
        const es = api.getReviewStream(jobId);

        es.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'agent_progress') {
            const agent = data.agent || 'System';
            const status = data.status || '';
            ui.dim(`[${agent}] ${status}...`);

            if (status === 'pending_feedback') {
              ui.warn(`\nAgent ${agent} is waiting for your feedback!`);
              const feedback = await input({
                message: "Please provide your feedback (or type 'Approve' to continue)",
              });
              await api.submitFeedback(jobId, feedback);
              ui.success('Feedback submitted!');
            }
          }

          if (data.type === 'job_completed') {
            ui.success('\nReview completed!');
            es.close();
            
            ui.info('Fetching final report...');
            const finalJob = await api.getReview(jobId);
            const report = finalJob.finalReport;

            if (report?.synthesizedSummary) {
              ui.divider();
              ui.title('Final AI Review Report');
              console.log(report.synthesizedSummary);
              ui.divider();
            } else {
              ui.warn('No summary was generated.');
            }
          }
        };

        es.onerror = (err) => {
          ui.error(`SSE Stream Error: ${JSON.stringify(err)}`);
          es.close();
        };

      } catch (error: any) {
        ui.error(`Error: ${error.message || error}`);
        process.exit(1);
      }
    });
};
