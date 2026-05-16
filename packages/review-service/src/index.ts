import 'dotenv/config';
import app from './app.js';
import { config } from './config/index.js';
import { setupKafkaConsumer } from './kafka/consumer.js';

const start = async () => {
  try {
    // Start Kafka Consumer
    await setupKafkaConsumer();
    console.log('Kafka consumer started');

    // Start Server
    app.listen(config.port, () => {
      console.log(`review-service running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start review-service:', error);
    process.exit(1);
  }
};

start();
