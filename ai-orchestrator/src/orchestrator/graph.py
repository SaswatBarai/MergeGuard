from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from src.orchestrator.state import ReviewState
from src.orchestrator.nodes import (
    discovery_node,
    security_node,
    performance_node,
    testing_node,
    architecture_node,
    readability_node,
    summary_node,
    feedback_node
)

AGENT_NODES = ["security", "performance", "testing", "architecture", "readability"]
_NODE_FN = {
    "security": security_node,
    "performance": performance_node,
    "testing": testing_node,
    "architecture": architecture_node,
    "readability": readability_node,
}

def should_continue(state: ReviewState):
    if state.get("status") == "failed":
        return "end"
    return "analyze"

async def router_node(state: ReviewState) -> dict:
    """Passthrough node — exists solely to fan-out edges to all parallel agents."""
    return {}

def route_after_feedback(state: ReviewState):
    if state.get("status") == "completed":
        return "end"
    return "re-run"

def create_orchestrator_graph():
    workflow = StateGraph(ReviewState)

    # Nodes
    workflow.add_node("discovery", discovery_node)
    workflow.add_node("router", router_node)
    for name, fn in _NODE_FN.items():
        workflow.add_node(name, fn)
    workflow.add_node("summary", summary_node)
    workflow.add_node("feedback", feedback_node)

    # Entry
    workflow.set_entry_point("discovery")

    # discovery → router (or END on failure)
    workflow.add_conditional_edges(
        "discovery",
        should_continue,
        {"analyze": "router", "end": END}
    )

    # router fans out to all agents in parallel
    for name in AGENT_NODES:
        workflow.add_edge("router", name)

    # All agents converge at summary
    for name in AGENT_NODES:
        workflow.add_edge(name, "summary")

    workflow.add_edge("summary", "feedback")

    # feedback → re-run router (or END)
    workflow.add_conditional_edges(
        "feedback",
        route_after_feedback,
        {"re-run": "router", "end": END}
    )

    memory = MemorySaver()
    return workflow.compile(
        checkpointer=memory,
        interrupt_before=["feedback"]
    )

orchestrator_runnable = create_orchestrator_graph()
