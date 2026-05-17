"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ArrowRight, CheckCircle2, GitPullRequest, KeyRound, ShieldCheck } from "lucide-react"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

import { LogoWordmark } from "@/components/brand/logo"
import { DotPattern } from "@/components/ui/dot-pattern"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

const features = [
  { icon: ShieldCheck,    label: "Multi-agent AI review",      desc: "Security, logic, style & policy agents run in parallel" },
  { icon: GitPullRequest, label: "Pull request analysis",       desc: "Deep PR inspection before any code lands on main" },
  { icon: KeyRound,       label: "Scoped API keys for CI/CLI",  desc: "Granular credentials for automated pipelines" },
]

const pills = [
  { label: "No conflicts",      color: "bg-[#c9fe87]/20 text-green-700 border-[#c9fe87]/40 dark:bg-[#c9fe87]/10 dark:text-[#c9fe87] dark:border-[#c9fe87]/20" },
  { label: "12 policy gates",   color: "bg-[#9885fa]/20 text-violet-700 border-[#9885fa]/40 dark:bg-[#9885fa]/10 dark:text-[#c4b5fd] dark:border-[#9885fa]/30" },
  { label: "4 review agents",   color: "bg-[#ffd66c]/20 text-amber-700 border-[#ffd66c]/40 dark:bg-[#ffd66c]/10 dark:text-[#ffd66c] dark:border-[#ffd66c]/20" },
]

export default function LoginPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("mg_token")) {
      router.replace("/dashboard")
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) return null

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* ── Background layer ── */}
      <DotPattern className={cn("absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]")} />

      {/* Ambient glows — matching hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,#9885fa,transparent_70%)] opacity-[0.09] dark:opacity-[0.18]" />
        <div className="absolute -right-60 top-10 size-[600px] rounded-full bg-[#ffd66c]/15 blur-[130px] dark:bg-[#ffd66c]/6" />
        <div className="absolute -left-60 top-32 size-[500px] rounded-full bg-[#9885fa]/20 blur-[110px] dark:bg-[#9885fa]/12" />
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 size-[700px] rounded-full bg-[#c9fe87]/8 blur-[150px] dark:bg-[#c9fe87]/4" />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/">
          <LogoWordmark size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-foreground transition-colors dark:text-zinc-400 dark:hover:text-white"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9885fa]/30 bg-[#9885fa]/10 px-4 py-1.5 text-sm font-semibold text-[#7c3aed] dark:text-[#c4b5fd] dark:bg-[#9885fa]/15 dark:border-[#9885fa]/20"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#9885fa] opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[#9885fa]" />
          </span>
          GitHub OAuth · Secure · Free
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          className="mb-3 text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl dark:text-white"
        >
          Merge protection that{" "}
          <span
            style={{
              background: "linear-gradient(135deg,#9885fa 0%,#6cb8ff 50%,#c9fe87 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            reads the PR.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="mb-10 max-w-md text-center text-base text-zinc-500 dark:text-zinc-400"
        >
          AI review agents, policy gates, and conflict detection — unified before anything lands on main.
        </motion.p>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="w-full max-w-sm"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white/90 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {/* Card inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(152,133,250,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(152,133,250,0.18),transparent)]" />

            <div className="relative">
              <h2 className="text-xl font-semibold text-foreground dark:text-white">Sign in to MergeGuard</h2>
              <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                Connect your GitHub account to get started.
              </p>

              {/* GitHub OAuth button */}
              <motion.a
                href="/api/auth/github"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-6 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <GitHubLogoIcon className="size-5" />
                Continue with GitHub
                <ArrowRight className="size-4 ml-auto opacity-60" />
              </motion.a>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-black/8 dark:bg-white/8" />
                <span className="text-xs text-zinc-400 dark:text-zinc-600">what you get</span>
                <div className="h-px flex-1 bg-black/8 dark:bg-white/8" />
              </div>

              {/* Feature list */}
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 dark:border-violet-400/20 dark:bg-violet-400/10">
                      <f.icon className="size-3.5 text-primary dark:text-violet-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground dark:text-white">{f.label}</p>
                      <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
                No credit card required · GitHub OAuth only
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {pills.map((p) => (
            <div
              key={p.label}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
                p.color
              )}
            >
              <CheckCircle2 className="size-3.5" />
              {p.label}
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xs text-zinc-400 dark:text-zinc-600"
        >
          © {new Date().getFullYear()} MergeGuard · Secure OAuth
        </motion.p>
      </div>
    </main>
  )
}
