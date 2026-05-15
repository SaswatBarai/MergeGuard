# Product Requirements Document

## AI-Powered Multi-Agent Code Review Platform

**Document Version:** 2.0  
**Status:** Draft

## 1. Executive Summary

This platform is a general-purpose, language-agnostic AI code review system. It accepts any pull request from any GitHub repository — regardless of language, framework, database layer, or project type — and runs it through a coordinated pipeline of specialized AI agents, each expert in one domain of code quality.

The platform is accessible in two ways: a CLI tool for developers who live in the terminal, and a web dashboard for teams who want visibility, history, and collaboration. Both interfaces connect to the same backend — a set of TypeScript microservices that coordinate with a Python-based AI orchestration layer.

The system does not guess what it is reviewing. It discovers first, then adapts. Every agent calibrates its entire thinking based on what it finds in the codebase — language, framework, database layer, testing approach — before producing a single finding.

A human-in-the-loop feedback mechanism allows users to react to the summary, provide targeted instructions, and trigger selective re-runs of relevant agents. The system does not produce a final report until the user approves.

## 2. The Problem

### 2.1 One AI Cannot Do Everything Well

A single AI prompt reviewing an entire pull request produces shallow, generic output. Code review is not one task — it is many distinct kinds of thinking happening simultaneously:

- Security analysis requires adversarial thinking.
- Performance analysis requires systems thinking.
- Test coverage requires gap analysis.
- Architecture review requires structural reasoning.
- Readability review requires empathy for future readers.

Combining all of these into one prompt produces a response that is mediocre at all of them. No finding goes deep enough. No domain gets the focused reasoning it deserves.

### 2.2 Existing Tools Are Ecosystem-Specific

Most AI code review tools are tuned for specific ecosystems. They carry hardcoded rules, hardcoded patterns, hardcoded assumptions about what good code looks like. They fail or produce irrelevant output when pointed at an unfamiliar framework, ORM, or language combination.

A team using Spring Boot with JDBC needs completely different review logic than a team using Next.js with Prisma, or a team writing a Python ML pipeline, or a team building a Go gRPC service, or a team working with NestJS and MongoDB, or a team shipping a React Native mobile app. No single hardcoded tool serves all of them well — and the landscape of technologies that teams use is far too broad and evolving too fast for any hardcoded approach to keep up.

### 2.3 No Human In The Loop

Automated review tools produce output and stop. They do not ask whether the findings make sense for the team's context. They do not allow the user to say "we intentionally skip tests in this layer" or "focus more on the database queries" or "this is throwaway code, skip architecture concerns." The output is fixed regardless of whether it is relevant. This produces noise, erodes trust in the tool, and trains engineers to ignore automated feedback.

### 2.4 No Team Visibility

CLI tools produce terminal output that disappears. Teams cannot see review history, track which PRs had critical findings, compare quality trends over time, or collaborate around findings. There is no shared institutional memory. Each review is an isolated event with no connection to the larger picture of how code quality is evolving across a codebase or a team.

## 3. The Solution

A multi-agent AI code review platform with the following core properties:

- **Self-configuring:** The system detects what it is looking at before any review begins. Language, framework, database layer, test framework, system type — all discovered automatically. Agents adapt to this context rather than applying hardcoded rules.
- **Specialized:** Each agent owns one domain of code review. It thinks deeply about that domain and nothing else. The output of each agent is expert-level, not generic.
- **Coordinated:** An orchestrator manages the agent pipeline — deciding which agents run, in what order, routing based on what was discovered, retrying failures, and passing shared context between agents.
- **Human-in-the-loop:** A feedback agent presents the summary to the user, collects targeted feedback, and triggers selective re-runs before the final report is produced.
- **Multi-interface:** A CLI for terminal users and a web dashboard for teams — both connected to the same backend platform.
- **Language and framework agnostic:** The system imposes no assumptions about what it will review. It works on any language, any framework, any database layer, any project type.

## 4. Users

### 4.1 Individual Developer

Uses the CLI. Wants fast, deep feedback on their own PR before submitting for human review. Cares about finding issues early without context switching to a browser.

### 4.2 Engineering Team

Uses the web dashboard. Wants visibility into review history across the team, trend data on code quality, and the ability to configure review behavior per repository.

### 4.3 Tech Lead / Senior Engineer

Uses both. Wants to see architecture and security findings specifically. Cares about enforcing structural patterns. Wants to give feedback to the AI when findings are irrelevant to their context.

