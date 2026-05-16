## Phase 9: Core AI Agents - Testing, Architecture, & Readability

### Phase Overview
This phase completes the suite of core analytical agents by implementing the Test Coverage Analyst, Architecture Reviewer, and Readability & Maintainability Reviewer. Together with Security and Performance, these agents provide a comprehensive, multi-dimensional code review. Like the previous agents, they rely entirely on the `Context Profile` to define what constitutes "good" code in the specific context of the pull request.

### Detailed Implementation Guide
1. **Test Coverage Analyst**: Implement this node to evaluate testing gaps. Inject context to inform the LLM about the detected test framework (e.g., Jest vs. Pytest) so it can provide actionable, framework-specific testing recommendations.
2. **Architecture Reviewer**: Implement this node to evaluate structural decisions. Inject context so the agent evaluates based on the system type (e.g., layered backend vs. component-based frontend) rather than a one-size-fits-all architectural ideal.
3. **Readability Reviewer**: Implement this node to focus on idiomatic code style, naming conventions, and maintainability tailored to the specific programming language community detected in the context.
4. **Prompt Construction & Parsing**: Use Jinja2 to build their dynamic prompts, invoke the Claude API, and parse the responses into strict JSON finding structures.
5. **Orchestrator Integration**: Add all three nodes to the parallel execution block in LangGraph, ensuring they run concurrently with Security and Performance, and save their results to Redis.

### Tasks to complete
- Implement the Test Coverage Analyst agent.
- Implement the Architecture Reviewer agent.
- Implement the Readability and Maintainability Reviewer agent.
- Build the dynamic prompt construction logic using Jinja2 for all three.
- Wire these into the Orchestrator parallel execution paths.

### Completion check
- [x] All three agents run successfully against a sample PR and produce structured findings tailored to the detected language/framework.
- [x] Adaptive Jinja2 templates implemented for Testing, Architecture, and Readability.
- [x] Nodes wired into the LangGraph orchestrator with Redis persistence.
