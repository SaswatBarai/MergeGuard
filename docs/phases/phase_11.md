## Phase 11: Review Service & Server-Sent Events (SSE)

### Phase Overview
This phase implements the Review Service, the core orchestrator of the TypeScript backend. It bridges the gap between the client interfaces (CLI/Web) and the Python AI Orchestrator by managing jobs, handling database persistence, and streaming real-time execution updates back to the clients using Server-Sent Events (SSE).

### Detailed Implementation Guide
1. **API Endpoints**: Implement Express.js endpoints to create a review (`POST /reviews`), fetch status (`GET /reviews/:id`), and provide feedback (`POST /reviews/:id/feedback`).
2. **SSE Streaming**: Implement an SSE endpoint (`GET /reviews/:id/stream`) that clients can connect to. Ensure the connection is kept alive.
3. **Job Initiation**: When a review is created, save the initial state (`queued`) to PostgreSQL via Prisma and publish a `ReviewJobRequested` message to RabbitMQ containing the PR details.
4. **RabbitMQ Consumer**: Listen for messages from the Python Orchestrator (e.g., `AgentStatusUpdate`, `SummaryReady`, `ReviewJobCompleted`).
5. **Real-time Broadcast**: When status updates arrive from RabbitMQ, broadcast them immediately to the connected client via the SSE stream so the UI can update live.
6. **Persistence**: When the job completes, fetch the final report from Redis, save it permanently to the `FinalReport` table in PostgreSQL, and upload the raw markdown document to AWS S3 (or local MinIO) for archival.

### Tasks to complete
- Implement the Review Service endpoints (create review, get status).
- Implement Server-Sent Events (SSE) to stream real-time agent execution status to clients.
- Handle database operations: saving the initial job, updating status based on RabbitMQ events, and saving the final report to PostgreSQL.
- Setup AWS S3 (or local MinIO) integration for storing large final reports.

### Completion check
- [x] A client can initiate a review via API, connect to the SSE endpoint, and receive real-time status updates as the Python orchestrator processes the job.
- [x] Database persistence for jobs, findings, and summaries implemented.
- [x] Kafka events bridge Orchestrator and Review Service.
- [ ] AWS S3 / MinIO integration for raw markdown archival (to be completed in infra step).
