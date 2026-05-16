import logging

import redis.asyncio as aioredis

from src.cache.client import set_job_context
from src.kafka.schemas import ReviewJobRequested, ReviewJobFeedback
from src.orchestrator.graph import orchestrator_runnable
from src.kafka.producer import kafka_producer
from src.config import TOPIC_REVIEW_COMPLETED

logger = logging.getLogger(__name__)

def _publish_completion(job_id: int, status: str, findings: list):
    kafka_producer.publish(TOPIC_REVIEW_COMPLETED, {
        "jobId": job_id,
        "status": status,
        "findings": findings
    })


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
        "fullRepoName": message.fullRepoName,
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
            "full_repo_name": message.fullRepoName,
            "status": "pending",
            "findings": [],
            "completed_agents": [],
            "metadata": {"github_token": message.githubToken}
        }
        
        # Execute the graph with thread_id for persistence
        config = {"configurable": {"thread_id": str(job_id)}}
        final_state = await orchestrator_runnable.ainvoke(langgraph_state, config=config)
        
        # 3. Update Redis with final state
        # Note: If it paused at feedback, status will be whatever summary_node set it to.
        status = final_state.get("status", "pending")
        findings = final_state.get("findings", [])
        
        await set_job_context(redis, job_id, {
            **initial_state,
            "status": status,
            "findings_count": len(findings)
        })
        
        if status == "completed" or status == "failed":
            _publish_completion(job_id, status, findings)
        
        logger.info("Job %s: AI orchestration reached checkpoint/completion with status %s", job_id, status)
        
    except Exception as exc:
        logger.error("Job %s: AI orchestration failed: %s", job_id, exc)
        await set_job_context(redis, job_id, {**initial_state, "status": "failed"})


async def handle_review_job_feedback(payload: dict, redis: aioredis.Redis) -> None:
    try:
        message = ReviewJobFeedback(**payload)
    except Exception as exc:
        logger.error("Invalid message format for review-job-feedback: %s", exc)
        return

    job_id = message.jobId
    feedback = message.feedback

    logger.info("Job %s: Received user feedback: %s", job_id, feedback)

    try:
        config = {"configurable": {"thread_id": str(job_id)}}
        
        # 1. Update the state with user feedback first
        await orchestrator_runnable.aupdate_state(config, {"user_feedback": feedback})
        
        # 2. Resume the graph
        # Since we used interrupt_before, we just call ainvoke(None) to continue
        final_state = await orchestrator_runnable.ainvoke(None, config=config)
        
        # Update Redis after resume
        status = final_state.get("status", "completed")
        findings = final_state.get("findings", [])

        await set_job_context(redis, job_id, {
            "status": status,
            "findings_count": len(findings)
        })
        
        if status == "completed" or status == "failed":
            _publish_completion(job_id, status, findings)
            
        logger.info("Job %s: AI orchestration resumed and reached next checkpoint/completion", job_id)
    except Exception as exc:
        logger.error("Job %s: Failed to resume AI orchestration: %s", job_id, exc)
