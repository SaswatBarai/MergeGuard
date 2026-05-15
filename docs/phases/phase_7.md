## Phase 7: Discovery Agent (Phase 0) & Context Profiling

### Phase Overview
This phase implements the foundational Discovery Agent. As detailed in the PRD, this agent is the first to run in any review and is strictly responsible for fetching the PR, analyzing the codebase structure, and creating the `Context Profile`. Because the entire platform is language-agnostic, no other agent can apply relevant reasoning until this profile explicitly defines the technical context (language, framework, DB layer).

### Detailed Implementation Guide
1. **GitHub Integration**: Implement logic within the Discovery Agent node to use a provided GitHub token to fetch the raw pull request data: diffs, file lists, commit messages, and the PR description.
2. **Context Analysis**: Write the logic to analyze the fetched files. It must inspect file extensions, import statements, dependency manifests (like `package.json` or `requirements.txt`), and configuration files to infer the tech stack.
3. **Context Profile Generation**: Structure the analyzed data into a formal `Context Profile` object. This profile must explicitly list detected languages, frameworks, database/ORM layers, test frameworks, and the system type (e.g., Web API, ML Pipeline).
4. **Redis Storage**: Save this serialized `Context Profile` to Redis under a specific key (e.g., `review:<job_id>:context`).
5. **Orchestrator Enforcements**: Update the LangGraph flow to ensure that if the Discovery Agent fails to generate a valid profile, the entire review job is halted and marked as failed.

### Tasks to complete
- Implement the PR Reader and Discovery Agent in Python.
- Integrate GitHub API calls to fetch PR diffs, file lists, and metadata.
- Write logic to analyze extensions, imports, and manifests to build the `Context Profile`.
- Ensure the Orchestrator halts or proceeds based on the successful creation of this profile.

### Completion check
- [ ] The Discovery Agent can process a real GitHub PR URL and output a structured `Context Profile` to Redis detailing language, framework, and db layer.
