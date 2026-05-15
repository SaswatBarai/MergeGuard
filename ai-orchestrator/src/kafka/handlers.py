import logging

import redis.asyncio as aioredis

from src.cache.client import set_job_context
from src.kafka.schemas import ReviewJobRequested

logger = logging.getLogger(__name__)


async def handle_review_job_requested(payload: dict, redis: aioredis.Redis) -> None:
    try:
        message = ReviewJobRequested(**payload)
    except Exception as exc:
        logger.error("Invalid message format for review-job-requested: %s", exc)
        return

    job_id = message.jobId

    await set_job_context(
        redis,
        job_id,
        {
            "jobId": job_id,
            "prNumber": message.prNumber,
            "repositoryId": message.repositoryId,
            "branchName": message.branchName,
            "status": "pending",
        },
    )
    logger.info("Job %s: context written to Redis", job_id)
