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

    # After discovery, we fan out to all specialized agents in parallel
    workflow.add_edge("discovery", "security")
    workflow.add_edge("discovery", "performance")
    workflow.add_edge("discovery", "testing")
    workflow.add_edge("discovery", "architecture")
    workflow.add_edge("discovery", "readability")

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
