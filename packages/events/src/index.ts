import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';

export const TOPICS = {
  REVIEW_JOB_REQUESTED: 'review-job-requested',
  REVIEW_JOB_FEEDBACK: 'review-job-feedback',
  REVIEW_JOB_COMPLETED: 'review-completed',
  AGENT_PROGRESS: 'agent-progress',
};

export interface ReviewJobRequestedMessage {
  jobId: number;
  prNumber: number;
  repositoryId: number;
  fullRepoName: string; // e.g., 'owner/repo'
  branchName?: string;
  githubToken: string;
}

export class KafkaManager {
  private kafka: Kafka;
  private producer?: Producer;
  private consumer?: Consumer;

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka(config);
  }

  async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }
    return this.producer;
  }

  async getConsumer(groupId: string): Promise<Consumer> {
    if (!this.consumer) {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
    }
    return this.consumer;
  }

  async publish(topic: string, message: any) {
    const producer = await this.getProducer();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async disconnect() {
    if (this.producer) await this.producer.disconnect();
    if (this.consumer) await this.consumer.disconnect();
  }
}

// Default instance for local dev
export const createKafkaManager = (clientId: string, brokers: string[]) => {
  return new KafkaManager({
    clientId,
    brokers,
  });
};
