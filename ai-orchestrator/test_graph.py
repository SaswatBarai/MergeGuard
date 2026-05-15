import asyncio
import logging
from src.orchestrator.graph import orchestrator_runnable

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_graph():
    # Initial state
    initial_state = {
        "job_id": 1234,
        "repository_id": 55,
        "pr_number": 42,
        "branch_name": "feature/test",
        "status": "pending",
        "findings": [],
        "completed_agents": [],
        "metadata": {}
    }

    logger.info("Starting graph execution...")
    
    # Run the graph
    # Using 'invoke' for a single execution
    final_state = await orchestrator_runnable.ainvoke(initial_state)

    logger.info("Graph execution complete.")
    logger.info("Final Status: %s", final_state["status"])
    logger.info("Completed Agents: %s", final_state["completed_agents"])
    logger.info("Total Findings: %d", len(final_state["findings"]))
    
    for finding in final_state["findings"]:
        logger.info("Finding from %s: %s", finding["agent_name"], finding["content"])

if __name__ == "__main__":
    asyncio.run(test_graph())
