## Phase 14: Web Dashboard (Next.js)

### Phase Overview
This phase builds the primary interface for engineering teams and managers to view code quality trends, configure repository settings, and interact with live reviews in a rich browser environment. It utilizes Next.js App Router for optimal performance.

### Detailed Implementation Guide
1. **Frontend Scaffolding**: Scaffold the Next.js 14 App Router project using TypeScript and Vanilla CSS (or Tailwind CSS if preferred by the team).
2. **Authentication**: Implement GitHub OAuth login. Use NextAuth.js or directly integrate with the backend Auth Service's JWT flow to manage user sessions.
3. **Dashboard & History**: Build the Dashboard Home page (using Server Components) to display recent reviews and team activity. Build a Review History page with filtering capabilities.
4. **Live Review Detail Page**: Build the PR Review Detail page (using Client/Mixed Components). This page must connect to the backend's SSE endpoint via the browser's `EventSource` API to show real-time agent status updates visually.
5. **Feedback UI**: Implement the interactive Feedback UI on the Review Detail page to display the summary when the orchestrator pauses, and provide a form to collect user text input for the AI re-run loop.
6. **Settings Pages**: Build interfaces for Repository Settings (configuring which agents run, thresholds) and API Key management for the CLI.

### Tasks to complete
- Set up the Next.js App Router project with Tailwind CSS (or standard CSS as preferred).
- Implement GitHub OAuth login via NextAuth.js or custom Auth service integration.
- Build the Dashboard Home, PR Review Detail (with SSE integration), and Review History pages.
- Implement the Feedback Interface UI.

### Completion check
- [ ] User can log in, view review history, initiate a new review, watch live SSE updates on the dashboard, and submit feedback via the UI.
