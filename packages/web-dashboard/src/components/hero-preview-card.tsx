"use client"

import { motion } from "motion/react"
import { ShieldCheck, ShieldAlert, Terminal, GitPullRequest, CheckCircle2, Activity, Lock, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { BorderBeam } from "@/components/ui/border-beam"

export interface AgentData {
  name: string
  progress: number
  status: "complete" | "analyzing" | "queued"
  desc: string
  color: string
  bg: string
  border: string
}

interface HeroPreviewCardProps {
  prNumber: string
  branch: string
  risk: string
  title: string
  summary: string
  agents: AgentData[]
  safeAreas: string
  cliCommand: string
  showGlow?: boolean
}

export function HeroPreviewCard({ prNumber, branch, risk, title, summary, agents, safeAreas, cliCommand, showGlow = false }: HeroPreviewCardProps) {
  const isLow = risk.includes("Low")
  const isMed = risk.includes("Medium")

  return (
    <div className="group relative mx-auto w-full max-w-4xl">
      {showGlow && (
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#9885fa]/30 to-[#6cb8ff]/30 opacity-20 blur-2xl transition duration-1000 group-hover:opacity-40 dark:opacity-30 dark:group-hover:opacity-50" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.97, borderColor: "#9885fa", boxShadow: "0 0 40px 6px rgba(152,133,250,0.25)" }}
        transition={{ type: "spring", stiffness: 150, damping: 25 }}
        className="relative flex flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-zinc-950 dark:shadow-2xl"
      >
        <BorderBeam size={450} duration={12} delay={9} colorFrom="#9885fa" colorTo="#c9fe87" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/6 bg-black/[0.02] px-8 py-5 dark:border-white/5 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#9885fa]/15 text-[#7c3aed] dark:text-[#c4b5fd] dark:bg-[#9885fa]/20">
              <GitPullRequest className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-foreground tracking-tight dark:text-white">PR #{prNumber}</span>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <span className="font-mono text-zinc-500 dark:text-zinc-400">{branch}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5 dark:text-zinc-500">MergeGuard AI Analysis</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5 border font-bold text-xs uppercase tracking-wider",
            isLow ? "bg-[#c9fe87] border-[#a8e85a] text-green-950"
              : isMed ? "bg-[#ffd66c] border-[#f5c430] text-amber-950"
              : "bg-red-100 border-red-300 text-red-900 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-300"
          )}>
            <ShieldAlert className="size-3.5" />
            {risk}
          </div>
        </div>

        {/* Body */}
        <div className="p-10 text-center">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-foreground tracking-tight leading-tight dark:text-white">{title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500 max-w-2xl mx-auto font-medium dark:text-zinc-400">{summary}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-left">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={cn("relative flex flex-col gap-4 rounded-2xl border p-6 transition-all", agent.border, agent.bg)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm font-bold uppercase tracking-wider", agent.color)}>{agent.name}</span>
                    {agent.progress === 100 ? (
                      <CheckCircle2 className="size-4 text-emerald-500 dark:text-emerald-400" />
                    ) : agent.progress > 0 ? (
                      <Activity className="size-4 text-blue-500 animate-pulse dark:text-blue-400" />
                    ) : (
                      <Lock className="size-4 text-zinc-300 dark:text-zinc-600" />
                    )}
                  </div>
                  <span className={cn("font-mono text-base font-bold", agent.color)}>{agent.progress}%</span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-black/6 dark:bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      agent.progress === 100 ? "bg-emerald-500 dark:bg-emerald-400"
                        : agent.progress > 0 ? "bg-[#9885fa]"
                        : "bg-zinc-200 dark:bg-zinc-700"
                    )}
                  />
                </div>
                <p className="text-sm text-zinc-500 font-medium dark:text-zinc-500">{agent.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 text-left">
            <div className="rounded-2xl border border-[#a8e85a] bg-[#c9fe87] p-6 dark:bg-[#166534]/30 dark:border-[#166534]/50">
              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="size-5 text-green-800 dark:text-green-400" />
                <span className="text-sm font-bold text-green-900 uppercase tracking-wide dark:text-green-300">Safe Areas</span>
              </div>
              <p className="text-sm leading-relaxed text-green-950/80 font-medium dark:text-zinc-300">{safeAreas}</p>
            </div>

            <div className="rounded-2xl border border-black/8 bg-black/[0.02] p-6 flex flex-col dark:border-white/5 dark:bg-white/5">
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="size-5 text-[#7c3aed] dark:text-[#c4b5fd]" />
                <span className="text-sm font-bold text-zinc-700 uppercase tracking-wide dark:text-zinc-300">CLI Handoff</span>
              </div>
              <div className="group/cli relative overflow-hidden rounded-xl bg-zinc-100 p-4 mt-auto dark:bg-black/50">
                <code className="font-mono text-xs text-zinc-600 break-all leading-relaxed dark:text-zinc-400">{cliCommand}</code>
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 transition-opacity group-hover/cli:opacity-100 dark:bg-zinc-900/95">
                  <span className="text-xs font-bold text-[#7c3aed] dark:text-[#c4b5fd] uppercase tracking-widest">Click to copy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-6 border-t border-black/6 bg-black/[0.015] px-8 py-4 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#c9fe87] opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#c9fe87]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">System Ready</span>
          </div>
          <div className="h-5 w-px bg-black/10 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <Search className="size-4 text-zinc-400" />
            <span className="text-sm text-zinc-500 font-medium dark:text-zinc-500">Watching 12 repositories</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}