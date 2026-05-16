import logging
from typing import List, Dict, Any
from src.orchestrator.state import ReviewState, ContextProfile
from src.orchestrator.analyzer import analyze_context
from src.orchestrator.llm import LLMService
from src.cache.client import create_redis_client, set_job_context, set_job_findings
from src.services.github import GitHubService
from src.kafka.producer import kafka_producer
from src.config import TOPIC_AGENT_PROGRESS

logger = logging.getLogger(__name__)

# Initialize LLM Service
llm_service = LLMService()

def _publish_progress(job_id: int, agent_name: str, status: str, findings_count: int = 0):
    kafka_producer.publish(TOPIC_AGENT_PROGRESS, {
        "jobId": job_id,
        "agentName": agent_name,
        "status": status,
        "findingsCount": findings_count
    })

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
    _publish_progress(state["job_id"], "security", "running")
    
    findings = await llm_service.get_findings(
        "security", 
        state["context_profile"], 
        state["pr_diff"],
        user_feedback=state.get("user_feedback")
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "security", findings)
    finally:
        await redis.aclose()

    _publish_progress(state["job_id"], "security", "completed", len(findings))
    return {
        "completed_agents": ["security"],
        "findings": findings
    }

async def performance_node(state: ReviewState) -> dict:
    logger.info("Node: Performance [job_id=%s]", state["job_id"])
    _publish_progress(state["job_id"], "performance", "running")
    
    findings = await llm_service.get_findings(
        "performance", 
        state["context_profile"], 
        state["pr_diff"],
        user_feedback=state.get("user_feedback")
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "performance", findings)
    finally:
        await redis.aclose()

    _publish_progress(state["job_id"], "performance", "completed", len(findings))
    return {
        "completed_agents": ["performance"],
        "findings": findings
    }

async def testing_node(state: ReviewState) -> dict:
    logger.info("Node: Testing [job_id=%s]", state["job_id"])
    _publish_progress(state["job_id"], "testing", "running")
    
    findings = await llm_service.get_findings(
        "testing", 
        state["context_profile"], 
        state["pr_diff"],
        user_feedback=state.get("user_feedback")
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "testing", findings)
    finally:
        await redis.aclose()

    _publish_progress(state["job_id"], "testing", "completed", len(findings))
    return {
        "completed_agents": ["testing"],
        "findings": findings
    }

async def architecture_node(state: ReviewState) -> dict:
    logger.info("Node: Architecture [job_id=%s]", state["job_id"])
    _publish_progress(state["job_id"], "architecture", "running")
    
    findings = await llm_service.get_findings(
        "architecture", 
        state["context_profile"], 
        state["pr_diff"],
        user_feedback=state.get("user_feedback")
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "architecture", findings)
    finally:
        await redis.aclose()

    _publish_progress(state["job_id"], "architecture", "completed", len(findings))
    return {
        "completed_agents": ["architecture"],
        "findings": findings
    }

async def readability_node(state: ReviewState) -> dict:
    logger.info("Node: Readability [job_id=%s]", state["job_id"])
    _publish_progress(state["job_id"], "readability", "running")
    
    findings = await llm_service.get_findings(
        "readability", 
        state["context_profile"], 
        state["pr_diff"],
        user_feedback=state.get("user_feedback")
    )
    
    # Save to Redis
    redis = create_redis_client()
    try:
        await set_job_findings(redis, state["job_id"], "readability", findings)
    finally:
        await redis.aclose()

    _publish_progress(state["job_id"], "readability", "completed", len(findings))
    return {
        "completed_agents": ["readability"],
        "findings": findings
    }

async def summary_node(state: ReviewState) -> dict:
    logger.info("Node: Summary [job_id=%s]", state["job_id"])
    _publish_progress(state["job_id"], "summary", "running")
    
    # 1. Group findings by agent
    grouped_findings = {}
    for finding in state["findings"]:
        agent = finding["agent_name"]
        if agent not in grouped_findings:
            grouped_findings[agent] = []
        grouped_findings[agent].append(finding)
    
    # 2. Generate synthesized summary
    summary = await llm_service.get_summary(state["context_profile"], grouped_findings)
    
    # 3. Save final report to Redis
    redis = create_redis_client()
    try:
        await set_job_context(redis, state["job_id"], {
            "summary": summary,
            "status": "summarized",
            "findings": state["findings"]
        })
        logger.info("Final summary report saved to Redis for job %s", state["job_id"])
    finally:
        await redis.aclose()

    _publish_progress(state["job_id"], "summary", "completed")
    return {
        "completed_agents": ["summary"],
        "status": "summarized",
        "findings": [{
            "agent_name": "summary",
            "content": json.dumps(summary),
            "severity": "info",
            "file_path": None,
            "line_number": None
        }]
    }

async def feedback_node(state: ReviewState) -> dict:
    logger.info("Node: Feedback [job_id=%s, feedback=%s]", state["job_id"], state.get("user_feedback"))
    _publish_progress(state["job_id"], "feedback", "awaiting_input")
    
    feedback = state.get("user_feedback", "").lower()
    
    if "approve" in feedback or "looks good" in feedback:
        _publish_progress(state["job_id"], "feedback", "approved")
        return {
            "completed_agents": ["feedback"],
            "status": "completed"
        }
    
    # If not approved, we are in a re-run/correction cycle
    return {
        "completed_agents": ["feedback"],
        "status": "revising"
    }