### 4.4 Engineering Manager

Uses the dashboard. Does not review code directly but wants trend data — which repositories have recurring critical findings, which team members are shipping cleaner PRs over time, where quality is degrading.

## 5. System Architecture

The platform is composed of five distinct layers, each with a clear responsibility.

### 5.1 User Interface Layer

#### CLI Tool (Python)

A terminal tool installed via pip or uv. Authenticates against the platform API using an API key. Sends PR details to the backend, receives a job ID, polls for real-time status, and renders results in the terminal using structured, color-coded output. The CLI is a thin client — it contains no AI logic. All intelligence lives in the backend.

#### Web Dashboard (Next.js + TypeScript)

A browser-based interface for individuals and teams. Uses Next.js App Router with Server Components for data-heavy pages and Client Components for interactive elements. Connects to a real-time stream to show agents completing live as a review runs. Allows users to read findings, submit feedback, trigger re-runs, configure repositories, and view history.

### 5.2 API Gateway Layer (Express.js + TypeScript)

A single entry point for all traffic from both the CLI and the web dashboard. Responsible for authentication validation, rate limiting, request routing to the correct microservice, consistent request logging, and uniform response formatting. Contains no business logic. Routes requests and protects the system.

### 5.3 Microservices Layer (Express.js + TypeScript)

Three independent services, each owning one business domain.

#### Review Service

Owns the entire review lifecycle. Receives review requests, fetches PR diffs from GitHub, creates jobs, publishes jobs to the message queue, stores results, streams real-time status via Server-Sent Events, receives user feedback, and publishes re-run jobs. Owns the reviews, agent_results, feedback, and final_reports database tables.

#### Auth and User Service

Owns identity. Handles GitHub OAuth flow, issues and validates JWT tokens, manages user profiles, verifies repository access permissions, and manages API keys for CLI authentication.

#### Notification Service

Owns alerting. Listens for review completion events and sends notifications via email, Slack, and optional automated GitHub PR comments. Manages user notification preferences. Decoupled from the Review Service — it reacts to events rather than being called directly.

### 5.4 AI Orchestration Layer (Python)

A standalone Python service that listens to the message queue for review jobs. When a job arrives, it runs the full multi-agent pipeline. When complete, it publishes results back to the queue.

Communicates with TypeScript services exclusively through the message queue — never via direct HTTP calls. Built on LangGraph with Claude as the primary AI model.

### 5.5 Infrastructure Layer

PostgreSQL as the primary database. Redis for agent shared state during a review run and for caching. RabbitMQ as the message queue connecting TypeScript and Python services. Docker for containerizing every service. GitHub API for fetching PR data and optionally posting comments.

## 6. The Agent Pipeline

### 6.1 Foundational Principle

The system does not know what it will review until it looks. No agent applies hardcoded rules. Every agent receives a dynamically constructed prompt that includes the discovered context — language, framework, database layer, system type — before producing any findings. The same agent produces completely different analysis depending on what it discovers.

### 6.2 Prompt Construction

Every agent prompt is assembled at runtime from three layers. The first layer is the universal instruction — what this agent's job is in general terms, never changes. The second layer is the context injection — built from the Context Profile discovered in Phase 0, telling the agent exactly what it is looking at. The third layer is the task — the actual diff or code section to review. Jinja2 templates manage this construction. No prompt is hardcoded.

### 6.3 Phase 0 — Discovery

Before any review agent runs, the PR Reader and Discovery Agent fetches the PR from GitHub and builds a Context Profile. This profile is the foundation that every subsequent agent reads before starting.

The Context Profile captures: all languages present in the diff, frameworks detected from imports and configuration files, database and ORM layer in use, test framework present, build tools and package managers, type of system (web API, frontend application, ML pipeline, CLI tool, infrastructure code, or mixed), and what the PR claims to change versus what files actually changed.

This phase is non-negotiable. No agent runs until the Context Profile exists.

### 6.4 The Orchestrator

The Orchestrator reads the Context Profile and makes runtime decisions. It is not following a fixed script. It decides which agents run, in what order, and with what priority level based on what was discovered.

If the PR touches only markup and styling with no logic changes, it routes only to the Readability Agent. If the PR modifies authentication logic in any language, it elevates the Security Agent's priority. If the PR introduces ML training code, it signals all agents to shift into data pipeline reasoning mode. If the PR contains no test file changes despite logic changes, it flags the Test Coverage Agent as critical priority.

