## Phase 10: Summary & Feedback Agents (Human-in-the-loop)

### Phase Overview
This phase introduces the crucial human-in-the-loop mechanism that differentiates this platform from fully automated bots. It implements the Summary Agent to synthesize all disparate agent findings into a single, cohesive report, and the Feedback Agent to pause the workflow. This pause allows the user to review the summary, provide targeted instructions (e.g., "ignore test findings for this script"), and selectively re-run parts of the pipeline before finalizing the review.

### Detailed Implementation Guide
1. **Summary Agent**: Implement a node that executes after all core agents complete. It reads all findings from Redis (`security`, `performance`, `testing`, etc.), passes them to Claude to deduplicate and synthesize, and generates a structured executive summary with an overall recommendation.
2. **Graph Interruption**: Utilize LangGraph's `interrupt` functionality (or a similar breakpoint/wait state mechanism) within the Feedback Agent node. The graph must pause execution and wait for an external message.
3. **Feedback Handling**: Set up a listener (via RabbitMQ) in the Python service to receive user feedback. When feedback is received, resume the LangGraph execution, passing the feedback payload into the state.
4. **Selective Re-routing**: Update the orchestrator routing logic. If the user provides feedback requesting changes, the Orchestrator must analyze the feedback to determine which specific agents need to re-run, inject the feedback into their Jinja2 prompts, and execute only those parallel branches before generating a new summary.

### Tasks to complete
- Implement the Summary Agent to synthesize all findings from Redis into a cohesive report.
- Implement the Feedback Agent logic to pause the graph execution and wait for user input.
- Create the feedback loop mechanism in the Orchestrator to selectively re-run specific agents based on input.

### Completion check
- [ ] The AI Orchestrator pauses and outputs a synthesized summary.
- [ ] Injecting mock user feedback ("ignore performance") triggers a partial pipeline re-run successfully.
