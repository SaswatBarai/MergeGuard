import asyncio
import json
import logging

import redis.asyncio as aioredis
from confluent_kafka import Consumer, KafkaError, KafkaException

from src.config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_CONSUMER_GROUP_ID, TOPIC_REVIEW_JOB_REQUESTED, TOPIC_REVIEW_JOB_FEEDBACK
from src.kafka.handlers import handle_review_job_requested, handle_review_job_feedback

logger = logging.getLogger(__name__)

TOPIC_HANDLERS = {
    TOPIC_REVIEW_JOB_REQUESTED: handle_review_job_requested,
    TOPIC_REVIEW_JOB_FEEDBACK: handle_review_job_feedback,
}


def _build_consumer() -> Consumer:
    return Consumer(
        {
            "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
            "group.id": KAFKA_CONSUMER_GROUP_ID,
            "auto.offset.reset": "earliest",
            "enable.auto.commit": True,
        }
    )


async def start_consumer(redis: aioredis.Redis) -> None:
    loop = asyncio.get_event_loop()
    consumer: Consumer = await loop.run_in_executor(None, _build_consumer)
    consumer.subscribe(list(TOPIC_HANDLERS.keys()))
    logger.info("Kafka consumer subscribed to topics: %s", list(TOPIC_HANDLERS.keys()))

    try:
        while True:
            msg = await loop.run_in_executor(None, lambda: consumer.poll(1.0))
            if msg is None:
                await asyncio.sleep(0)
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                raise KafkaException(msg.error())

            topic = msg.topic()
            handler = TOPIC_HANDLERS.get(topic)
            if not handler:
                logger.warning("No handler registered for topic '%s'", topic)
                continue

            try:
                payload = json.loads(msg.value().decode("utf-8"))
                await handler(payload, redis)
            except (json.JSONDecodeError, UnicodeDecodeError) as exc:
                logger.error("Failed to decode message on topic '%s': %s", topic, exc)
    except asyncio.CancelledError:
        logger.info("Kafka consumer loop cancelled")
    finally:
        await loop.run_in_executor(None, consumer.close)
        logger.info("Kafka consumer closed")
