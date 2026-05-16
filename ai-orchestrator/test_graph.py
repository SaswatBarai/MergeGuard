import asyncio
import logging
from unittest.mock import MagicMock, patch, AsyncMock
from src.orchestrator.graph import orchestrator_runnable

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_graph():
    # Initial state
    initial_state = {
        "job_id": 1234,
        "repository_id": 55,
        "pr_number": 42,
        "full_repo_name": "google/gemini-cli",
        "branch_name": "feature/test",
        "status": "pending",
        "findings": [],
        "completed_agents": [],
        "metadata": {"github_token": "fake-token"},
        "context_profile": None,
        "pr_diff": ""
    }

    logger.info("Starting graph execution with mocked GitHub...")
    
    # Mock GitHubService
    mock_files = [
        {"filename": "src/main.py"},
        {"filename": "requirements.txt"},
        {"filename": "tests/test_main.py"}
    ]
    mock_diff = "diff --git a/src/main.py b/src/main.py\n..."

    with patch("src.orchestrator.nodes.GitHubService") as MockGH:
        instance = MockGH.return_value
        instance.get_pr_diff = AsyncMock(return_value=mock_diff)
        instance.get_pr_files = AsyncMock(return_value=mock_files)
        
        # Run the graph
        final_state = await orchestrator_runnable.ainvoke(initial_state)

    logger.info("Graph execution complete.")
    logger.info("Final Status: %s", final_state["status"])
    logger.info("Detected Languages: %s", final_state["context_profile"]["languages"])
    logger.info("Completed Agents: %s", final_state["completed_agents"])
    
    for finding in final_state["findings"]:
        logger.info("Finding from %s: %s", finding["agent_name"], finding["content"])

if __name__ == "__main__":
    asyncio.run(test_graph())
