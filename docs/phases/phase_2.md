## Phase 2: Database & Core Data Models (Prisma)

### Phase Overview
This phase implements the persistent storage layer for the platform's microservices. Following the architectural design, PostgreSQL is used as the primary database. To ensure type safety and seamless integration with the TypeScript Express.js microservices, Prisma ORM is utilized. This phase establishes the core entities needed to track users, repositories, review jobs, individual agent findings, and the final synthesized reports.

### Detailed Implementation Guide
1. **Schema Design & Documentation**: Design the core data models including RBAC, Audit Trails, and specialized agent results. Document the schema in `docs/schema.md`.
2. **Database Provisioning**: Add a PostgreSQL container to the existing `docker-compose.yml` to serve as the local development database.
2. **Prisma Setup**: Initialize Prisma (`npx prisma init`) within a shared TypeScript package (e.g., `packages/db`) or directly within the services that need database access (Auth, Review, Notification).
3. **Schema Definition**: Define the `schema.prisma` file with the core data models:
   - `User`: Stores GitHub profile data, OAuth tokens, and system preferences.
   - `Repository`: Stores configured repositories and access permissions.
   - `ReviewJob`: Tracks the state of a PR review (queued, in-progress, pending_feedback, completed).
   - `AgentResult`: Stores the raw output and findings from individual specialized agents.
   - `FinalReport`: Stores the synthesized, user-approved final code review report.
4. **Client Generation & Migrations**: Run `prisma migrate dev` to create the initial database tables and generate the Prisma Client. Export this client so it can be used across the TypeScript microservices to perform strongly-typed CRUD operations.

### Tasks to complete
- [x] Provision a local PostgreSQL database via Docker.
- [x] Initialize Prisma in the TypeScript shared library or directly in the respective services (Auth, Review, Notification).
- [x] Define the core schema: Users, Profiles, Repositories, Jobs/Reviews, Agent Results, and Final Reports.
- [x] Generate Prisma clients and write initial database migration scripts.

### Completion check
- [x] Database migrations run successfully against the local PostgreSQL instance.
- [x] Prisma client is importable and can perform basic CRUD operations in a test script.
