export type ReviewStatus = "running" | "blocked" | "passed" | "queued"
export type RiskLevel = "low" | "medium" | "high"
export type AgentStatus = "complete" | "running" | "queued" | "blocked"

export type ReviewAgent = {
  name: string
  status: AgentStatus
  progress: number
  findingCount: number
  currentStep: string
}

export type ReviewCheck = {
  label: string
  status: "passed" | "warning" | "failed" | "pending"
  detail: string
}

export type ReviewEvent = {
  time: string
  source: string
  message: string
  tone: "info" | "success" | "warning" | "danger"
}

export type ReviewJob = {
  id: string
  repo: string
  prNumber: number
  title: string
  branch: string
  targetBranch: string
  author: string
  status: ReviewStatus
  riskLevel: RiskLevel
  createdAt: string
  updatedAt: string
  summary: string
  agents: ReviewAgent[]
  checks: ReviewCheck[]
  events: ReviewEvent[]
  report: string[]
}

export type Repository = {
  id: string
  name: string
  provider: "GitHub"
  defaultBranch: string
  connected: boolean
  openPullRequests: number
}

export type ApiKey = {
  id: string
  label: string
  maskedToken: string
  scopes: string[]
  createdAt: string
  lastUsedAt: string
}

export const currentUser = {
  name: "Saswat Barai",
  handle: "@saswat",
  email: "saswat@mergeguard.dev",
  org: "Acme Engineering",
}

const repositories: Repository[] = [
  {
    id: "repo-api",
    name: "acme/api",
    provider: "GitHub",
    defaultBranch: "main",
    connected: true,
    openPullRequests: 18,
  },
  {
    id: "repo-frontend",
    name: "acme/frontend",
    provider: "GitHub",
    defaultBranch: "main",
    connected: true,
    openPullRequests: 11,
  },
  {
    id: "repo-infra",
    name: "acme/infra",
    provider: "GitHub",
    defaultBranch: "production",
    connected: true,
    openPullRequests: 5,
  },
]

const sharedChecks: ReviewCheck[] = [
  {
    label: "Merge conflicts",
    status: "passed",
    detail: "No conflicting files against main.",
  },
  {
    label: "Required reviewers",
    status: "passed",
    detail: "2 approvals detected from code owners.",
  },
  {
    label: "Secrets scan",
    status: "passed",
    detail: "No tokens or private keys found in diff.",
  },
  {
    label: "Policy: signed commits",
    status: "warning",
    detail: "One squash commit will need a verified signature.",
  },
]

