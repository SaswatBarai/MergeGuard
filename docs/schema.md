# MergeGuard Database Schema Documentation

This document describes the data models and relationships for the AI-Powered Multi-Agent Code Review Platform. The schema is designed for PostgreSQL using Prisma ORM.

## Entity Relationship Diagram (Eraser.io DSL)

```text
users [icon: user, color: blue] {
  id int pk
  github_id string
  email string
  name string
  avatar_url string
  global_role string // ADMIN, USER
}

repository_access [icon: shield, color: red] {
  id int pk
  user_id int
  repository_id int
  role string // MAINTAINER, DEVELOPER, VIEWER
}

repositories [icon: github, color: gray] {
  id int pk
  github_repo_id string
  full_name string
}

api_keys [icon: key, color: yellow] {
  id int pk
  user_id int
  key_hash string
  name string
  last_used_at timestamp
}

review_jobs [icon: git-pull-request, color: orange] {
  id int pk
  repository_id int
  requester_id int
  pr_number int
  status string // QUEUED, IN_PROGRESS, PENDING_FEEDBACK, COMPLETED, FAILED
  branch_name string
  created_at timestamp
  updated_at timestamp
}

agent_results [icon: cpu, color: purple] {
  id int pk
  job_id int
  agent_name string
  severity string // Critical, High, Medium, Low
  finding text
  created_at timestamp
}

final_reports [icon: file-text, color: green] {
  id int pk
  job_id int
  report_url string // Link to S3/MinIO
  synthesized_summary text
  created_at timestamp
}

notification_configs [icon: bell, color: red] {
  id int pk
  user_id int
  type string // SLACK, GITHUB_COMMENT
  webhook_url string
  is_enabled boolean
}

// Relationships
api_keys.user_id > users.id
repositories.id < repository_access.repository_id
users.id < repository_access.user_id

review_jobs.requester_id > users.id
review_jobs.repository_id > repositories.id
agent_results.job_id > review_jobs.id
final_reports.job_id - review_jobs.id
notification_configs.user_id > users.id
```

## Detailed Entity Descriptions

### 1. User (`users`)
The foundation of the platform. Stores identity and global permissions.
- `id`: Internal primary key.
- `github_id`: Anchor to GitHub ecosystem for OAuth.
- `email`: User's email for notifications.
- `name`: Display name.
- `avatar_url`: Link to GitHub profile picture.
- `global_role`: System-wide RBAC (e.g., `ADMIN`, `USER`).

### 2. Repository (`repositories`)
Registry of onboarded GitHub projects.
- `github_repo_id`: Permanent GitHub ID.
- `full_name`: Human-readable name (e.g., `owner/repo`).

### 3. Repository Access (`repository_access`)
The core of Role-Based Access Control (RBAC). Links Users to Repositories with specific permissions.
- `role`: Permission level (`MAINTAINER`, `DEVELOPER`, `VIEWER`).

### 4. API Key (`api_keys`)
Enables secure CLI authentication.
- `key_hash`: One-way hash of the API key for security.
- `name`: Human-readable label (e.g., "Work Laptop").

### 5. Review Job (`review_jobs`)
Tracks a specific Pull Request review event.
- `status`: Current state of the AI orchestration pipeline.
- `pr_number`: Target GitHub PR.
- `branch_name`: Source branch for context.

### 6. Agent Result (`agent_results`)
Raw findings from individual specialized AI agents (Security, Performance, etc.).
- `severity`: Urgency of the finding.
- `finding`: Detailed technical output.

### 7. Final Report (`final_reports`)
The synthesized, user-facing summary of a review job.
- `report_url`: Link to the full Markdown report stored in S3/MinIO.
- `synthesized_summary`: Short "Executive Summary" for quick reading.

### 8. Notification Config (`notification_configs`)
Stores user preferences for where to receive alerts.
- `type`: Target platform (e.g., `SLACK`).
- `webhook_url`: Destination endpoint.

## Data Relationships Summary
- **One-to-Many**: A User can have many API Keys, Repository Access entries, and Review Jobs.
- **Many-to-Many**: Users and Repositories are linked via the `repository_access` bridge table to handle RBAC.
- **One-to-Many**: A Review Job contains findings from many Agents.
- **One-to-One**: A Review Job produces exactly one Final Report.
