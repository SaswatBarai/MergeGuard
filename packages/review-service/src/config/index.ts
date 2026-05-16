import 'dotenv/config';

export const config = {
  PORT: process.env.PORT || 3002,
  KAFKA_BOOTSTRAP_SERVERS: (process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:9092').split(','),
  KAFKA_CLIENT_ID: 'review-service',
  KAFKA_GROUP_ID: 'review-service-group',
};