const reviews: ReviewJob[] = [
  {
    id: "rev-2847",
    repo: "acme/api",
    prNumber: 2847,
    title: "Refactor authentication middleware",
    branch: "feature/auth-refactor",
    targetBranch: "main",
    author: "maya",
    status: "running",
    riskLevel: "medium",
    createdAt: "2026-05-17T08:10:00+05:30",
    updatedAt: "2026-05-17T08:16:00+05:30",
    summary:
      "Authentication flow is structurally sound, with one policy warning around commit verification and two logic areas under review.",
    agents: [
      {
        name: "Security",
        status: "complete",
        progress: 100,
        findingCount: 0,
        currentStep: "Dependency and secret scan complete",
      },
      {
        name: "Logic",
        status: "running",
        progress: 68,
        findingCount: 2,
        currentStep: "Tracing refresh-token branch behavior",
      },
      {
        name: "Policy",
        status: "complete",
        progress: 100,
        findingCount: 1,
        currentStep: "Repository rules evaluated",
      },
      {
        name: "Style",
        status: "queued",
        progress: 12,
        findingCount: 0,
        currentStep: "Waiting for logic agent handoff",
      },
    ],
    checks: sharedChecks,
    events: [
      {
        time: "08:10:22",
        source: "orchestrator",
        message: "Review job accepted for acme/api PR #2847.",
        tone: "info",
      },
      {
        time: "08:11:04",
        source: "security",
        message: "Secret scan and dependency audit completed with no findings.",
        tone: "success",
      },
      {
        time: "08:13:38",
        source: "logic",
        message: "Potential stale session branch detected in middleware fallback.",
        tone: "warning",
      },
      {
        time: "08:15:12",
        source: "policy",
        message: "Signed commit rule needs verification before merge.",
        tone: "warning",
      },
      {
        time: "08:16:02",
        source: "orchestrator",
        message: "Final report is being assembled from agent findings.",
        tone: "info",
      },
    ],
    report: [
      "MergeGuard found no merge conflicts and no exposed secrets in this pull request.",
      "The auth middleware refactor keeps the main request path stable. The only material concern is the fallback branch for stale refresh tokens, which should be covered with an explicit regression test before merge.",
      "Policy status is almost clean. Verify the squash commit signature and rerun the final style pass once the logic note is addressed.",
    ],
  },
  {
    id: "rev-2819",
    repo: "acme/frontend",
    prNumber: 2819,
    title: "Add repository onboarding checklist",
    branch: "feature/onboarding-checklist",
    targetBranch: "main",
    author: "devon",
    status: "passed",
    riskLevel: "low",
    createdAt: "2026-05-16T18:45:00+05:30",
    updatedAt: "2026-05-16T18:49:00+05:30",
    summary:
      "Checklist UI is safe to merge. Accessibility checks and branch policies passed.",
    agents: [
      {
        name: "Security",
        status: "complete",
        progress: 100,
        findingCount: 0,
        currentStep: "Complete",
      },
      {
        name: "Logic",
        status: "complete",
        progress: 100,
        findingCount: 0,
        currentStep: "Complete",
      },
      {
        name: "Policy",
        status: "complete",
        progress: 100,
        findingCount: 0,
        currentStep: "Complete",
      },
    ],
    checks: sharedChecks.map((check) => ({ ...check, status: "passed" })),
    events: [],
    report: ["No blocking findings. This review can merge after CI completes."],
  },
  {
    id: "rev-2798",
    repo: "acme/infra",
    prNumber: 2798,
    title: "Rotate production deploy role",
    branch: "chore/iam-rotation",
    targetBranch: "production",
    author: "nina",
    status: "blocked",
    riskLevel: "high",
    createdAt: "2026-05-15T12:20:00+05:30",
    updatedAt: "2026-05-15T12:23:00+05:30",
    summary:
      "Deployment role rotation changes a protected permission boundary and needs security approval.",
    agents: [
      {
        name: "Security",
        status: "blocked",
        progress: 82,
        findingCount: 3,
        currentStep: "Permission boundary requires approval",
      },
      {
        name: "Policy",
        status: "blocked",
        progress: 76,
        findingCount: 2,
        currentStep: "Production policy gate failed",
      },
    ],
    checks: [
      ...sharedChecks.slice(0, 2),
      {
        label: "Privileged access",
        status: "failed",
        detail: "Permission boundary grants deploy role wildcard pass-role.",
      },
    ],
    events: [],
    report: [
      "Merge is blocked until the deployment role boundary is narrowed and reviewed by security.",
    ],
  },
]

const apiKeys: ApiKey[] = [
  {
    id: "key-cli",
    label: "CLI local development",
    maskedToken: "mg_live_••••••••4f2a",
    scopes: ["repo:read", "review:write"],
    createdAt: "2026-05-04",
    lastUsedAt: "Today, 08:12",
  },
  {
    id: "key-ci",
    label: "GitHub Actions runner",
    maskedToken: "mg_live_••••••••91bc",
    scopes: ["repo:read", "review:write", "policy:read"],
    createdAt: "2026-04-22",
    lastUsedAt: "Yesterday, 21:44",
  },
]

export function getRepositories() {
  return repositories
}

export function getReviewJobs() {
  return reviews
}

export function getReviewJob(id: string) {
  return reviews.find((review) => review.id === id)
}

export function getApiKeys() {
  return apiKeys
}
