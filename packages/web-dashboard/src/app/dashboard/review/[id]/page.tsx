"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileText,
  GitPullRequest,
  Info,
  Radio,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import { reviewStatusTone, severityTone, StatusBadge, statusLabel } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { cancelReview, getReview, submitFeedback, type AgentResult, type ReviewJob } from "@/lib/api"
import { useReviewStream } from "@/hooks/useReviewStream"
import { useCurrentUser } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type StructuredReport = {
  executive_summary?: string
  critical_blockers?: string[]
  important_suggestions?: string[]
  minor_notes?: string[]
  overall_recommendation?: string
}

function parseReport(raw: string): StructuredReport | null {
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === "object" && parsed !== null && "executive_summary" in parsed) {
      return parsed as StructuredReport
    }
  } catch {}
  return null
}

function RecommendationPill({ value }: { value: string }) {
  const upper = value.toUpperCase()
  const styles =
    upper === "APPROVE"
      ? "border-emerald-300/50 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
      : upper === "REQUEST CHANGES" || upper === "REJECT"
      ? "border-red-300/50 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
      : "border-amber-300/50 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300"
  const Icon =
    upper === "APPROVE" ? ShieldCheck : upper.startsWith("REQUEST") ? XCircle : AlertTriangle
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold", styles)}>
      <Icon className="size-4" />
      {value}
    </span>
  )
}

