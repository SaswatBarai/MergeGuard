## Phase 12: Notification Service

### Phase Overview
This phase implements the Notification Service, which operates reactively by listening to event streams. It alerts teams when a code review completes, delivering the final summary to platforms where developers already work, such as Slack and GitHub PR comments, preventing the need to constantly check the dashboard.

### Detailed Implementation Guide
1. **Service Initialization**: Scaffold the Notification Service using Express.js and TypeScript, connecting it to the shared Prisma client.
2. **Event Consumer**: Set up a RabbitMQ consumer listening specifically for `ReviewJobCompleted` events on a fanout or topic exchange.
3. **Slack Integration**: Integrate the Slack API using incoming webhooks or the Slack SDK to post a cleanly formatted summary message (using Slack Block Kit) into configured team channels.
4. **GitHub Integration**: Integrate the GitHub API to optionally post the final review summary as a comment directly on the pull request, providing feedback right where the code lives.
5. **Preferences**: Before sending any notification, query the database (via Prisma) to check the user's or repository's notification preferences to respect opt-outs.

### Tasks to complete
- Implement the Notification Service.
- Set up a consumer to listen for "Review Completed" events on RabbitMQ.
- Implement Slack webhook integration.
- Implement GitHub API integration to optionally post review summaries as PR comments.

### Completion check
- [ ] A completed review event triggers a simulated or real Slack message and a GitHub PR comment.
