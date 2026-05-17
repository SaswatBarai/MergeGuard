"use client"

import { motion } from "motion/react"
import { Bot, GitMerge, KeyRound, Radio, ShieldCheck, Workflow } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Bot,
    title: "Multi-agent review",
    text: "Security, logic, policy, and style agents work in parallel from the same pull-request context, delivering comprehensive coverage in seconds.",
    wide: true,
    // DARK BG → white text
    bg: "bg-[#9885fa] dark:bg-[#7c3aed]/30",
    border: "border-[#7c5cf6] dark:border-[#7c3aed]/50",
    iconBg: "bg-white/20 border-white/20",
    iconColor: "text-white",
    titleColor: "text-white",
    bodyColor: "text-white/80",
    decoration: (
      <div className="mt-5 rounded-2xl border border-white/20 bg-white/15 dark:bg-white/5 p-4 font-mono text-xs backdrop-blur-sm">
        <div className="flex items-center gap-2 text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Security agent — 100%
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-blue-300">
          <span className="size-1.5 rounded-full bg-blue-400 animate-pulse inline-block" /> Logic agent — 68%
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-white/80">
          <span className="size-1.5 rounded-full bg-white/60 animate-pulse inline-block" /> Policy agent — 100%
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-white/40">
          <span className="size-1.5 rounded-full bg-white/30 inline-block" /> Style agent — queued
        </div>
      </div>
    ),
  },
  {
    icon: GitMerge,
    title: "Conflict intelligence",
    text: "Detect risky branch drift and merge conflicts before reviewers spend time on a PR.",
    // DARK BG → white text
    bg: "bg-[#6cb8ff] dark:bg-[#1e40af]/40",
    border: "border-[#3d9ef5] dark:border-[#1e40af]/60",
    iconBg: "bg-white/20 border-white/20",
    iconColor: "text-white",
    titleColor: "text-white",
    bodyColor: "text-white/80",
  },
  {
    icon: ShieldCheck,
    title: "Policy gates",
    text: "Code owners, signed commits, CI, and custom rules presented as one merge decision.",
    // LIGHT BG → dark text
    bg: "bg-[#c9fe87] dark:bg-[#166534]/40",
    border: "border-[#a8e85a] dark:border-[#166534]/60",
    iconBg: "bg-black/10 border-black/10 dark:bg-white/10 dark:border-white/10",
    iconColor: "text-green-950 dark:text-green-300",
    titleColor: "text-green-950 dark:text-white",
    bodyColor: "text-green-900/80 dark:text-zinc-300",
  },
  {
    icon: Radio,
    title: "Live progress",
    text: "Streaming events make long-running reviews inspectable instead of opaque black boxes.",
    wide: true,
    // LIGHT BG → dark text
    bg: "bg-[#ffd66c] dark:bg-[#92400e]/40",
    border: "border-[#f5c430] dark:border-[#92400e]/60",
    iconBg: "bg-black/10 border-black/10 dark:bg-white/10 dark:border-white/10",
    iconColor: "text-amber-950 dark:text-amber-300",
    titleColor: "text-amber-950 dark:text-white",
    bodyColor: "text-amber-900/80 dark:text-zinc-300",
    decoration: (
      <div className="mt-5 rounded-2xl border border-black/10 bg-black/8 dark:border-white/10 dark:bg-white/5 p-4 font-mono text-xs space-y-1.5 backdrop-blur-sm">
        <div>
          <span className="text-amber-950/50 dark:text-zinc-500">08:11:04</span>
          <span className="text-emerald-800 dark:text-emerald-400 ml-2">security</span>
          <span className="ml-2 text-amber-950/70 dark:text-zinc-300">Secret scan complete — no findings</span>
        </div>
        <div>
          <span className="text-amber-950/50 dark:text-zinc-500">08:13:38</span>
          <span className="text-amber-800 dark:text-amber-400 ml-2">logic</span>
          <span className="ml-2 text-amber-950/70 dark:text-zinc-300">Stale session branch detected</span>
        </div>
        <div>
          <span className="text-amber-950/50 dark:text-zinc-500">08:16:02</span>
          <span className="text-violet-700 dark:text-violet-400 ml-2">orchestrator</span>
          <span className="ml-2 text-amber-950/70 dark:text-zinc-300">Assembling final report...</span>
        </div>
      </div>
    ),
  },
  {
    icon: KeyRound,
    title: "Scoped API keys",
    text: "Create purpose-built CLI and CI keys with narrow repo and review permissions.",
    // DARK BG → white text
    bg: "bg-[#ff8fab] dark:bg-[#9f1239]/40",
    border: "border-[#f06090] dark:border-[#9f1239]/60",
    iconBg: "bg-white/20 border-white/20",
    iconColor: "text-white",
    titleColor: "text-white",
    bodyColor: "text-white/80",
  },
  {
    icon: Workflow,
    title: "GitHub-native flow",
    text: "Designed around OAuth, pull requests, branch protection, and existing team workflows.",
    // MEDIUM BG → dark text
    bg: "bg-[#f9a8d4] dark:bg-[#831843]/40",
    border: "border-[#f472b6] dark:border-[#831843]/60",
    iconBg: "bg-black/10 border-black/10 dark:bg-white/10 dark:border-white/10",
    iconColor: "text-rose-950 dark:text-rose-300",
    titleColor: "text-rose-950 dark:text-white",
    bodyColor: "text-rose-900/80 dark:text-zinc-300",
  },
]

export function Features() {
  return (
    <section id="features" className="relative border-b border-black/6 py-24 overflow-hidden dark:border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-50/20 to-background pointer-events-none dark:hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-zinc-950/50 to-background pointer-events-none hidden dark:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Platform</p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl leading-tight dark:text-white">
            The merge decision,{" "}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent dark:to-blue-400">
              compressed
            </span>{" "}
            into one view.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-500 dark:text-zinc-400">
            Every surface is tuned for engineering teams that need to scan, compare, and act quickly.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
          {features.slice(0, 3).map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "group relative rounded-3xl border p-7 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
                feature.bg,
                feature.border,
                feature.wide ? "sm:col-span-2 lg:col-span-2" : ""
              )}
            >
              <div className={cn("flex size-11 items-center justify-center rounded-2xl border", feature.iconBg)}>
                <feature.icon className={cn("size-5", feature.iconColor)} aria-hidden />
              </div>
              <h3 className={cn("mt-5 text-base font-bold", feature.titleColor)}>{feature.title}</h3>
              <p className={cn("mt-2 text-sm leading-6", feature.bodyColor)}>{feature.text}</p>
              {feature.decoration}
            </motion.div>
          ))}

          {features.slice(3, 6).map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i + 3) * 0.1 }}
              className={cn(
                "group relative rounded-3xl border p-7 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
                feature.bg,
                feature.border,
                feature.wide ? "sm:col-span-2 lg:col-span-2" : ""
              )}
            >
              <div className={cn("flex size-11 items-center justify-center rounded-2xl border", feature.iconBg)}>
                <feature.icon className={cn("size-5", feature.iconColor)} aria-hidden />
              </div>
              <h3 className={cn("mt-5 text-base font-bold", feature.titleColor)}>{feature.title}</h3>
              <p className={cn("mt-2 text-sm leading-6", feature.bodyColor)}>{feature.text}</p>
              {feature.decoration}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}