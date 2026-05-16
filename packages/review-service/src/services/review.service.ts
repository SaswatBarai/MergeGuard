import { prisma } from '@mergeguard/db';
import { createKafkaManager, TOPICS } from '@mergeguard/events';
import { config } from '../config/index.js';

const kafka = createKafkaManager(config.KAFKA_CLIENT_ID, config.KAFKA_BOOTSTRAP_SERVERS);

export class ReviewService {
  static async createReview(data: {
    prNumber: number;
    repositoryId: number;
    branchName?: string;
    requesterId: number;
    fullRepoName: string;
    githubToken: string;
  }) {
    // 1. Create Job in DB
    const job = await prisma.reviewJob.create({
      data: {
        prNumber: data.prNumber,
        repositoryId: data.repositoryId,
        branchName: data.branchName,
        requesterId: data.requesterId,
        status: 'QUEUED',
      },
    });

    // 2. Publish to Kafka
    await kafka.publish(TOPICS.REVIEW_JOB_REQUESTED, {
      jobId: job.id,
      prNumber: data.prNumber,
      repositoryId: data.repositoryId,
      fullRepoName: data.fullRepoName,
      branchName: data.branchName,
      githubToken: data.githubToken,
    });

    return job;
  }

  static async getReviewById(id: number) {
    return prisma.reviewJob.findUnique({
      where: { id },
      include: { agentResults: true, finalReport: true },
    });
  }

  static async submitFeedback(jobId: number, feedback: string) {
    await kafka.publish(TOPICS.REVIEW_JOB_FEEDBACK, {
      jobId,
      feedback,
    });
    return { status: 'accepted' };
  }

  static async updateJobStatus(jobId: number, status: string) {
    return prisma.reviewJob.update({
      where: { id: jobId },
      data: { status },
    });
  }

  static async saveFinalReport(jobId: number, summary: string) {
    return prisma.finalReport.upsert({
      where: { jobId },
      update: { synthesizedSummary: summary },
      create: { jobId, synthesizedSummary: summary },
    });
  }

  static async addAgentResults(jobId: number, results: any[]) {
    return prisma.agentResult.createMany({
      data: results.map((f) => ({
        jobId,
        agentName: f.agent_name,
        severity: f.severity,
        finding: f.content,
      })),
    });
  }
}

export { kafka };
