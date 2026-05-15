# AI Code Review Platform - Development Phases

This document outlines the 15-phase development plan for the AI-Powered Multi-Agent Code Review Platform, based on the Product Requirements Document and the AWS EKS Architecture diagram.

## Phase 1: Project Scaffolding & Monorepo Setup
**Tasks to complete:**
- Initialize a monorepo structure (e.g., using Turborepo or npm workspaces) for TypeScript services and a separate directory for Python services.
- Set up foundational tooling: TypeScript config, ESLint, Prettier, Jest for TS; Pytest, Ruff, and uv for Python.
- Create empty scaffolding for all microservices (API Gateway, Auth, Review, Notification) and the AI Orchestrator.
- Set up basic Dockerfiles and a `docker-compose.yml` for local development.

**Completion check:**
- [ ] All service directories exist with basic "Hello World" endpoints/scripts.
- [ ] `docker-compose up` successfully starts all placeholder services without crashing.

## Phase 2: Database & Core Data Models (Prisma)
**Tasks to complete:**
- Provision a local PostgreSQL database via Docker.
- Initialize Prisma in the TypeScript shared library or directly in the respective services (Auth, Review, Notification).
- Define the core schema: Users, Profiles, Repositories, Jobs/Reviews, Agent Results, and Final Reports.
- Generate Prisma clients and write initial database migration scripts.

**Completion check:**
- [ ] Database migrations run successfully against the local PostgreSQL instance.
- [ ] Prisma client is importable and can perform basic CRUD operations in a test script.

## Phase 3: Auth Service & GitHub OAuth Integration
**Tasks to complete:**
- Implement the GitHub OAuth flow in the Auth Service.
- Set up user creation and JWT issuance upon successful GitHub login.
- Implement repository access permission syncing.
- Create API Key generation and management endpoints for the CLI.

**Completion check:**
- [ ] User can authenticate via GitHub and receive a valid JWT.
- [ ] User can generate an API key via an API endpoint.

## Phase 4: API Gateway & Request Routing
**Tasks to complete:**
- Implement the Express.js API Gateway.
- Set up JWT validation middleware to protect downstream routes.
- Configure rate limiting and consistent request logging.
- Set up proxy routing to the Auth Service (and placeholder routes for Review/Notification).

**Completion check:**
- [ ] Unauthenticated requests to protected routes return 401 Unauthorized.
- [ ] Authenticated requests route correctly to the Auth service and return valid responses.

## Phase 5: Message Broker & Cache (RabbitMQ & Redis)
**Tasks to complete:**
- Add RabbitMQ and Redis to `docker-compose.yml`.
- Implement a RabbitMQ publisher/consumer shared library or utility for TypeScript services.
- Implement RabbitMQ and Redis connection logic in the Python AI Orchestrator.
- Define the message schema for Review Jobs and AI Results.

**Completion check:**
- [ ] TypeScript service can publish a test message to RabbitMQ.
- [ ] Python service can consume the message from RabbitMQ and write state to Redis.

## Phase 6: Python AI Orchestrator & LangGraph Foundation
**Tasks to complete:**
- Set up the LangGraph environment in the Python AI Orchestrator service.
- Integrate the Anthropic Claude API SDK.
- Create the core graph structure with placeholder nodes for all agents (Discovery, Security, etc.).
- Implement the orchestration logic to decide the execution path based on dummy state.

**Completion check:**
- [ ] The LangGraph pipeline can execute from start to finish with dummy nodes.
- [ ] The service can successfully invoke the Claude API with a simple test prompt.

## Phase 7: Discovery Agent (Phase 0) & Context Profiling
**Tasks to complete:**
- Implement the PR Reader and Discovery Agent in Python.
- Integrate GitHub API calls to fetch PR diffs, file lists, and metadata.
- Write logic to analyze extensions, imports, and manifests to build the `Context Profile`.
- Ensure the Orchestrator halts or proceeds based on the successful creation of this profile.

**Completion check:**
- [ ] The Discovery Agent can process a real GitHub PR URL and output a structured `Context Profile` to Redis detailing language, framework, and db layer.

