import json

import redis.asyncio as aioredis

from src.config import REDIS_KEY_TTL, REDIS_URL


def create_redis_client() -> aioredis.Redis:
    return aioredis.from_url(REDIS_URL, decode_responses=True)


async def set_job_context(redis: aioredis.Redis, job_id: int, context: dict) -> None:
    key = f"review:{job_id}:context"
    await redis.set(key, json.dumps(context), ex=REDIS_KEY_TTL)


async def set_job_findings(redis: aioredis.Redis, job_id: int, agent: str, findings: dict) -> None:
    key = f"review:{job_id}:{agent}_findings"
    await redis.set(key, json.dumps(findings), ex=REDIS_KEY_TTL)


async def get_job_context(redis: aioredis.Redis, job_id: int) -> dict | None:
    key = f"review:{job_id}:context"
    raw = await redis.get(key)
    return json.loads(raw) if raw else None