The Orchestrator also manages failure — if an agent fails, it retries with adjusted context. It manages shared memory — each agent's output is written to Redis so subsequent agents can read prior findings. It manages the feedback loop — when the Feedback Agent signals a re-run, the Orchestrator re-runs only the relevant agents, not the full pipeline.

### 6.5 Agent 1 — PR Reader and Discovery Agent

#### Role and Responsibility

This agent runs first, without exception. It is the only agent whose output is not a list of review findings — its output is structured metadata about the codebase and the change being reviewed. Every other agent in the pipeline depends on what this agent produces. Nothing else begins until this agent completes successfully.

#### What It Does

The agent fetches the raw pull request from the GitHub API — the diff, the title, the description, the linked issue if one exists, and the full list of files changed. It then performs a systematic analysis of everything it receives, not to judge quality, but to understand the nature of what it is looking at.

It reads file extensions, import statements, dependency manifests, configuration files, build scripts, and directory structure. From these signals it builds an accurate picture of the technical environment — without any assumptions made in advance.

#### What The Context Profile Contains

The Context Profile is a structured document. It records every language detected in the changed files, the confidence level of each detection, and whether a language appears to be primary or incidental. It records every framework and library inferred from imports, package files, and configuration — not just the obvious ones but also the supporting libraries that reveal how the codebase is structured. It records the database access layer in use — whether that is a raw query driver, a query builder, a full ORM, or a document database client. It records the test framework detected if any exists. It records the build tooling and package management approach. It records what type of system this appears to be — a web API, a frontend application, a background worker, an ML pipeline, a CLI utility, infrastructure-as-code, or a mixed codebase. It records what the PR author claims the change does, and separately what the diff actually shows changing, including a count of files and lines modified.

#### Why This Matters

Every agent that runs after this one will read the Context Profile before doing anything else. A Security Agent that does not know it is looking at a Python ML service will apply web application security thinking to data science code — and produce irrelevant findings. An Architecture Agent that does not know it is looking at a NestJS application will apply the wrong structural standards. The Context Profile is what makes the entire system general purpose rather than framework-specific. It is the intelligence that allows every other agent to be adaptive rather than prescriptive.

#### Output

A fully populated Context Profile written to shared Redis state. No severity classifications. No recommendations. No judgments. Only an accurate, structured description of what the system is looking at.

### 6.6 Agent 2 — Security Analyst

#### Role and Responsibility

This agent is responsible for identifying security vulnerabilities, risks, and weaknesses introduced or exposed by the changes in the pull request. It reads the Context Profile before examining a single line of code. Its entire threat model — what it looks for, how it reasons about risk, what it considers dangerous — is shaped by the specific technology stack, system type, and language discovered in Phase 0.

#### The Core Principle

Security is not universal. What constitutes a dangerous pattern in a Java web service is different from what constitutes a dangerous pattern in a Python data pipeline, which is different again from what is dangerous in a Go network service or a React frontend. This agent does not apply a fixed checklist. It reasons about what attack surfaces exist given the specific environment it has discovered, and it looks for vulnerabilities that are realistic and relevant to that environment.

#### How It Adapts Its Thinking

When the Context Profile reveals a backend web API, the agent focuses its reasoning on the server-side attack surface — input validation, authentication and authorization logic, injection vulnerabilities through whatever query mechanism the service uses, session handling, and the security configuration of whatever framework is in use. When the stack uses an ORM or query builder, it reasons about whether that layer is being used safely or bypassed in ways that reintroduce raw query risks. When the stack uses a raw database driver, it pays closer attention to how queries are constructed and whether user-controlled values are ever concatenated into query strings.

When the Context Profile reveals a frontend application, the agent shifts its reasoning to the client-side attack surface — how the application handles and renders user-provided content, whether any rendering paths could lead to script injection, whether sensitive values are being exposed in client bundles or environment variables that get shipped to the browser, and how the application communicates with its backend.

When the Context Profile reveals an ML or data science codebase, the agent shifts its reasoning again — toward the risks that are specific to that environment. It thinks about how models are loaded and whether deserialization of model files could introduce arbitrary code execution. It thinks about whether data sources are trusted and whether the pipeline validates its inputs. It thinks about whether any web-facing components that serve model predictions are handling their inputs safely.

When the Context Profile reveals infrastructure-as-code or configuration files, the agent focuses on misconfiguration risks — overly permissive access controls, hardcoded credentials, exposed internal services, insecure default settings.

