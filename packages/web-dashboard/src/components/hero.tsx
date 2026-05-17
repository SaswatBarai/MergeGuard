"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { DotPattern } from "@/components/ui/dot-pattern"
import { Button } from "@/components/ui/button"
import { Backlight } from "@/components/ui/backlight"
import { cn } from "@/lib/utils"
import { HeroPreviewCard, AgentData } from "@/components/hero-preview-card"

const layer1Agents: AgentData[] = [
  { name: "Security", progress: 100, status: "complete", desc: "Dependency and secret scan complete", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Logic", progress: 68, status: "analyzing", desc: "Tracing refresh-token branch behavior", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/8 dark:bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Policy", progress: 100, status: "complete", desc: "Repository rules evaluated", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Style", progress: 12, status: "queued", desc: "Waiting for logic agent handoff", color: "text-zinc-400 dark:text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-500/5", border: "border-zinc-200 dark:border-zinc-500/10" },
]

const layer2Agents: AgentData[] = [
  { name: "Branch", progress: 100, status: "complete", desc: "Protection rules verified", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Reviews", progress: 100, status: "complete", desc: "2/2 required approvals present", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Commits", progress: 75, status: "analyzing", desc: "Verifying commit message format", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/8 dark:bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Signed", progress: 0, status: "queued", desc: "Waiting for GPG verification", color: "text-zinc-400 dark:text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-500/5", border: "border-zinc-200 dark:border-zinc-500/10" },
]

const layer3Agents: AgentData[] = [
  { name: "Packages", progress: 100, status: "complete", desc: "All versions pinned safely", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "License", progress: 100, status: "complete", desc: "No restrictive licenses found", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Vulns", progress: 95, status: "analyzing", desc: "Checking CVE database", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/8 dark:bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Origin", progress: 100, status: "complete", desc: "Registry source verified", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20" },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-black/6 bg-background dark:border-white/5">
      <DotPattern className={cn("[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]")} />

      {/* Ambient glows */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,#9885fa,transparent_70%)] opacity-[0.09] dark:opacity-20" />
      <div aria-hidden className="absolute -right-40 top-20 size-[500px] rounded-full bg-[#ffd66c]/15 blur-[120px] dark:bg-[#ffd66c]/5" />
      <div aria-hidden className="absolute -left-40 top-40 size-[400px] rounded-full bg-[#9885fa]/20 blur-[100px] dark:bg-[#9885fa]/10" />
      <div aria-hidden className="absolute left-1/2 top-1/3 -translate-x-1/2 size-[600px] rounded-full bg-[#c9fe87]/10 blur-[140px] dark:bg-[#c9fe87]/5" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pt-24 text-center sm:px-6 sm:pt-40 lg:px-8">
        <div className="flex min-h-[75vh] flex-col justify-center items-center">

          {/* Beta badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9885fa]/30 bg-[#9885fa]/10 px-4 py-1.5 text-sm font-semibold text-[#7c3aed] dark:text-[#c4b5fd] dark:bg-[#9885fa]/15 dark:border-[#9885fa]/20"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#9885fa] opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-[#9885fa]" />
            </span>
            Public beta · GitHub native
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(15px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl dark:text-white"
          >
            Merge protection <br />
            that reads the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #9885fa 0%, #6cb8ff 50%, #c9fe87 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              pull request
            </span>{" "}
            <br />
            before it lands.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-base leading-8 text-zinc-500 sm:text-xl font-medium dark:text-zinc-400"
          >
            MergeGuard combines conflict checks, policy gates, and AI review
            agents into a single operational screen for teams that ship from
            busy repositories.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Button
                size="lg"
                className="h-12 rounded-full gap-2 px-8 text-base bg-[#9885fa] hover:bg-[#7c5cf6] text-white border-0 shadow-lg shadow-[#9885fa]/30 hover:shadow-[#7c5cf6]/40 transition-all duration-300 font-bold"
                asChild
              >
                <Link href="/dashboard">
                  Open dashboard <ArrowRight className="size-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 text-base border-black/12 bg-white/60 text-foreground hover:bg-white/90 backdrop-blur-sm transition-all duration-300 font-semibold dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                asChild
              >
                <Link href="/auth/login">Continue with GitHub</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Social proof pills */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-12 flex flex-wrap justify-center gap-3"
          >
            {[
              { label: "No conflicts", color: "bg-[#c9fe87] text-green-950 border-[#a8e85a]" },
              { label: "12 policy gates", color: "bg-[#9885fa] text-white border-[#7c5cf6]" },
              { label: "4 review agents", color: "bg-[#ffd66c] text-amber-950 border-[#f5c430]" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${item.color}`}>
                <CheckCircle2 className="size-3.5" aria-hidden />
                {item.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stacked preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 100, filter: "blur(30px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mt-40 sm:mt-64 flex w-full flex-col items-center justify-center [perspective:3000px] pb-48"
        >
          <div className="absolute top-0 left-1/2 z-0 w-full max-w-4xl opacity-100 pointer-events-none" style={{ transform: "translate(calc(-50% - 100px), -80px) rotateZ(-4deg) scale(0.98)" }}>
            <Backlight blur={120} opacity={0.25} className="rounded-3xl">
              <HeroPreviewCard prNumber="2847" branch="security/supply-chain" risk="Low Risk" title="Supply Chain Security Audit" summary="Deep audit of third-party dependencies and transitive package risks. Verifying integrity of 124 upstream modules." agents={layer3Agents} safeAreas="0 known vulnerabilities detected. All dependency licenses comply with organizational policy." cliCommand="mergeguard audit --supply-chain --verify" />
            </Backlight>
          </div>
          <div className="absolute top-0 left-1/2 z-10 w-full max-w-4xl opacity-100 pointer-events-none" style={{ transform: "translate(calc(-50% - 50px), -40px) rotateZ(-2deg) scale(0.99)" }}>
            <HeroPreviewCard prNumber="2847" branch="policy/governance-check" risk="Low Risk" title="Automated Policy Enforcement" summary="Enforcing repository governance rules, branch protection standards, and required organizational checks." agents={layer2Agents} safeAreas="Branch protection active. Code owner approvals verified. Commit history follows conventional standards." cliCommand="mergeguard check --policy --strict" />
          </div>
          <div className="relative w-full max-w-4xl transition-all duration-700 hover:scale-[1.01] z-20" style={{ transform: "rotateX(10deg)", transformStyle: "preserve-3d" }}>
            <HeroPreviewCard prNumber="2847" branch="feature/auth-refactor" risk="Medium Risk" title="Refactor authentication middleware" summary="Authentication flow is structurally sound, with one policy warning around commit verification and two logic areas under review." agents={layer1Agents} safeAreas="Security scan is clean, merge conflicts are clear, and code owner approval is already present." cliCommand="mergeguard review --repo acme/api --pr 2847 --watch" showGlow={true} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}