import asyncio
import logging

from fastapi import FastAPI

from src.cache.client import create_redis_client
from src.kafka.consumer import start_consumer
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = create_redis_client()
    await redis.ping()
    logger.info("Redis connection established")

    consumer_task = asyncio.create_task(start_consumer(redis))
    logger.info("Kafka consumer task started")

    yield

    consumer_task.cancel()
    await asyncio.gather(consumer_task, return_exceptions=True)
    await redis.aclose()
    logger.info("Shutdown complete")


app = FastAPI(title="AI Orchestrator", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-orchestrator"}


@app.get("/")
async def root():
    return {"message": "AI Orchestrator is running"}
