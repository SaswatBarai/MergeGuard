import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3003,
  kafka: {
    bootstrapServers: (process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:9092').split(','),
    clientId: 'notification-service',
    groupId: 'notification-service-group',
  },
  githubToken: process.env.GITHUB_TOKEN,
  resendApiKey: process.env.RESEND_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3004',
};