When the Context Profile reveals a CLI tool or developer utility, the agent focuses on how the tool handles inputs from the environment, whether it reads files or environment variables insecurely, and whether it exposes sensitive information in logs or output.

This adaptive reasoning applies to every technology combination the system encounters. The agent is not limited to the examples above — those are illustrations of the thinking pattern, not an exhaustive list. For any stack it encounters, the agent reasons from first principles about what the attack surface is and what the realistic threats are.

#### Output

A finding list where every item is classified at one of four severity levels: Critical for issues that represent an immediate, exploitable risk that must be resolved before merge; High for significant vulnerabilities that represent a meaningful security risk; Medium for issues that weaken the security posture but are not immediately exploitable; Low for minor concerns, informational observations, and best practice deviations. Each finding includes the specific file and location, a plain-language explanation of the risk, and a recommendation.

### 6.7 Agent 3 — Performance Analyst

#### Role and Responsibility

This agent is responsible for identifying performance risks, inefficiencies, and patterns that will cause problems under real-world load or at scale. Like the Security Analyst, it reads the Context Profile first and calibrates its entire analytical model to the specific stack in use. Performance is deeply context-dependent — what causes a performance problem in one environment may be completely irrelevant in another.

#### The Core Principle

Performance bottlenecks are not universal. The performance failure modes of a database-heavy web API are different from those of a data processing pipeline, which are different from those of a frontend application, which are different from those of a concurrent systems program. This agent does not apply a generic checklist. It reasons about where performance problems are most likely to emerge given the specific environment it has discovered, and it focuses its analysis there.

#### How It Adapts Its Thinking

When the Context Profile reveals a database access layer, the agent focuses heavily on query efficiency. It looks at how queries are constructed, whether they could produce multiple round trips where one would suffice, whether large result sets are being fetched when only a subset is needed, whether the code is relying on lazy loading in situations where eager loading would be more appropriate, and whether the data access patterns imply missing indexes. The specific patterns it looks for depend on the database layer in use — the failure modes of document queries are different from those of relational queries, and the failure modes of a raw query driver are different from those of a full ORM.

When the Context Profile reveals a frontend application, the agent shifts its reasoning toward rendering performance and bundle efficiency. It thinks about what causes unnecessary re-renders, whether computationally expensive operations are being recalculated on every render when they could be cached, whether large dependencies are being imported in ways that increase bundle size unnecessarily, and whether data fetching is happening in ways that create request waterfalls.

When the Context Profile reveals an ML or data science pipeline, the agent shifts its reasoning toward data throughput and computational efficiency. It thinks about how data is loaded — whether it is loaded all at once into memory or streamed appropriately, whether batch sizes are sensible, whether the training loop has unnecessary overhead, and whether operations that could be vectorized are being done element by element.

When the Context Profile reveals a concurrent or systems-level program, the agent thinks about resource efficiency at a lower level — whether goroutines, threads, or async tasks are being created and cleaned up correctly, whether shared resources are being accessed in ways that create contention, and whether memory allocation patterns in hot paths are creating unnecessary garbage collection pressure.

When the Context Profile reveals a backend API service, the agent thinks about response time under load — whether expensive operations are blocking the request thread when they should be asynchronous, whether caching is being used where repeated computation or data fetching could be avoided, and whether the service is doing work proportional to request volume or doing fixed startup work on every request.

As with the Security Agent, the examples above illustrate the reasoning pattern rather than defining its limits. The agent applies this same first-principles thinking to any stack it encounters.

#### Output

A finding list where every item includes the file and location, a plain-language description of the performance risk, an explanation of what will happen under load or at scale if the issue is not addressed, and a recommendation. Findings are classified by impact — High for patterns that will cause measurable degradation under normal production load, Medium for patterns that will become problems as scale increases, Low for minor inefficiencies and best practice deviations.

### 6.8 Agent 4 — Test Coverage Analyst

#### Role and Responsibility

This agent is responsible for evaluating whether the changes introduced by the pull request are adequately tested. It does not apply a universal standard of what adequate testing looks like. It reads the Context Profile and derives its expectations from what testing infrastructure and conventions already exist in the codebase, from what type of system is being built, and from what the changed code actually does.

#### The Core Principle

