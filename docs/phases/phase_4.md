## Phase 4: API Gateway & Request Routing

### Phase Overview
The API Gateway serves as the single, unified entry point for all incoming HTTP traffic from both the Web Dashboard and the CLI Tool. This phase implements the Gateway to abstract the complexity of the microservices layer away from the clients. It is responsible for cross-cutting concerns like authentication validation, rate limiting, logging, and routing requests to the appropriate downstream microservice (Auth, Review, or Notification).

### Detailed Implementation Guide
1. **Gateway Initialization**: Build the API Gateway using Express.js and TypeScript.
2. **Authentication Middleware**: Implement middleware that intercepts incoming requests and validates authentication credentials.
   - For web dashboard requests, expect and verify the JWT (issued by the Auth Service) in the `Authorization: Bearer <token>` header.
   - For CLI requests, expect and verify the API Key. The Gateway must query the Auth Service (via internal network) to validate the API Key.
3. **Security & Rate Limiting**: Integrate `express-rate-limit` to prevent abuse. Configure varying limits for CLI API keys vs. web users. Set up request logging (e.g., using Morgan or Winston) to provide observability for every request entering the system.
4. **Proxy Routing**: Use a library like `http-proxy-middleware` to forward validated requests to the internal microservices.
   - `/api/auth/*` routes to the Auth Service.
   - `/api/reviews/*` routes to the Review Service.
   - `/api/notifications/*` routes to the Notification Service.

### Tasks to complete
- [x] Implement the Express.js API Gateway.
- [x] Set up JWT validation middleware to protect downstream routes.
- [x] Configure rate limiting and consistent request logging.
- [x] Set up proxy routing to the Auth Service (and placeholder routes for Review/Notification).

### Completion check
- [x] Unauthenticated requests to protected routes return 401 Unauthorized.
- [x] Authenticated requests route correctly to the Auth service and return valid responses.
