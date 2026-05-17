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
    
    # Retry logic for building the consumer
    consumer = None
    while consumer is None:
        try:
            consumer = await loop.run_in_executor(None, _build_consumer)
        except Exception as e:
            logger.error("Failed to build Kafka consumer: %s. Retrying in 5s...", e)
            await asyncio.sleep(5)

    consumer.subscribe(list(TOPIC_HANDLERS.keys()))
    logger.info("Kafka consumer subscribed to topics: %s", list(TOPIC_HANDLERS.keys()))

    try:
        while True:
            try:
                msg = await loop.run_in_executor(None, lambda: consumer.poll(1.0))
                if msg is None:
                    await asyncio.sleep(0)
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    logger.error("Kafka error: %s", msg.error())
                    # If it's a fatal error, we might want to break or continue after a sleep
                    await asyncio.sleep(2)
                    continue

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
                except Exception as exc:
                    logger.error("Handler error on topic '%s': %s", topic, exc, exc_info=True)
            except Exception as e:
                logger.error("Unexpected error in Kafka consumer loop: %s", e, exc_info=True)
                await asyncio.sleep(5)
                
    except asyncio.CancelledError:
        logger.info("Kafka consumer loop cancelled")
    finally:
        if consumer:
            await loop.run_in_executor(None, consumer.close)
        logger.info("Kafka consumer closed")
