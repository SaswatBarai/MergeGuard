import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-me',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    review: process.env.REVIEW_SERVICE_URL || 'http://review-service:3002',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3003',
  },
};
