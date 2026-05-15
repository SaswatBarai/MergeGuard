## Phase 1: Project Scaffolding & Monorepo Setup

### Phase Overview
This phase establishes the foundational architecture and repository structure for the AI-Powered Multi-Agent Code Review Platform. Because the platform relies on two distinct technology stacks — TypeScript (for the Web Dashboard, API Gateway, and Microservices) and Python (for the AI Orchestration Layer) — a well-organized monorepo is critical. This phase ensures that all services exist, can be developed locally with hot-reloading, and have their respective linting, testing, and formatting tools configured correctly. It sets the baseline for the multi-service architecture outlined in the PRD.

### Detailed Implementation Guide
1. **Monorepo Initialization**: Set up a monorepo using Turborepo or npm workspaces to manage the TypeScript microservices (`api-gateway`, `auth-service`, `review-service`, `notification-service`) and the Next.js frontend (`web-dashboard`). Create a separate top-level directory (e.g., `ai-orchestrator`) for the Python service.
2. **TypeScript Tooling**: In the TS workspace, configure a shared `tsconfig.json`, set up `eslint` and `prettier` for consistent styling, and configure `Jest` for unit testing.
3. **Python Tooling**: In the Python directory, initialize a project using `uv` for dependency management. Set up `ruff` for fast linting and formatting, and configure `pytest` with `pytest-mock` for testing.
4. **Service Scaffolding**: Create the basic directory structure and a "Hello World" endpoint/script for the API Gateway, Auth Service, Review Service, Notification Service (all Express.js), and the AI Orchestrator (Python).
5. **Docker Compose Setup**: Create individual `Dockerfile`s for local development for each service. Write a root `docker-compose.yml` that starts all these services simultaneously, mounting local volumes to enable hot-reloading without rebuilding images.

### Tasks to complete
- [x] Initialize a monorepo structure (e.g., using Turborepo or npm workspaces) for TypeScript services and a separate directory for Python services.
- [x] Set up foundational tooling: TypeScript config, ESLint, Prettier, Jest for TS; Pytest, Ruff, and uv for Python.
- [x] Create empty scaffolding for all microservices (API Gateway, Auth, Review, Notification) and the AI Orchestrator.
- [x] Set up basic Dockerfiles and a `docker-compose.yml` for local development.

### Completion check
- [x] All service directories exist with basic "Hello World" endpoints/scripts.
- [x] `docker-compose up` successfully starts all placeholder services without crashing.
