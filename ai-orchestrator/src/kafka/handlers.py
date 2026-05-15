import logging

import redis.asyncio as aioredis

from src.cache.client import set_job_context
from src.kafka.schemas import ReviewJobRequested
from src.orchestrator.graph import orchestrator_runnable

logger = logging.getLogger(__name__)


async def handle_review_job_requested(payload: dict, redis: aioredis.Redis) -> None:
    try:
        message = ReviewJobRequested(**payload)
    except Exception as exc:
        logger.error("Invalid message format for review-job-requested: %s", exc)
        return

    job_id = message.jobId

    # 1. Prepare initial state and cache it
    initial_state = {
        "jobId": job_id,
        "prNumber": message.prNumber,
        "repositoryId": message.repositoryId,
        "branchName": message.branchName,
        "status": "pending",
    }
    
    await set_job_context(redis, job_id, initial_state)
    logger.info("Job %s: context written to Redis", job_id)

    # 2. Trigger LangGraph Orchestration
    try:
        logger.info("Job %s: starting AI orchestration", job_id)
        
        # Mapping Kafka schema to internal ReviewState
        langgraph_state = {
            "job_id": job_id,
            "repository_id": message.repositoryId,
            "pr_number": message.prNumber,
            "branch_name": message.branchName or "main",
            "status": "pending",
            "findings": [],
            "completed_agents": [],
            "metadata": {"github_token": message.githubToken}
        }
        
        # Execute the graph
        final_state = await orchestrator_runnable.ainvoke(langgraph_state)
        
        # 3. Update Redis with final state
        await set_job_context(redis, job_id, {
            **initial_state,
            "status": final_state["status"],
            "findings_count": len(final_state["findings"])
        })
        
        logger.info("Job %s: AI orchestration completed with status %s", job_id, final_state["status"])
        
    except Exception as exc:
        logger.error("Job %s: AI orchestration failed: %s", job_id, exc)
        await set_job_context(redis, job_id, {**initial_state, "status": "failed"})