Test coverage is not one-size-fits-all. What constitutes adequate testing for a public API endpoint is different from what constitutes adequate testing for a UI component, which is different from what is appropriate for an ML experimentation script, which is different from what is expected in a systems utility. This agent does not impose a universal testing philosophy. It reasons about what testing is appropriate and expected given the specific context it has discovered, and it evaluates the PR against that standard.

#### How It Adapts Its Thinking

The first thing this agent establishes is what test framework exists in the codebase. This is not a judgment — it is a fact-finding step. Once it knows what framework is in use, it understands the conventions and patterns that tests in this codebase follow, and it can reason meaningfully about whether new code conforms to those conventions.

When a test framework is present, the agent looks at the changed code and asks what new behavior has been introduced, and then asks whether that behavior is covered by new or existing tests. It looks for new functions, methods, classes, or modules that have no corresponding test. It looks for new branches — conditionals, error paths, edge cases — that are not exercised by any test. It looks for integration points — new API calls, database interactions, external service dependencies — that should be tested with appropriate mocking or integration tests but are not. It pays attention to whether the tests that do exist are testing the right things — not just that code runs without error, but that it produces the correct output for a meaningful range of inputs.

The agent calibrates its expectations to the type of system. For a backend service, it expects unit tests on business logic and integration tests on API endpoints. For a frontend application, it expects component tests that verify rendering behavior and user interaction handling. For a data processing pipeline, it expects tests on transformation logic with representative input and output data. For a library or utility, it expects comprehensive unit tests since the library has no other protection against regressions.

When the Context Profile reveals no test framework at all, this is itself a significant finding. The agent does not immediately flag this as a deficiency — it first considers whether the codebase type makes the absence of tests expected or unusual. Infrastructure scripts, quick internal utilities, and ML experimentation notebooks may legitimately operate without formal test suites. Production API services and libraries generally should not. The agent makes this distinction explicit in its output rather than applying a blanket judgment.

When the Context Profile reveals a test framework but the PR contains changes to production code with no corresponding changes to test files, the agent flags this pattern and identifies which specific new behaviors appear to be untested, along with examples of what tests would cover them.

#### Output

A coverage assessment that identifies specific gaps — named functions, behaviors, or paths that lack test coverage — along with the rationale for why each gap matters in the context of this specific codebase. Where no test framework is detected, the agent provides a contextual assessment of whether this is appropriate given the type of system. Findings are classified as Critical where untested code represents a production risk, High where significant new behavior is unverified, Medium where edge cases are missed, and Low where minor scenarios are not covered.

### 6.9 Agent 5 — Architecture Reviewer

#### Role and Responsibility

This agent is responsible for evaluating whether the structural decisions in the pull request are sound — whether the code is organized in a way that is consistent with the existing architecture, whether the right abstractions are being used, whether boundaries between layers and components are being respected, and whether the design will support the codebase's long-term maintainability and scalability.

#### The Core Principle

Good architecture is not universal. What constitutes good structure in a layered backend service is different from what constitutes good structure in a component-based frontend application, which is different from what is appropriate in a machine learning pipeline, which is different from what is expected in a microservice or a systems utility. This agent does not impose one architectural philosophy on all codebases. It reasons about what good structure means for the specific type of system it has discovered, and it evaluates the PR against that standard — not against an external ideal.

#### How It Adapts Its Thinking

The agent begins by understanding the architectural conventions already established in the codebase. What layers exist? What are the boundaries between them? What patterns does the existing code follow? Once it understands the established architecture, it evaluates the PR against it — not against a theoretical ideal, but against what this specific codebase has committed to.

When the Context Profile reveals a layered backend service, the agent thinks about separation of concerns across layers. It asks whether business logic is staying in the right layer, whether data access is abstracted appropriately, whether the PR introduces dependencies between layers that should remain independent, and whether the transaction boundaries — where work is committed or rolled back as a unit — are placed correctly.

When the Context Profile reveals a frontend application built with a component-based framework, the agent thinks about component boundaries and responsibility. It asks whether components are doing too much or too little, whether state is managed at the right level of the component tree, whether data fetching is co-located with the components that need it in a way that is consistent with the framework's conventions, and whether reusable logic is being extracted appropriately.

When the Context Profile reveals a module-based backend framework that enforces explicit module boundaries through its own architecture, the agent thinks about whether those boundaries are being respected. It asks whether dependencies are flowing in the right direction, whether the module structure reflects the domain structure of the application, and whether the dependency injection configuration is sound.

