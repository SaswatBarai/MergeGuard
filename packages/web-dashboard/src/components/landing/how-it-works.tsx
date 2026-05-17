"use client"

import { motion } from "motion/react"
import { GitPullRequest, KeyRound, Shield } from "lucide-react"

const steps = [
  {
    number: "Step 1",
    icon: KeyRound,
    title: "Connect GitHub & configure your workspace",
    text: "Authorize your repositories and generate a scoped CLI key for local or CI-triggered reviews. Set up in seconds.",
    // DARK BG → white text
    bg: "bg-[#9885fa] dark:bg-[#7c3aed]/30",
    border: "border-[#7c5cf6] dark:border-[#7c3aed]/50",
    badgeClass: "bg-white/20 text-white border-white/20",
    headingClass: "text-white",
    textClass: "text-white/80",
    iconClass: "text-white",
    iconBgClass: "bg-white/20 border-white/20",
    mockupClass: "border-white/20 bg-white/15 text-white",
    mockup: (
      <div className="mt-6 rounded-2xl border border-white/20 bg-white/15 dark:bg-white/5 p-4 font-mono text-xs backdrop-blur-sm">
        <div className="text-white/50 mb-2">$ mergeguard auth login</div>
        <div className="text-emerald-300">✓ Authorized via GitHub OAuth</div>
        <div className="text-emerald-300 mt-1">✓ Scoped key generated: mg_live_••••4f2a</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-white/60" />
          <span className="font-sans text-white/80 font-medium">3 repositories connected</span>
        </div>
      </div>
    ),
  },
  {
    number: "Step 2",
    icon: GitPullRequest,
    title: "Review PRs with live agent streaming",
    text: "Open a pull request or run the CLI. MergeGuard streams agent progress and policy status in real time.",
    // LIGHT BG → dark text
    bg: "bg-[#ffd66c] dark:bg-[#92400e]/40",
    border: "border-[#f5c430] dark:border-[#92400e]/60",
    badgeClass: "bg-black/10 text-amber-950 border-black/10 dark:bg-white/10 dark:text-white dark:border-white/10",
    headingClass: "text-amber-950 dark:text-white",
    textClass: "text-amber-900/80 dark:text-zinc-300",
    iconClass: "text-amber-950 dark:text-amber-300",
    iconBgClass: "bg-black/10 border-black/10 dark:bg-white/10 dark:border-white/10",
    mockup: (
      <div className="mt-6 rounded-2xl border border-black/10 bg-black/8 dark:border-white/10 dark:bg-white/5 p-4 font-mono text-xs backdrop-blur-sm">
        <div className="text-amber-950/50 dark:text-zinc-400 mb-2">$ mergeguard review --pr 2847 --watch</div>
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
          <span className="inline-block size-1.5 rounded-full bg-blue-700 dark:bg-blue-400 animate-pulse" /> Logic — analyzing...
        </div>
        <div className="mt-1 flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <span className="inline-block size-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400" /> Security — complete
        </div>
        <div className="mt-1 text-amber-950/50 dark:text-zinc-400">Policy — queued</div>
      </div>
    ),
  },
  {
    number: "Step 3",
    icon: Shield,
    title: "Merge with full evidence & confidence",
    text: "Use the final report, policy checks, and risk summary as your definitive merge handoff. Ship fast without breaking main.",
    // LIGHT BG → dark text
    bg: "bg-[#c9fe87] dark:bg-[#166534]/40",
    border: "border-[#a8e85a] dark:border-[#166534]/60",
    badgeClass: "bg-black/10 text-green-950 border-black/10 dark:bg-white/10 dark:text-white dark:border-white/10",
    headingClass: "text-green-950 dark:text-white",
    textClass: "text-green-900/80 dark:text-zinc-300",
    iconClass: "text-green-950 dark:text-green-300",
    iconBgClass: "bg-black/10 border-black/10 dark:bg-white/10 dark:border-white/10",
    wide: true,
    mockup: (
      <div className="mt-6 rounded-2xl border border-black/10 bg-black/8 dark:border-white/10 dark:bg-white/5 p-4 font-mono text-xs backdrop-blur-sm">
        <div className="text-green-950/50 dark:text-zinc-400 mb-2">MergeGuard Report — PR #2847</div>
        <div className="text-emerald-800 dark:text-emerald-400">✓ No conflicts detected</div>
        <div className="text-emerald-800 dark:text-emerald-400 mt-1">✓ Policy gates passed (11/12)</div>
        <div className="mt-2 font-sans font-semibold text-green-950 dark:text-green-300 text-sm">Risk: Low — safe to merge ✓</div>
      </div>
    ),
    extra: (
      <div className="mt-6 rounded-2xl border border-black/10 bg-black/8 dark:border-white/10 dark:bg-white/5 p-4">
        <div className="text-xs font-semibold text-green-950/50 dark:text-zinc-400 uppercase tracking-widest mb-3">Agent Summary</div>
        <div className="space-y-2">
          {[
            { label: "Security", val: 100, color: "bg-emerald-600" },
            { label: "Logic", val: 92, color: "bg-blue-600" },
            { label: "Policy", val: 100, color: "bg-violet-600" },
            { label: "Style", val: 88, color: "bg-amber-500" },
          ].map((a) => (
            <div key={a.label} className="flex items-center gap-3">
              <span className="w-14 text-xs font-medium text-green-950 dark:text-zinc-300">{a.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10">
                <div className={`h-1.5 rounded-full ${a.color}`} style={{ width: `${a.val}%` }} />
              </div>
              <span className="text-xs text-green-950/50 dark:text-zinc-400 w-8 text-right">{a.val}%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export function HowItWorks() {
  return (
    <section id="workflow" className="relative border-b border-black/6 py-24 overflow-hidden dark:border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-50/20 to-background pointer-events-none dark:hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-background to-zinc-950/80 pointer-events-none hidden dark:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Workflow</p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl leading-tight dark:text-white">
            From OAuth to merge evidence{" "}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent dark:to-blue-400">
              in minutes.
            </span>
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-500 dark:text-zinc-400">
            Three steps. Connect, review, and ship — all in one operational screen.
          </p>
        </motion.div>

        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {steps.slice(0, 2).map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative rounded-3xl border ${step.border} ${step.bg} p-8 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
            >
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border mb-6 ${step.badgeClass}`}>
                {step.number}
              </span>
              <div className={`flex size-11 items-center justify-center rounded-2xl border mb-4 ${step.iconBgClass}`}>
                <step.icon className={`size-5 ${step.iconClass}`} aria-hidden />
              </div>
              <h3 className={`text-2xl font-bold leading-tight ${step.headingClass}`}>{step.title}</h3>
              <p className={`mt-3 text-sm leading-6 ${step.textClass}`}>{step.text}</p>
              {step.mockup}
            </motion.div>
          ))}

          {/* Full-width Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`relative rounded-3xl border ${steps[2].border} ${steps[2].bg} p-8 lg:col-span-2 overflow-hidden transition-all duration-300 hover:shadow-xl`}
          >
            <div className="lg:grid lg:grid-cols-2 lg:gap-10">
              <div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border mb-6 ${steps[2].badgeClass}`}>
                  {steps[2].number}
                </span>
                <div className={`flex size-11 items-center justify-center rounded-2xl border mb-4 ${steps[2].iconBgClass}`}>
                  <Shield className={`size-5 ${steps[2].iconClass}`} aria-hidden />
                </div>
                <h3 className={`text-2xl font-bold leading-tight ${steps[2].headingClass}`}>{steps[2].title}</h3>
                <p className={`mt-3 text-sm leading-6 ${steps[2].textClass} max-w-md`}>{steps[2].text}</p>
                {steps[2].mockup}
              </div>
              <div className="mt-6 lg:mt-0 flex items-center">
                <div className="w-full">{steps[2].extra}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}