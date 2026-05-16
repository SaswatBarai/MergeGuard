## Phase 8: Core AI Agents - Security & Performance

### Phase Overview
This phase implements the first two specialized AI review agents: the Security Analyst and the Performance Analyst. These agents realize the core value proposition of the platform: they do not use generic prompts. Instead, they dynamically adapt their reasoning based on the `Context Profile` generated in Phase 7, providing expert-level, highly relevant feedback on potential vulnerabilities and performance bottlenecks specific to the detected tech stack.

### Detailed Implementation Guide
1. **Jinja2 Templating**: Set up `Jinja2` templating in the Python service. Create base prompt templates for Security and Performance.
2. **Context Injection**: Within the agent nodes, fetch the `Context Profile` from Redis. Use Jinja2 to render the final prompt, dynamically injecting instructions based on the stack. For example, if the context indicates a React frontend, the Security prompt emphasizes XSS and client-side secrets; if it indicates an Express backend, it emphasizes SQL injection and auth bypass.
3. **LLM Invocation & Parsing**: Send the dynamically generated prompt and the PR diff to the Claude API. Implement structured output parsing to ensure findings are returned in a strict JSON format (Severity, File Location, Description, Recommendation).
4. **State Management**: Save the parsed structured findings back to Redis (e.g., `review:<job_id>:security_findings`).
5. **Parallel Execution**: Update the LangGraph definition to execute the Security and Performance nodes in parallel immediately following the successful completion of the Discovery Agent.

### Tasks to complete
- Implement the Security Analyst agent with adaptive Jinja2 prompt templates based on the Context Profile.
- Implement the Performance Analyst agent with adaptive prompts.
- Ensure these agents correctly read the Context Profile from Redis before execution.
- Wire these agents into the LangGraph orchestrator.

### Completion check
- [x] Both agents generate findings classified by severity (Critical, High, Medium, Low) based on a sample PR.
- [x] Agent outputs are successfully saved to the shared Redis state.
- [x] Jinja2 templating is used for context-aware prompt generation.
- [x] Parallel execution of agents is implemented in the LangGraph flow.