When the Context Profile reveals an ML or data science pipeline, the agent thinks about the separation of pipeline stages. It asks whether data loading, preprocessing, feature engineering, model training, and evaluation are appropriately separated, whether the pipeline is structured so that each stage can be tested and modified independently, and whether the code is organized so that experiments can be run without modifying production pipeline logic.

When the Context Profile reveals a service with a public API — whether HTTP, gRPC, or another protocol — the agent thinks about the design of that API. It asks whether the interface is clean and consistent, whether it exposes implementation details that should be hidden, and whether the PR's changes are backward-compatible or introduce breaking changes.

In every case, the agent derives its standards from the codebase itself. It does not tell a Django application that it should be structured like a Spring Boot application, or tell an ML pipeline that it should follow the patterns of a web service. It evaluates whether the code is consistent with, and a good contribution to, the architecture that is already there.

#### Output

A finding list that identifies specific structural issues — named files, classes, modules, or patterns — along with a plain-language explanation of why each issue matters for long-term maintainability or consistency. Findings are classified as High where the structure will cause meaningful problems as the codebase grows, Medium where the structure is inconsistent or suboptimal but not immediately harmful, and Low where the issue is a minor deviation from convention.

### 6.10 Agent 6 — Readability and Maintainability Reviewer

#### Role and Responsibility

This agent is responsible for evaluating whether the code introduced by the pull request is understandable, maintainable, and idiomatic for its language and ecosystem. It thinks about the experience of the next developer who reads this code — whether they will be able to understand what it does, why it exists, and how to modify it safely.

#### The Core Principle

Readable code is not universal. What makes code readable is deeply tied to the conventions, idioms, and cultural norms of the language community it belongs to. Code that is considered clean and idiomatic in one language community may be considered verbose, cryptic, or unconventional in another. This agent does not apply a language-agnostic definition of readability. It calibrates its standards to the specific language and ecosystem discovered in the Context Profile, and it evaluates the code against what experienced developers in that community would consider clear and maintainable.

#### How It Adapts Its Thinking

The agent begins by establishing what language or languages are present and what the idiomatic conventions of those communities are. These conventions cover naming, structure, error handling, commenting, type usage, function length, abstraction style, and many other dimensions — and they differ meaningfully across language communities.

In some language communities, explicit and verbose is valued — long names, clear type annotations, step-by-step logic that makes control flow obvious. In others, concise and expressive is valued — short names in small scopes, leveraging language features to communicate intent in fewer lines. In some communities, error handling is a first-class concern that appears explicitly at every call site. In others, errors are communicated through exceptions and are expected to propagate unless explicitly caught. In some communities, immutability is the default and mutation is unusual. In others, mutation is normal and unremarkable.

The agent applies these community-specific standards when evaluating naming. A name that is considered appropriately concise in one language might be considered unacceptably cryptic in another. A name that is considered helpfully descriptive in one community might be considered redundant verbosity in another. The agent evaluates names against what experienced developers in the detected language community would consider clear.

The agent applies the same community-specific thinking to structure. What is the appropriate length for a function in this language community? What is the appropriate level of abstraction? How much should a single function do? These questions have different answers in different contexts, and the agent derives its answers from the specific context it has discovered.

The agent also considers whether the code is consistent with the surrounding codebase — not just with abstract language norms, but with the specific conventions this team has established. If the surrounding code uses a particular naming convention, a particular approach to error handling, or a particular level of commenting, the PR should be consistent with that established style.

Beyond naming and structure, the agent evaluates whether the code communicates intent clearly. Are complex or non-obvious operations explained? Are magic numbers named? Are decisions that are not obvious from the code alone documented with a comment that explains the reasoning? Are function and variable names accurate — do they actually describe what the function does or what the variable holds, rather than describing implementation details that might change?

The agent looks for code that will be hard to modify safely — functions that do too many things and cannot be changed without understanding the whole, abstractions that are leaky and require understanding the underlying implementation to use correctly, and logic that is duplicated in ways that mean a future change must be made in multiple places.

#### Output

A finding list that identifies specific readability and maintainability issues — named files, functions, variables, or patterns — with a plain-language explanation of why each issue affects understandability or future maintainability, framed within the conventions of the detected language community. Findings are classified as High where the code will be genuinely difficult to understand or safely modify, Medium where the code is unclear or inconsistent without being immediately problematic, and Low where the issue is a minor style or convention deviation.

### 6.11 Agent 7 — Summary Agent

