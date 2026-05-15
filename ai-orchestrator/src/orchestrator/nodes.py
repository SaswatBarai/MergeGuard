import logging
from src.orchestrator.state import ReviewState

logger = logging.getLogger(__name__)

async def discovery_node(state: ReviewState) -> dict:
    logger.info("Node: Discovery [job_id=%s]", state["job_id"])
    # In the future, this will fetch file list and diffs
    return {
        "completed_agents": ["discovery"],
        "status": "analyzing"
    }

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
