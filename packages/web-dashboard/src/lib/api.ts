import axios from "axios"

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mg_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth ────────────────────────────────────────────────────────────────────

export type User = {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  globalRole: string
  accessToken: string
}

export async function getMe() {
  const { data } = await api.get<User>("/auth/me")
  return data
}

export type Repository = {
  id: number
  fullName: string
  githubRepoId: string
  role: string
}

export async function getMyRepositories() {
  const { data } = await api.get<Repository[]>("/auth/me/repositories")
  return data
}

export async function createApiKey(name: string) {
  const { data } = await api.post<{ key: string; name: string }>("/auth/api-keys", { name })
  return data
}

export type ApiKey = {
  id: number
  name: string
  createdAt: string
  lastUsedAt: string | null
}

export async function listApiKeys() {
  const { data } = await api.get<ApiKey[]>("/auth/api-keys")
  return data
}

export async function revokeApiKey(id: number) {
  const { data } = await api.delete(`/auth/api-keys/${id}`)
  return data
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export type AgentResult = {
  id: number
  jobId: number
  agentName: string
  severity: string
  finding: string
  createdAt: string
}

export type FinalReport = {
  id: number
  jobId: number
  reportUrl: string | null
  synthesizedSummary: string
  createdAt: string
}

export type ReviewJob = {
  id: number
  repositoryId: number
  requesterId: number
  prNumber: number
  status: "QUEUED" | "IN_PROGRESS" | "PENDING_FEEDBACK" | "COMPLETED" | "FAILED" | "CANCELLED"
  branchName: string | null
  createdAt: string
  updatedAt: string
  repository: { fullName: string }
  agentResults: AgentResult[]
  finalReport: FinalReport | null
}

export async function listReviews(requesterId: number) {
  const { data } = await api.get<ReviewJob[]>(`/reviews?requesterId=${requesterId}`)
  return data
}

export async function getReview(id: number) {
  const { data } = await api.get<ReviewJob>(`/reviews/${id}`)
  return data
}

export async function createReview(payload: {
  prNumber: number
  repositoryId: number
  branchName?: string
  githubToken: string
  requesterId: number
  fullRepoName: string
}) {
  const { data } = await api.post<ReviewJob>("/reviews", payload)
  return data
}

export async function cancelReview(id: number, requesterId: number) {
  const { data } = await api.post(`/reviews/${id}/cancel`, { requesterId })
  return data as { status: "CANCELLED" }
}

export async function submitFeedback(id: number, feedback: string) {
  const { data } = await api.post(`/reviews/${id}/feedback`, { feedback })
  return data as { status: "accepted" }
}

// SSE stream URL — uses query-param auth because EventSource can't set headers
export function getStreamUrl(reviewId: number) {
  const token = typeof window !== "undefined" ? localStorage.getItem("mg_token") : ""
  return `${API_BASE}/reviews/${reviewId}/stream${token ? `?token=${token}` : ""}`
}
