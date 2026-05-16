import logging
from typing import List, Dict, Any
from src.orchestrator.state import ReviewState, ContextProfile
from src.orchestrator.analyzer import analyze_context
from src.cache.client import create_redis_client, set_job_context
from src.services.github import GitHubService

logger = logging.getLogger(__name__)

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
    return {
        "completed_agents": ["security"],
        "findings": [{
            "agent_name": "security",
            "content": "No major security issues found (Dummy)",
            "severity": "info",
            "file_path": None,
            "line_number": None
        }]
    }

async def performance_node(state: ReviewState) -> dict:
    logger.info("Node: Performance [job_id=%s]", state["job_id"])
    return {
        "completed_agents": ["performance"],
        "findings": [{
            "agent_name": "performance",
            "content": "Performance looks optimal (Dummy)",
            "severity": "info",
            "file_path": None,
            "line_number": None
        }]
    }

async def testing_node(state: ReviewState) -> dict:
    logger.info("Node: Testing [job_id=%s]", state["job_id"])
    return {
        "completed_agents": ["testing"],
        "findings": []
    }

async def architecture_node(state: ReviewState) -> dict:
    logger.info("Node: Architecture [job_id=%s]", state["job_id"])
    return {
        "completed_agents": ["architecture"],
        "findings": []
    }

async def readability_node(state: ReviewState) -> dict:
    logger.info("Node: Readability [job_id=%s]", state["job_id"])
    return {
        "completed_agents": ["readability"],
        "findings": []
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
