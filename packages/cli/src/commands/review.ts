import { Command } from 'commander';
import { input, password, select } from '@inquirer/prompts';
import * as api from '../api.js';
import * as config from '../config.js';
import { ui } from '../utils/ui.js';

export const registerReviewCommands = (program: Command) => {
  program
    .command('review')
    .description('Start an AI code review — guided, no flags needed')
    .action(async () => {
      ui.title('MergeGuard — Start a Review');

      // ── Step 1: resolve the authenticated user ───────────────────────────
      ui.step(1, 4, 'Fetching your account…');
      let me: { id: number; name: string };
      try {
        me = await api.getMe();
        ui.success(`Signed in as ${me.name}`);
      } catch (err: any) {
        ui.error(err.message);
        process.exit(1);
      }

      // ── Step 2: pick a repository ────────────────────────────────────────
      ui.step(2, 4, 'Loading your repositories…');
      let repos: Array<{ id: number; fullName: string; role: string }>;
      try {
        repos = await api.getMyRepositories();
      } catch (err: any) {
        ui.error('Could not load repositories: ' + err.message);
        process.exit(1);
      }

      if (repos.length === 0) {
        ui.warn('No repositories found. Connect a repo via the dashboard first.');
        process.exit(1);
      }

      const repoChoice = await select({
        message: 'Which repository?',
        choices: repos.map((r) => ({
          name: `${r.fullName}  (${r.role})`,
          value: r,
        })),
      });

      // ── Step 3: PR number ────────────────────────────────────────────────
      ui.step(3, 4, 'Pull request details');
      const prInput = await input({
        message: 'PR number',
        validate: (v) => (/^\d+$/.test(v.trim()) && Number(v) > 0) || 'Enter a positive integer',
      });
      const prNumber = Number(prInput.trim());

      // ── Step 4: GitHub token ─────────────────────────────────────────────
      ui.step(4, 4, 'GitHub access token');

      let githubToken: string;
      const storedToken = process.env.GITHUB_TOKEN || config.getGithubToken();

      if (storedToken) {
        ui.success('GitHub token already saved — using stored token.');
        githubToken = storedToken;
      } else {
        githubToken = await password({
          message: 'GitHub personal access token (needs repo read scope)',
          mask: '●',
          validate: (v) => v.trim().length > 5 || 'Token looks too short',
        });
        config.setGithubToken(githubToken.trim());
        ui.dim('Token saved — you won\'t be asked again.');
      }

      // ── Queue the review ─────────────────────────────────────────────────
      ui.divider();
      ui.info(`Queueing review for ${repoChoice.fullName} PR #${prNumber}…`);

      let job: { id: number };
      try {
        job = await api.createReview({
          prNumber,
          repositoryId: repoChoice.id,
          fullRepoName: repoChoice.fullName,
          githubToken: githubToken.trim(),
          requesterId: me.id,
        });
      } catch (err: any) {
        ui.error('Failed to queue review: ' + (err.response?.data?.message ?? err.message));
        process.exit(1);
      }

      ui.success(`Job #${job.id} queued! Connecting to live stream…`);
      console.log(`  View in browser → http://localhost:3004/dashboard/review/${job.id}\n`);

      // ── Live SSE stream ──────────────────────────────────────────────────
      const es = api.getReviewStream(job.id);

      es.onmessage = async (event) => {
        let data: any;
        try { data = JSON.parse(event.data); } catch { return; }

        if (data.type === 'agent_progress') {
          const agent  = data.agentName ?? data.agent ?? 'system';
          const status = data.status ?? '';
          ui.dim(`[${agent}] ${status}`);

          if (status === 'pending_feedback') {
            ui.warn(`\n${agent} needs your feedback to continue.`);
            const feedback = await input({
              message: "Your feedback (or type 'Approve' to continue)",
            });
            await api.submitFeedback(job.id, feedback);
            ui.success('Feedback submitted!');
          }
        }

        if (data.type === 'job_completed') {
          es.close();
          ui.divider();
          ui.success('Review complete!');

          try {
            const finalJob = await api.getReview(job.id);
            const summary  = finalJob.finalReport?.synthesizedSummary;

            if (summary) {
              let parsed: any;
              try { parsed = JSON.parse(summary); } catch { /* plain text */ }

              if (parsed?.executive_summary) {
                ui.title('Final Report');
                ui.kv('Recommendation', parsed.overall_recommendation ?? '—');
                console.log();
                console.log('  ' + parsed.executive_summary);

                if (parsed.critical_blockers?.length) {
                  console.log('\n  Critical blockers:');
                  parsed.critical_blockers.forEach((b: string) => ui.error('  · ' + b));
                }
                if (parsed.important_suggestions?.length) {
                  console.log('\n  Suggestions:');
                  parsed.important_suggestions.forEach((s: string) => ui.warn('  · ' + s));
                }
                if (parsed.minor_notes?.length) {
                  console.log('\n  Notes:');
                  parsed.minor_notes.forEach((n: string) => ui.dim('  · ' + n));
                }
              } else {
                ui.title('Final Report');
                console.log(summary);
              }
            } else {
              ui.warn('No summary was generated.');
            }
          } catch {
            ui.warn('Could not fetch the final report.');
          }

          ui.divider();
          console.log(`  Full report → http://localhost:3004/dashboard/review/${job.id}\n`);
          process.exit(0);
        }
      };

      es.onerror = () => {
        ui.error('Live stream disconnected. Check the review in the dashboard.');
        es.close();
        process.exit(1);
      };
    });
};