## Phase 8: Core AI Agents - Security & Performance
**Tasks to complete:**
- Implement the Security Analyst agent with adaptive Jinja2 prompt templates based on the Context Profile.
- Implement the Performance Analyst agent with adaptive prompts.
- Ensure these agents correctly read the Context Profile from Redis before execution.
- Wire these agents into the LangGraph orchestrator.

**Completion check:**
- [ ] Both agents generate findings classified by severity (Critical, High, Medium, Low) based on a sample PR.
- [ ] Agent outputs are successfully saved to the shared Redis state.

## Phase 9: Core AI Agents - Testing, Architecture, & Readability
**Tasks to complete:**
- Implement the Test Coverage Analyst agent.
- Implement the Architecture Reviewer agent.
- Implement the Readability and Maintainability Reviewer agent.
- Build the dynamic prompt construction logic using Jinja2 for all three.
- Wire these into the Orchestrator parallel execution paths.

**Completion check:**
- [ ] All three agents run successfully against a sample PR and produce structured findings tailored to the detected language/framework.

## Phase 10: Summary & Feedback Agents (Human-in-the-loop)
**Tasks to complete:**
- Implement the Summary Agent to synthesize all findings from Redis into a cohesive report.
- Implement the Feedback Agent logic to pause the graph execution and wait for user input.
- Create the feedback loop mechanism in the Orchestrator to selectively re-run specific agents based on input.

**Completion check:**
- [ ] The AI Orchestrator pauses and outputs a synthesized summary.
- [ ] Injecting mock user feedback ("ignore performance") triggers a partial pipeline re-run successfully.

## Phase 11: Review Service & Server-Sent Events (SSE)
**Tasks to complete:**
- Implement the Review Service endpoints (create review, get status).
- Implement Server-Sent Events (SSE) to stream real-time agent execution status to clients.
- Handle database operations: saving the initial job, updating status based on RabbitMQ events, and saving the final report to PostgreSQL.
- Setup AWS S3 (or local MinIO) integration for storing large final reports.

**Completion check:**
- [ ] A client can initiate a review via API, connect to the SSE endpoint, and receive real-time status updates as the Python orchestrator processes the job.

## Phase 12: Notification Service
**Tasks to complete:**
- Implement the Notification Service.
- Set up a consumer to listen for "Review Completed" events on RabbitMQ.
- Implement Slack webhook integration.
- Implement GitHub API integration to optionally post review summaries as PR comments.

**Completion check:**
- [ ] A completed review event triggers a simulated or real Slack message and a GitHub PR comment.

## Phase 13: CLI Application (Python)
**Tasks to complete:**
- Build the Typer + Rich CLI application.
- Implement `auth login` and config management.
- Implement the `codereview --pr <id>` command.
- Implement the logic to poll/stream SSE for real-time terminal output.
- Implement the interactive prompt for the human-in-the-loop feedback phase.

**Completion check:**
- [ ] User can authenticate the CLI.
- [ ] User can submit a PR for review, watch live progress in the terminal, provide feedback, and receive the final rendered markdown report.

## Phase 14: Web Dashboard (Next.js)
**Tasks to complete:**
- Set up the Next.js App Router project with Tailwind CSS (or standard CSS as preferred).
- Implement GitHub OAuth login via NextAuth.js or custom Auth service integration.
- Build the Dashboard Home, PR Review Detail (with SSE integration), and Review History pages.
- Implement the Feedback Interface UI.

**Completion check:**
- [ ] User can log in, view review history, initiate a new review, watch live SSE updates on the dashboard, and submit feedback via the UI.

## Phase 15: Production Deployment & AWS/EKS Setup
**Tasks to complete:**
- Finalize Dockerfiles and set up GitHub Actions CI/CD to push images to AWS ECR.
- Define Kubernetes manifests (or Helm charts) for all services, Ingress Controller, and monitoring stack.
- Provision the AWS infrastructure (VPC, EKS, RDS PostgreSQL, ElastiCache Redis, Amazon MQ RabbitMQ, ALB) using Terraform or similar.
- Deploy the application and configure Route53 and CloudFront.

**Completion check:**
- [ ] The platform is accessible via a public domain.
- [ ] Both the CLI and Web Dashboard can successfully execute a full review pipeline against the deployed Kubernetes cluster.