Receives all agent outputs from Redis. Synthesizes them into one coherent, non-redundant report. Frames findings in the context of the specific system type and stack discovered.

Output structure: an executive summary of three to five sentences answering whether this PR is safe to merge, a list of critical blockers that must be resolved before merge, a list of important suggestions that should be addressed, minor notes that are nice to have, and an overall recommendation of Approve, Approve with Changes, or Request Changes.

This output is shown to the user — but it is not the final report. The Feedback Agent runs next.

### 6.12 Agent 8 — Feedback Agent

Presents the Summary Agent's output to the user through the CLI or the web dashboard. Waits for user response.

The user can approve the report as final, provide targeted feedback to change the analysis, or suppress specific findings that are not relevant to their context.

Examples of valid feedback: "We intentionally skip tests for ML experimentation scripts, remove those findings." "Focus the re-run on the database layer specifically." "The architecture findings are not relevant, this is a throwaway script."

When feedback is received, the Feedback Agent passes it to the Orchestrator with specific instructions. The Orchestrator re-runs only the affected agents — not the full pipeline — with the feedback added to their prompt context. A new summary is generated. The Feedback Agent presents again. This loop continues until the user approves.

When approved, the final report is saved to PostgreSQL and delivered through the original interface — terminal output for CLI users, dashboard view and optional notification for web users.

## 7. Data Flow — End To End

A user initiates a review through either interface. The request reaches the API Gateway, which validates authentication and routes to the Review Service. The Review Service calls the GitHub API to fetch the PR diff, creates a review job record in PostgreSQL with status queued, and publishes the job to RabbitMQ. It immediately returns a job ID to the caller.

The CLI polls a status endpoint. The web dashboard opens a Server-Sent Events stream. Both show real-time progress as agents complete.

The AI Orchestration Service picks up the job from RabbitMQ. The Discovery Agent runs and writes the Context Profile to Redis. The Orchestrator reads it and begins routing agents. Each agent runs, reads the Context Profile and prior agent outputs from Redis, and writes its findings back to Redis. The Orchestrator monitors completion and manages sequencing.

When all agents complete, the Summary Agent compiles the report. The Feedback Agent signals that user input is required. The Review Service updates the SSE stream — the dashboard shows the summary and the feedback form. The CLI prompts the user inline.

When the user approves, the AI Service publishes the final result to RabbitMQ. The Review Service picks it up, saves all findings to PostgreSQL, and delivers the final output. The Notification Service picks up the completion event and sends any configured alerts.

## 8. Technology Decisions

### 8.1 Language Choice Per Layer

Python for the AI Orchestration Service because LangGraph, the Claude SDK, and the AI tooling ecosystem are Python-first. Building this layer in TypeScript would mean fighting the ecosystem constantly for no meaningful benefit.

TypeScript for all other backend services and the frontend because it provides type safety across the entire JavaScript stack, the team knows it, and Express and Next.js are both first-class TypeScript citizens.

### 8.2 Why LangGraph Over CrewAI or AutoGen

LangGraph models workflows as graphs of nodes and edges. Each agent is a node. The Orchestrator controls which edge to follow next. This maps directly to this system's needs — conditional routing based on discovered context, selective re-runs on feedback, parallel execution where safe, shared state management. CrewAI is simpler but offers insufficient control over routing logic. AutoGen is designed for conversational agent patterns, not structured review workflows.

### 8.3 Why RabbitMQ Between TypeScript and Python

The TypeScript microservices and the Python AI service communicate exclusively through RabbitMQ — never via direct HTTP calls between them. This means the AI service can be scaled independently, restarted without affecting the Review Service, and swapped for a different implementation without changing any TypeScript code. Services emit and consume events. They do not call each other.

### 8.4 Why Server-Sent Events Over WebSockets

The real-time updates in this system are unidirectional — the server pushes agent completion updates to the client. The client never pushes data back through the same connection. SSE is simpler, requires no special infrastructure, works over standard HTTP, and is sufficient for this use case. WebSockets would be over-engineering a one-directional data flow.

### 8.5 Why Prisma In TypeScript Services

Prisma provides type-safe database access with TypeScript, auto-generates types from the schema, and handles migrations cleanly. For services that need to move fast and stay correct, Prisma is the right choice.

## 9. Complete Technology Stack

