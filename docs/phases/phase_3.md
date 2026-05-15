## Phase 3: Auth Service & GitHub OAuth Integration

### Phase Overview
This phase introduces identity and access management into the platform by building the Auth Service. Since the platform operates on GitHub repositories, GitHub OAuth is the primary authentication mechanism. This service is responsible for handling the OAuth callback, issuing JWT tokens for web sessions, and managing long-lived API keys for CLI access, ensuring that both web and terminal users have secure access to the API Gateway.

### Detailed Implementation Guide
1. **Express Auth Service**: Scaffold the Auth Service as an Express.js TypeScript application. Connect it to the PostgreSQL database using the Prisma client generated in Phase 2.
2. **GitHub OAuth Flow**: Implement the OAuth 2.0 flow. Create endpoints for initiating the login (`/auth/github`) and handling the callback (`/auth/github/callback`). Exchange the temporary code for a GitHub access token, fetch the user's profile, and upsert the `User` record in the database.
3. **JWT Issuance**: Upon successful GitHub authentication, generate a signed JSON Web Token (JWT) containing the user's ID and basic roles. Return this JWT to the Next.js frontend to maintain session state.
4. **Repository Permissions**: Using the GitHub token, fetch the user's accessible repositories and sync their permissions into the `Repository` tables, ensuring the system knows which PRs the user is authorized to request reviews for.
5. **CLI API Key Management**: Create secure API endpoints (`/auth/api-keys`) that allow an authenticated user to generate, list, and revoke long-lived API keys. Ensure keys are stored hashed in the database (e.g., using bcrypt) for security.

### Tasks to complete
- Implement the GitHub OAuth flow in the Auth Service.
- Set up user creation and JWT issuance upon successful GitHub login.
- Implement repository access permission syncing.
- Create API Key generation and management endpoints for the CLI.

### Completion check
- [ ] User can authenticate via GitHub and receive a valid JWT.
- [ ] User can generate an API key via an API endpoint.
