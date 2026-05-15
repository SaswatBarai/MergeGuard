## Phase 5: Message Broker & Cache (RabbitMQ & Redis)

### Phase Overview
This phase introduces the async infrastructure that connects the synchronous TypeScript web layer with the heavy, long-running Python AI orchestration layer. By implementing RabbitMQ, the system decouples review job submission from AI execution, allowing the platform to scale and handle long processing times. Redis is introduced to serve as a shared, high-speed cache for agent states, allowing the AI agents to seamlessly read the Context Profile and each other's findings.

### Detailed Implementation Guide
1. **Infrastructure Provisioning**: Add RabbitMQ and Redis images to the `docker-compose.yml` file. Ensure they are exposed to both the TypeScript and Python network layers.
2. **TypeScript Publisher/Consumer**: In a shared TS library or within the Review Service, implement RabbitMQ connection logic using `amqplib`. Create helper functions to publish a `ReviewJob` message (containing PR details and config) to a specific exchange/queue.
3. **Python Broker Connection**: In the Python AI Orchestrator, integrate `pika` or `aio_pika` to consume messages from the RabbitMQ review queue. Also, integrate `redis-py` to establish a connection to the Redis cache.
4. **Message Schema Definition**: Define strict JSON schemas for the messages passed through RabbitMQ (e.g., `ReviewJobRequested`, `ReviewJobCompleted`, `AgentStatusUpdate`).
5. **Redis State Management**: Establish a naming convention for Redis keys to store agent states during a review run (e.g., `review:<job_id>:context`, `review:<job_id>:security_findings`).

### Tasks to complete
- Add RabbitMQ and Redis to `docker-compose.yml`.
- Implement a RabbitMQ publisher/consumer shared library or utility for TypeScript services.
- Implement RabbitMQ and Redis connection logic in the Python AI Orchestrator.
- Define the message schema for Review Jobs and AI Results.

### Completion check
- [ ] TypeScript service can publish a test message to RabbitMQ.
- [ ] Python service can consume the message from RabbitMQ and write state to Redis.