function FinalReportCard({ report, reportUrl }: { report: string; reportUrl: string | null }) {
  const structured = parseReport(report)

  if (!structured) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">{report}</p>
        {reportUrl && (
          <a href={reportUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline dark:text-violet-300">
            <FileText className="size-4" /> View full report
          </a>
        )}
      </div>
    )
  }

  const sections: Array<{
    key: keyof StructuredReport
    label: string
    icon: React.ElementType
    itemStyle: string
    dotStyle: string
    emptyLabel: string
  }> = [
    {
      key: "critical_blockers",
      label: "Critical blockers",
      icon: XCircle,
      itemStyle: "border-red-200/60 bg-red-50/60 text-red-700 dark:border-red-400/15 dark:bg-red-400/8 dark:text-red-300",
      dotStyle: "bg-red-500 dark:bg-red-400",
      emptyLabel: "No critical blockers found",
    },
    {
      key: "important_suggestions",
      label: "Important suggestions",
      icon: AlertTriangle,
      itemStyle: "border-amber-200/60 bg-amber-50/60 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/8 dark:text-amber-300",
      dotStyle: "bg-amber-500 dark:bg-amber-400",
      emptyLabel: "No important suggestions",
    },
    {
      key: "minor_notes",
      label: "Minor notes",
      icon: Info,
      itemStyle: "border-black/8 bg-black/[0.02] text-zinc-600 dark:border-white/8 dark:bg-white/[0.03] dark:text-zinc-300",
      dotStyle: "bg-zinc-400 dark:bg-zinc-500",
      emptyLabel: "No minor notes",
    },
  ]

  return (
    <div className="divide-y divide-black/6 dark:divide-white/6">
      {/* Recommendation banner */}
      {structured.overall_recommendation && (
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Recommendation
            </p>
            <div className="mt-2">
              <RecommendationPill value={structured.overall_recommendation} />
            </div>
          </div>
          {structured.overall_recommendation.toUpperCase() === "APPROVE" && (
            <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <CheckCircle2 className="size-6 text-emerald-500 dark:text-emerald-300" />
            </div>
          )}
        </div>
      )}

      {/* Executive summary */}
      {structured.executive_summary && (
        <div className="px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 mb-3">
            Executive summary
          </p>
          <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            {structured.executive_summary}
          </p>
        </div>
      )}

      {/* Blockers / suggestions / notes */}
      {sections.map(({ key, label, icon: Icon, itemStyle, dotStyle, emptyLabel }) => {
        const items = structured[key] as string[] | undefined
        return (
          <div key={key} className="px-6 py-5">
            <div className="mb-3 flex items-center gap-2">
              <Icon className="size-3.5 text-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                {label}
              </p>
              {items && items.length > 0 && (
                <span className="rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                  {items.length}
                </span>
              )}
            </div>
            {!items || items.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">{emptyLabel}</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-6",
                      itemStyle
                    )}
                  >
                    <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", dotStyle)} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}

      {reportUrl && (
        <div className="px-6 py-4">
          <a href={reportUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline dark:text-violet-300">
            <FileText className="size-4" /> View full report
          </a>
        </div>
      )}
    </div>
  )
}

function groupByAgent(results: AgentResult[]): Map<string, AgentResult[]> {
  const map = new Map<string, AgentResult[]>()
  for (const r of results) {
    const existing = map.get(r.agentName) ?? []
    existing.push(r)
    map.set(r.agentName, existing)
  }
  return map
}

const ACTIVE_STATUSES = new Set(["QUEUED", "IN_PROGRESS"])

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id as string)
  const { user } = useCurrentUser()

  const [review, setReview] = useState<ReviewJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)

  const isActive = ACTIVE_STATUSES.has(review?.status ?? "")
  const { events: streamEvents, connected } = useReviewStream(id, isActive)

  const fetchReview = useCallback(async () => {
    try {
      const data = await getReview(id)
      setReview(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  // Poll every 5s while active (SSE handles real-time events, polling keeps status fresh)
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(fetchReview, 5000)
    return () => clearInterval(interval)
  }, [isActive, fetchReview])

  // Re-fetch when stream signals job completion
  useEffect(() => {
    const last = streamEvents[streamEvents.length - 1]
    if (last?.type === "job_completed") fetchReview()
  }, [streamEvents, fetchReview])

  async function handleCancel() {
    if (!user || !review) return
    setCancelling(true)
    try {
      await cancelReview(review.id, user.id)
      await fetchReview()
    } finally {
      setCancelling(false)
    }
  }

  async function handleFeedback() {
    if (!review || !feedback.trim()) return
    setSubmittingFeedback(true)
    try {
      await submitFeedback(review.id, feedback.trim())
      setFeedbackSent(true)
      setFeedback("")
      setTimeout(fetchReview, 1000)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (notFound || !review) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
        <p className="text-zinc-400">Review not found.</p>
      </div>
    )
  }

  const grouped = groupByAgent(review.agentResults ?? [])
  const totalFindings = review.agentResults?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-foreground dark:hover:text-zinc-200"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-2">
          {review.status === "QUEUED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
              className="gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-400/10"
            >
              <XCircle className="size-4" />
              {cancelling ? "Cancelling…" : "Cancel review"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReview}
            className="gap-2 text-zinc-400 hover:text-foreground"
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Header card */}
      <section className="relative overflow-hidden rounded-[30px] border border-black/8 bg-white dark:border-white/8 dark:bg-[#111114]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.07),transparent_30%),radial-gradient(circle_at_75%_30%,rgba(56,189,248,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_75%_30%,rgba(56,189,248,0.1),transparent_24%)]" />
        <div className="relative flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-7">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary dark:border-violet-300/15 dark:bg-violet-400/12 dark:text-violet-200">
                <GitPullRequest className="size-4" />
              </div>
              <p className="font-medium text-foreground dark:text-white">
                {review.repository?.fullName ?? "—"} &nbsp;#{review.prNumber}
              </p>
              <StatusBadge tone={reviewStatusTone(review.status)}>
                {statusLabel(review.status)}
              </StatusBadge>
              {isActive && connected && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-sky-500 dark:text-sky-300">
                  <Radio className="size-3 animate-pulse" /> Live
                </span>
              )}
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl dark:text-white">
              {review.branchName && review.branchName !== "unknown" ? review.branchName : `PR #${review.prNumber}`}
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-black/8 bg-black/4 px-4 py-3 dark:border-white/8 dark:bg-black/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Updated
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground dark:text-white">
                {timeAgo(review.updatedAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-black/8 bg-black/4 px-4 py-3 dark:border-white/8 dark:bg-black/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Findings
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground dark:text-white">
                {totalFindings} total
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Agent findings */}
          {grouped.size > 0 ? (
            <div className="rounded-[28px] border border-black/8 bg-white overflow-hidden dark:border-white/8 dark:bg-[#111114]">
              <div className="border-b border-black/6 px-6 py-5 dark:border-white/6">
                <h2 className="text-base font-semibold text-foreground dark:text-white">Agent findings</h2>
                <p className="mt-1 text-xs text-zinc-500">Results grouped by reviewing agent.</p>
              </div>

              <div className="divide-y divide-black/6 dark:divide-white/6">
                {Array.from(grouped.entries()).map(([agentName, results]) => (
                  <div key={agentName} className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg border border-black/8 bg-black/[0.03] dark:border-white/8 dark:bg-white/[0.04]">
                        <Bot className="size-3.5 text-zinc-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground dark:text-white">{agentName}</h3>
                      <span className="text-xs text-zinc-400">{results.length} finding{results.length !== 1 ? "s" : ""}</span>
                    </div>

                    <div className="space-y-3">
                      {results.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-[20px] border border-black/8 bg-black/[0.02] p-4 dark:border-white/8 dark:bg-white/[0.03]"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <StatusBadge tone={severityTone(r.severity)}>
                              {r.severity}
                            </StatusBadge>
                            <span className="text-xs text-zinc-400">{timeAgo(r.createdAt)}</span>
                          </div>
                          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                            {r.finding}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !isActive && (
              <div className="rounded-[28px] border border-black/8 bg-white px-6 py-12 text-center dark:border-white/8 dark:bg-[#111114]">
                <Bot className="mx-auto size-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-400">No agent findings recorded.</p>
              </div>
            )
          )}

          {/* Live SSE event log */}
          {(isActive || streamEvents.length > 0) && (
            <div className="rounded-[28px] border border-black/8 bg-white overflow-hidden dark:border-white/8 dark:bg-[#111114]">
              <div className="border-b border-black/6 px-6 py-5 dark:border-white/6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground dark:text-white">Live event stream</h2>
                    <p className="mt-1 text-xs text-zinc-500">Real-time SSE messages from the review service.</p>
                  </div>
                  {connected && (
                    <span className="flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-600 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                      <Radio className="size-3 animate-pulse" /> Connected
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-2 font-mono text-xs">
                {streamEvents.length === 0 ? (
                  <p className="py-4 text-center text-zinc-400 dark:text-zinc-600">Waiting for events…</p>
                ) : (
                  streamEvents.map((ev, i) => (
                    <div key={i} className="flex gap-3 rounded-lg bg-black/[0.02] px-3 py-2 dark:bg-white/[0.03]">
                      <span className="shrink-0 text-zinc-400 dark:text-zinc-600">
                        {ev.type === "agent_progress" ? "▸" : "✓"}
                      </span>
                      <span
                        className={cn(
                          ev.type === "job_completed"
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-zinc-600 dark:text-zinc-300"
                        )}
                      >
                        {ev.type === "agent_progress"
                          ? `[${ev.agentName ?? "agent"}] ${ev.status}`
                          : `job_completed — status: ${ev.status}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Feedback form (PENDING_FEEDBACK) */}
          {review.status === "PENDING_FEEDBACK" && !feedbackSent && (
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 overflow-hidden dark:border-amber-400/20 dark:bg-amber-400/5">
              <div className="border-b border-amber-200/60 px-6 py-5 dark:border-amber-400/15">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-base font-semibold text-amber-800 dark:text-amber-300">Feedback requested</h2>
                </div>
                <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/70">
                  The review is waiting for your input before proceeding.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide your feedback or additional context…"
                  rows={4}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-amber-400/20 dark:bg-[#111114] dark:text-zinc-200 dark:placeholder:text-zinc-600"
                />
                <Button
                  onClick={handleFeedback}
                  disabled={!feedback.trim() || submittingFeedback}
                  className="rounded-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                >
                  {submittingFeedback ? "Submitting…" : "Submit feedback"}
                </Button>
              </div>
            </div>
          )}

          {feedbackSent && (
            <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/8 dark:text-emerald-300">
              Feedback submitted — the review will continue shortly.
            </div>
          )}

          {/* Final report — full width in main column */}
          {review.finalReport ? (
            <div className="rounded-[28px] border border-black/8 bg-white overflow-hidden dark:border-white/8 dark:bg-[#111114]">
              <div className="border-b border-black/6 px-6 py-5 dark:border-white/6">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary dark:text-violet-300" />
                  <h2 className="text-base font-semibold text-foreground dark:text-white">Final report</h2>
                </div>
              </div>
              <FinalReportCard
                report={review.finalReport.synthesizedSummary}
                reportUrl={review.finalReport.reportUrl}
              />
            </div>
          ) : (
            review.status === "COMPLETED" && (
              <div className="rounded-[28px] border border-black/8 bg-white px-6 py-8 text-center dark:border-white/8 dark:bg-[#111114]">
                <FileText className="mx-auto size-6 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-400">No final report generated.</p>
              </div>
            )
          )}
        </div>

        <aside className="space-y-6">
          {/* Review metadata */}
          <div className="rounded-[28px] border border-black/8 bg-white overflow-hidden dark:border-white/8 dark:bg-[#111114]">
            <div className="border-b border-black/6 px-6 py-5 dark:border-white/6">
              <h2 className="text-base font-semibold text-foreground dark:text-white">Details</h2>
            </div>
            <dl className="divide-y divide-black/6 dark:divide-white/6">
              {[
                { label: "Repository", value: review.repository?.fullName ?? "—" },
                { label: "PR number", value: `#${review.prNumber}` },
                { label: "Branch", value: (review.branchName && review.branchName !== "unknown") ? review.branchName : "—" },
                { label: "Status", value: statusLabel(review.status) },
                {
                  label: "Created",
                  value: new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(review.createdAt)),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 px-6 py-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500 shrink-0">
                    {label}
                  </dt>
                  <dd className="text-sm text-right text-foreground dark:text-zinc-200 truncate">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>
    </div>
  )
}
