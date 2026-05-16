import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service.js';
import { sseService } from '../services/sse.service.js';

export class ReviewController {
  static async createReview(req: Request, res: Response) {
    const { prNumber, repositoryId, branchName, githubToken, requesterId, fullRepoName } = req.body;

    if (!prNumber || !repositoryId || !githubToken || !requesterId || !fullRepoName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const job = await ReviewService.createReview({
        prNumber,
        repositoryId,
        branchName,
        requesterId,
        fullRepoName,
        githubToken,
      });
      res.status(201).json(job);
    } catch (error) {
      console.error('Failed to create review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getReview(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const job = await ReviewService.getReviewById(parseInt(id));
      if (!job) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }
      res.json(job);
    } catch (error) {
      console.error('Failed to fetch review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async streamReview(req: Request, res: Response) {
    const { id } = req.params;
    const jobId = parseInt(id);

    const client = sseService.addClient(jobId, res);

    req.on('close', () => {
      sseService.removeClient(client);
    });
  }

  static async submitFeedback(req: Request, res: Response) {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback) {
      res.status(400).json({ error: 'Feedback is required' });
      return;
    }

    try {
      const result = await ReviewService.submitFeedback(parseInt(id), feedback);
      res.status(202).json(result);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
