"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  GitPullRequest,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react"

import { StartReviewSheet } from "@/components/dashboard/start-review-sheet"
import { StatusBadge, reviewStatusTone, statusLabel, severityTone } from "@/components/status-badge"
import { useCurrentUser } from "@/hooks/useAuth"
import { listReviews, getMyRepositories, type ReviewJob, type Repository } from "@/lib/api"
import { cn } from "@/lib/utils"

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function DashboardPage() {
  const { user } = useCurrentUser()
  const [reviews, setReviews] = useState<ReviewJob[]>([])
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      listReviews(user.id).catch(() => [] as ReviewJob[]),
      getMyRepositories().catch(() => [] as Repository[]),
    ]).then(([revs, repos]) => {
      setReviews(revs)
      setRepositories(repos)
      setLoading(false)
    })
  }, [user])

  const completed = reviews.filter((r) => r.status === "COMPLETED").length
  const inProgress = reviews.filter((r) => r.status === "IN_PROGRESS" || r.status === "QUEUED").length
  const failed = reviews.filter((r) => r.status === "FAILED").length
  const featured = reviews[0]

  const statsCards = [
    {
      label: "Total reviews",
      value: loading ? "—" : reviews.length.toString(),
      detail: "All time on your account",
      icon: GitPullRequest,
      accent: "from-violet-500/15 via-violet-400/8 to-transparent",
      iconWrap: "bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-400/12 dark:text-violet-200 dark:border-violet-300/15",
    },
    {
      label: "Completed",
      value: loading ? "—" : completed.toString(),
      detail: "Reviews fully analysed",
      icon: ShieldCheck,
      accent: "from-emerald-500/15 via-lime-300/8 to-transparent",
      iconWrap: "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-400/12 dark:text-emerald-200 dark:border-emerald-300/15",
    },
    {
      label: "In progress",
      value: loading ? "—" : inProgress.toString(),
      detail: "Queued or running now",
      icon: Clock,
      accent: "from-sky-500/15 via-cyan-400/8 to-transparent",
      iconWrap: "bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-400/12 dark:text-sky-200 dark:border-sky-300/15",
    },
    {
      label: "Failed",
      value: loading ? "—" : failed.toString(),
      detail: "Errored or cancelled",
      icon: ShieldAlert,
      accent: "from-amber-400/15 via-orange-400/8 to-transparent",
      iconWrap: "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-400/12 dark:text-amber-200 dark:border-amber-300/15",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="relative overflow-hidden rounded-[28px] border border-black/8 bg-white p-6 sm:p-7 dark:border-white/8 dark:bg-[#111114]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_34%),radial-gradient(circle_at_75%_35%,rgba(56,189,248,0.06),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(163,230,53,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_34%),radial-gradient(circle_at_75%_35%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(163,230,53,0.08),transparent_25%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-200">
                  <Sparkles className="size-3.5" />
                  Dashboard
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl dark:text-white">
                  Merge operations,
                  <span className="bg-gradient-to-r from-violet-600 via-sky-500 to-lime-500 bg-clip-text text-transparent dark:from-violet-300 dark:via-sky-300 dark:to-lime-200">
                    {" "}compressed into one workspace
                  </span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                  Track live pull-request analysis, monitor repository health, and jump into active review flows without leaving the control surface.
                </p>
              </div>
              <StartReviewSheet repositories={repositories} user={user} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Latest review",
                  title: featured
                    ? `${featured.repository.fullName} #${featured.prNumber}`
                    : "No reviews yet",
                  sub: featured ? statusLabel(featured.status) : "Start one above.",
                },
                {
                  label: "Active",
                  title: `${inProgress} running`,
                  sub: inProgress > 0 ? "Jobs queued or in progress" : "No active reviews",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-black/8 bg-black/4 p-4 dark:border-white/8 dark:bg-black/20">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {statsCards.slice(0, 2).map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-[28px] border border-black/8 bg-white p-5 dark:border-white/8 dark:bg-[#111114]"
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br", stat.accent)} />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-foreground dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-zinc-400">{stat.detail}</p>
                </div>
                <div className={cn("flex size-11 items-center justify-center rounded-2xl border", stat.iconWrap)}>
                  <stat.icon className="size-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom stats row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.slice(2).map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-[26px] border border-black/8 bg-white p-5 dark:border-white/8 dark:bg-[#111114]"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br", stat.accent)} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-foreground dark:text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-zinc-400">{stat.detail}</p>
              </div>
              <div className={cn("flex size-11 items-center justify-center rounded-2xl border", stat.iconWrap)}>
                <stat.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}

        {/* Pipeline legend */}
        <div className="rounded-[26px] border border-black/8 bg-white p-5 sm:col-span-2 xl:col-span-2 dark:border-white/8 dark:bg-[#111114]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Review pipeline
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "QUEUED", tone: "slate", desc: "Waiting for agents" },
              { label: "IN_PROGRESS", tone: "blue", desc: "Agents running" },
              { label: "PENDING_FEEDBACK", tone: "amber", desc: "Awaiting your input" },
              { label: "COMPLETED", tone: "emerald", desc: "Report ready" },
              { label: "FAILED", tone: "red", desc: "Pipeline error" },
              { label: "CANCELLED", tone: "slate", desc: "Stopped by user" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-black/8 bg-black/4 p-3 dark:border-white/8 dark:bg-black/20">
                <StatusBadge tone={s.tone as "slate" | "blue" | "amber" | "emerald" | "red"} className="mb-1.5">
                  {statusLabel(s.label)}
                </StatusBadge>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews table */}
      <section>
        <div className="rounded-[28px] border border-black/8 bg-white overflow-hidden dark:border-white/8 dark:bg-[#111114]">
          <div className="flex items-center justify-between border-b border-black/6 px-6 py-5 dark:border-white/6">
            <div>
              <h2 className="text-base font-semibold text-foreground dark:text-white">Recent reviews</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {loading ? "Loading…" : `${reviews.length} total`}
              </p>
            </div>
            <StatusBadge tone="blue">{reviews.length} jobs</StatusBadge>
          </div>

          <div className="divide-y divide-black/6 dark:divide-white/6">
            {loading ? (
              <div className="px-6 py-10 text-center text-sm text-zinc-400">Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <GitPullRequest className="size-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm text-zinc-400">No reviews yet.</p>
                <p className="text-xs text-zinc-400">Use "Start review" to trigger your first AI review.</p>
              </div>
            ) : (
              reviews.map((review) => {
                const highCount = review.agentResults.filter((r) => r.severity === "HIGH").length
                const totalFindings = review.agentResults.length
                return (
                  <Link
                    key={review.id}
                    href={`/dashboard/review/${review.id}`}
                    className="block px-6 py-5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground dark:text-white">
                            {review.repository.fullName} #{review.prNumber}
                          </p>
                          <StatusBadge tone={reviewStatusTone(review.status)}>
                            {statusLabel(review.status)}
                          </StatusBadge>
                          {highCount > 0 && (
                            <StatusBadge tone="red">{highCount} high</StatusBadge>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-600">
                          {(review.branchName && review.branchName !== "unknown") ? review.branchName : `PR #${review.prNumber}`} · {timeAgo(review.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {totalFindings > 0 ? (
                          <div className="rounded-2xl border border-black/8 bg-black/4 px-3 py-2 text-center dark:border-white/8 dark:bg-white/[0.03]">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Findings</p>
                            <p className="mt-0.5 font-mono text-sm font-semibold text-foreground dark:text-white">{totalFindings}</p>
                          </div>
                        ) : review.status === "COMPLETED" ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-4" />
                            Clean
                          </div>
                        ) : null}
                        <ArrowRight className="size-4 text-zinc-300 dark:text-zinc-600" />
                      </div>
                    </div>

                    {/* Findings preview — highest severity agents */}
                    {totalFindings > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Array.from(new Set(review.agentResults.map((r) => r.agentName)))
                          .slice(0, 4)
                          .map((agent) => {
                            const agentFindings = review.agentResults.filter((r) => r.agentName === agent)
                            const worst = agentFindings.sort((a, b) => {
                              const order = { HIGH: 0, MEDIUM: 1, LOW: 2, INFO: 3 }
                              return (order[a.severity as keyof typeof order] ?? 9) - (order[b.severity as keyof typeof order] ?? 9)
                            })[0]
                            return (
                              <div key={agent} className="rounded-xl border border-black/8 bg-black/4 px-2.5 py-1 dark:border-white/8 dark:bg-white/[0.03]">
                                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{agent}</span>
                                <StatusBadge tone={severityTone(worst.severity)} className="ml-1.5">
                                  {worst.severity}
                                </StatusBadge>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
