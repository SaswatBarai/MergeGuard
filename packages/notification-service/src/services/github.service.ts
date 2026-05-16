import { Octokit } from '@octokit/rest';
import { config } from '../config/index.js';

export class GithubService {
  static async postComment(repoFullName: string, prNumber: number, comment: string, token?: string) {
    const octokit = new Octokit({
      auth: token || config.githubToken,
    });

    const [owner, repo] = repoFullName.split('/');

    try {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
      });
      console.log(`GitHub comment posted to ${repoFullName} PR #${prNumber}`);
    } catch (error) {
      console.error(`Failed to post GitHub comment to ${repoFullName} PR #${prNumber}:`, error);
    }
  }
}