| Layer | Technology | Language |
|---|---|---|
| Web Frontend | Next.js 14 App Router | TypeScript |
| CLI | Typer + Rich | Python |
| API Gateway | Express.js | TypeScript |
| Review Service | Express.js | TypeScript |
| Auth Service | Express.js | TypeScript |
| Notification Service | Express.js | TypeScript |
| AI Orchestration | LangGraph | Python |
| AI Model | Anthropic Claude API | — |
| Prompt Templating | Jinja2 | Python |
| Database | PostgreSQL | — |
| ORM (TypeScript) | Prisma | TypeScript |
| ORM (Python) | SQLAlchemy | Python |
| Cache and Agent State | Redis | — |
| Message Queue | RabbitMQ | — |
| Authentication | GitHub OAuth + JWT | — |
| Real-time Streaming | Server-Sent Events | — |
| Containerization | Docker + Docker Compose | — |
| Testing (TypeScript) | Jest + Supertest | TypeScript |
| Testing (Python) | Pytest + Pytest-mock | Python |
| Package Management (TS) | pnpm | — |
| Package Management (Py) | uv | — |

## 10. Web Dashboard Pages

| Page | Type | Purpose |
|---|---|---|
| Login | Client Component | GitHub OAuth entry point |
| Dashboard Home | Server Component | Recent reviews, team activity, quality trends |
| PR Review Detail | Mixed | Full agent-by-agent findings, collapsible sections, severity badges |
| Feedback Interface | Client Component | Submit feedback, trigger re-runs, approve final report |
| Review History | Server Component | All past reviews, filterable by repo, language, severity, date |
| Repository Settings | Client Component | Agent configuration, severity thresholds, notification preferences |
| Team Overview | Server Component | Cross-member activity, for engineering managers |
| API Keys | Client Component | Manage CLI authentication keys |

## 11. CLI Commands

| Command | Description |
|---|---|
| `codereview --pr 142` | Review PR 142 in the configured repository |
| `codereview --pr 142 --repo owner/repo` | Review PR in a specific repository |
| `codereview --pr 142 --agents security,performance` | Run only specified agents |
| `codereview --pr 142 --output report.md` | Save report to file |
| `codereview history` | Show recent reviews for configured repo |
| `codereview auth login` | Authenticate CLI with platform API key |
| `codereview config set repo owner/repo` | Set default repository |

## 12. Non-Functional Requirements

- **Latency:** A full review pipeline should complete within 90 seconds for a standard PR of under 500 lines changed. Discovery and agent runs may execute in parallel where the Orchestrator determines ordering allows it.
- **Reliability:** If one agent fails, the Orchestrator retries up to two times before marking that agent's output as unavailable and proceeding. A partial report is better than no report.
- **Scalability:** The AI Orchestration Service is the bottleneck. It must be horizontally scalable — multiple instances can consume from the same RabbitMQ queue. Redis shared state ensures agents running on different instances still share context.
- **Security:** API keys are hashed before storage. GitHub tokens are encrypted at rest. No PR diff content is logged — only metadata. All inter-service communication within the platform is internal network only, not publicly exposed.
- **Observability:** Every service emits structured logs. Every RabbitMQ message is logged with job ID. Review job status is always queryable — nothing is fire-and-forget without a traceable state record.

## 13. What This System Demonstrates

| Skill | Where It Shows |
|---|---|
| Next.js — App Router, SSR, Server and Client Components | Web dashboard |
| Express.js and TypeScript | All three microservices and the gateway |
| Microservices architecture and boundary design | Four independent services with clear domain ownership |
| Asynchronous communication via message queue | RabbitMQ between all services |
| Real-time streaming | SSE for live agent progress in the dashboard and CLI |
| Multi-agent AI orchestration | Python LangGraph pipeline |
| Context-adaptive AI reasoning | Dynamic prompt construction per agent |
| Human-in-the-loop system design | Feedback agent and selective re-run loop |
| Database design and migrations | PostgreSQL with Prisma |
| Caching strategy | Redis for agent state and session caching |
| Authentication and authorization | GitHub OAuth and JWT |
| Containerized deployment | Full Docker Compose setup |
| API design | RESTful gateway with consistent contracts |
| System design thinking | Five-layer architecture with reasoned boundaries |

## 14. Out of Scope For Version 1

- Support for GitLab or Bitbucket — GitHub only in V1.
- Self-hosted model support — Claude API only in V1.
- Browser extension or IDE plugin.
- Billing and usage metering.
- Organization-level SSO.
- Mobile application.

Document ends. Version 2.0 — Ready for implementation planning.
