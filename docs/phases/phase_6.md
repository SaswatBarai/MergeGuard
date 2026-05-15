## Phase 6: Python AI Orchestrator & LangGraph Foundation

### Phase Overview
This phase establishes the core execution engine of the AI code review pipeline. Using Python and LangGraph, it sets up the state graph that defines how the various specialized AI agents will be orchestrated, how state will be shared between them, and how execution will flow based on dynamic conditions. This provides the framework onto which all subsequent AI logic will be attached.

### Detailed Implementation Guide
1. **Service Initialization**: In the Python `ai-orchestrator` directory, set up the necessary dependencies: `langgraph`, `langchain`, `anthropic`, `redis`, and `pika`.
2. **Claude API Integration**: Configure the Anthropic Claude API SDK to serve as the primary LLM backend for all agent reasoning. Setup robust error handling and retries for API rate limits.
3. **Graph Definition**: Define a LangGraph `StateGraph` that models the review lifecycle. The state schema should track the `job_id`, the current list of completed agents, and any pending feedback.
4. **Placeholder Nodes**: Create basic Python functions (nodes) representing each agent defined in the PRD (Discovery, Security, Performance, Testing, Architecture, Readability, Summary, Feedback).
5. **Routing Logic**: Implement the conditional edges in LangGraph to route from the entry point to Discovery, then parallelize to the core agents, then converge at the Summary agent, and finally pause at the Feedback agent.

### Tasks to complete
- Set up the LangGraph environment in the Python AI Orchestrator service.
- Integrate the Anthropic Claude API SDK.
- Create the core graph structure with placeholder nodes for all agents (Discovery, Security, etc.).
- Implement the orchestration logic to decide the execution path based on dummy state.

### Completion check
- [ ] The LangGraph pipeline can execute from start to finish with dummy nodes.
- [ ] The service can successfully invoke the Claude API with a simple test prompt.
