from langgraph.graph import StateGraph, END
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

def should_continue(state: ReviewState):
    """
    Determines whether to continue to specialized agents or halt on failure.
    """
    if state.get("status") == "failed":
        return "end"
    return "continue"

def create_orchestrator_graph():
    # 1. Initialize the graph with our State schema
    workflow = StateGraph(ReviewState)

    # 2. Add all nodes
    workflow.add_node("discovery", discovery_node)
    workflow.add_node("security", security_node)
    workflow.add_node("performance", performance_node)
    workflow.add_node("testing", testing_node)
    workflow.add_node("architecture", architecture_node)
    workflow.add_node("readability", readability_node)
    workflow.add_node("summary", summary_node)
    workflow.add_node("feedback", feedback_node)

    # 3. Define the edges (the flow)
    
    # Start at discovery
    workflow.set_entry_point("discovery")

    # Conditional routing after discovery
    workflow.add_conditional_edges(
        "discovery",
        should_continue,
        {
            "continue": ["security", "performance", "testing", "architecture", "readability"],
            "end": END
        }
    )

    # All specialized agents converge at the summary node
    workflow.add_edge("security", "summary")
    workflow.add_edge("performance", "summary")
    workflow.add_edge("testing", "summary")
    workflow.add_edge("architecture", "summary")
    workflow.add_edge("readability", "summary")

    # Summary goes to feedback
    workflow.add_edge("summary", "feedback")

    # Feedback is the end for now
    workflow.add_edge("feedback", END)

    # 4. Compile the graph
    return workflow.compile()

# Singleton instance
orchestrator_runnable = create_orchestrator_graph()
