import logging
from typing import List, Dict, Any
from src.orchestrator.state import ReviewState, ContextProfile
from src.orchestrator.analyzer import analyze_context
from src.orchestrator.llm import LLMService
from src.cache.client import create_redis_client, set_job_context, set_job_findings
from src.services.github import GitHubService

logger = logging.getLogger(__name__)

# Initialize LLM Service
llm_service = LLMService()

async def discovery_node(state: ReviewState) -> dict:
    logger.info("Node: Discovery [job_id=%s, repo=%s]", state["job_id"], state["full_repo_name"])
    
    token = state["metadata"].get("github_token")
    if not token:
        logger.error("No GitHub token found in metadata")
        return {"status": "failed", "completed_agents": ["discovery"]}

    gh = GitHubService(token)
    
    try:
        # 1. Fetch PR Diff and Files
        diff = await gh.get_pr_diff(state["full_repo_name"], state["pr_number"])
        files = await gh.get_pr_files(state["full_repo_name"], state["pr_number"])
        
        # 2. Analyze context
        profile = analyze_context(files)
        
        if not profile["languages"]:
            logger.warning("No languages detected in PR. Marking discovery as failed.")
            return {"status": "failed", "completed_agents": ["discovery"]}

        # 3. Save Context Profile to Redis for other services/agents
        redis = create_redis_client()
        try:
            await set_job_context(redis, state["job_id"], {
                "profile": profile,
                "status": "discovery_complete"
            })
            logger.info("Context Profile saved to Redis for job %s", state["job_id"])
        finally:
            await redis.aclose()

        logger.info("Discovery complete. Detected languages: %s", profile["languages"])
        
        return {
            "context_profile": profile,
            "pr_diff": diff,
            "completed_agents": ["discovery"],
            "status": "analyzing"
        }
    except Exception as exc:
        logger.error("Discovery failed: %s", exc)
        return {"status": "failed", "completed_agents": ["discovery"]}

async def security_node(state: ReviewState) -> dict:
    logger.info("Node: Security [job_id=%s]", state["job_id"])
    
    findings = await llm_service.get_findings(
        "security", 
        state["context_profile"], 
        state["pr_diff"]
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "security", findings)
    finally:
        await redis.aclose()

    return {
        "completed_agents": ["security"],
        "findings": findings
    }

async def performance_node(state: ReviewState) -> dict:
    logger.info("Node: Performance [job_id=%s]", state["job_id"])
    
    findings = await llm_service.get_findings(
        "performance", 
        state["context_profile"], 
        state["pr_diff"]
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "performance", findings)
    finally:
        await redis.aclose()

    return {
        "completed_agents": ["performance"],
        "findings": findings
    }

async def testing_node(state: ReviewState) -> dict:
    logger.info("Node: Testing [job_id=%s]", state["job_id"])
    
    findings = await llm_service.get_findings(
        "testing", 
        state["context_profile"], 
        state["pr_diff"]
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "testing", findings)
    finally:
        await redis.aclose()

    return {
        "completed_agents": ["testing"],
        "findings": findings
    }

async def architecture_node(state: ReviewState) -> dict:
    logger.info("Node: Architecture [job_id=%s]", state["job_id"])
    
    findings = await llm_service.get_findings(
        "architecture", 
        state["context_profile"], 
        state["pr_diff"]
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "architecture", findings)
    finally:
        await redis.aclose()

    return {
        "completed_agents": ["architecture"],
        "findings": findings
    }

async def readability_node(state: ReviewState) -> dict:
    logger.info("Node: Readability [job_id=%s]", state["job_id"])
    
    findings = await llm_service.get_findings(
        "readability", 
        state["context_profile"], 
        state["pr_diff"]
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "readability", findings)
    finally:
        await redis.aclose()

    return {
        "completed_agents": ["readability"],
        "findings": findings
    }

async def summary_node(state: ReviewState) -> dict:
    logger.info("Node: Summary [job_id=%s]", state["job_id"])
    return {
        "completed_agents": ["summary"],
        "status": "summarized"
    }

async def feedback_node(state: ReviewState) -> dict:
    logger.info("Node: Feedback [job_id=%s]", state["job_id"])
    return {
        "completed_agents": ["feedback"],
        "status": "completed"
    }
