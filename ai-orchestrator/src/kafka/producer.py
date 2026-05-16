import json
import logging
from confluent_kafka import Producer
from src.config import KAFKA_BOOTSTRAP_SERVERS

logger = logging.getLogger(__name__)

class KafkaProducer:
    def __init__(self):
        self.producer = Producer({
            "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
        })

    def delivery_report(self, err, msg):
        if err is not None:
            logger.error("Message delivery failed: %s", err)
        else:
            logger.info("Message delivered to %s [%s]", msg.topic(), msg.partition())

    def publish(self, topic: str, payload: dict):
        try:
            self.producer.produce(
                topic,
                json.dumps(payload).encode("utf-8"),
                callback=self.delivery_report
            )
            self.producer.flush()
        except Exception as exc:
            logger.error("Failed to publish message to topic %s: %s", topic, exc)

# Singleton instance
kafka_producer = KafkaProducer()
