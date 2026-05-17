import type React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "blue" | "emerald" | "amber" | "red" | "slate"

type StatusBadgeProps = {
  children: React.ReactNode
  tone?: Tone
  className?: string
}

const toneClasses: Record<Tone, string> = {
  blue:    "border-sky-300/40 bg-sky-50 text-sky-700 hover:bg-sky-50 dark:border-sky-300/15 dark:bg-sky-400/10 dark:text-sky-300 dark:hover:bg-sky-400/10",
  emerald: "border-emerald-300/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/10",
  amber:   "border-amber-300/40 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/10",
  red:     "border-red-300/40 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-300/15 dark:bg-red-400/10 dark:text-red-300 dark:hover:bg-red-400/10",
  slate:   "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.04]",
}

export function StatusBadge({ children, tone = "slate", className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-[0.02em]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </Badge>
  )
}

// Real backend statuses: QUEUED, IN_PROGRESS, PENDING_FEEDBACK, COMPLETED, FAILED, CANCELLED
export function reviewStatusTone(status: string): Tone {
  const map: Record<string, Tone> = {
    QUEUED: "slate",
    IN_PROGRESS: "blue",
    PENDING_FEEDBACK: "amber",
    COMPLETED: "emerald",
    FAILED: "red",
    CANCELLED: "slate",
  }
  return map[status] ?? "slate"
}

// Severity from agentResults: HIGH, MEDIUM, LOW, INFO
export function severityTone(severity: string): Tone {
  const map: Record<string, Tone> = {
    HIGH: "red",
    MEDIUM: "amber",
    LOW: "blue",
    INFO: "slate",
  }
  return map[severity?.toUpperCase()] ?? "slate"
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    QUEUED: "Queued",
    IN_PROGRESS: "In Progress",
    PENDING_FEEDBACK: "Needs Feedback",
    COMPLETED: "Completed",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
  }
  return map[status] ?? status
}
