"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, GitPullRequest, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { createReview } from "@/lib/api"
import type { CurrentUser } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type Repository = {
  id: number
  fullName: string
  githubRepoId: string
  role: string
}

export function StartReviewSheet({
  repositories,
  user,
}: {
  repositories: Repository[]
  user: CurrentUser | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null)
  const [prNumber, setPrNumber] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filteredRepos = useMemo(
    () =>
      repositories.filter((repo) =>
        repo.fullName.toLowerCase().includes(query.toLowerCase())
      ),
    [query, repositories]
  )

  const selected = repositories.find((r) => r.id === selectedRepoId)

  async function handleStart() {
    if (!selected || !prNumber || !user) return
    setSubmitting(true)
    try {
      const job = await createReview({
        prNumber: Number(prNumber),
        repositoryId: selected.id,
        branchName: "",
        githubToken: user.accessToken,
        requesterId: user.id,
        fullRepoName: selected.fullName,
      })
      setOpen(false)
      router.push(`/dashboard/review/${job.id}`)
    } catch {
      alert("Failed to start review. Check if the PR number is valid.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          <GitPullRequest className="size-4" />
          Start review
        </Button>
      </SheetTrigger>

      <SheetContent className="border-black/8 bg-white text-foreground sm:max-w-lg dark:border-white/10 dark:bg-[#101014] dark:text-white">
        <SheetHeader>
          <SheetTitle className="text-foreground dark:text-white">Start a review</SheetTitle>
          <SheetDescription className="text-zinc-500 dark:text-zinc-400">
            Select a connected repository and enter the PR number to kick off a MergeGuard review.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Repository
            </label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search repositories"
                className="border-black/10 bg-black/4 pl-9 text-foreground placeholder:text-zinc-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>

            <div className="mt-3 space-y-2 max-h-52 overflow-y-auto">
              {repositories.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-400">No repositories connected.</p>
              ) : (
                filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => setSelectedRepoId(repo.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-colors",
                      selectedRepoId === repo.id
                        ? "border-primary/30 bg-primary/8 dark:border-violet-400/20 dark:bg-violet-400/10"
                        : "border-black/8 bg-black/4 hover:bg-black/8 dark:border-white/8 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                    )}
                  >
                    <p className="font-medium text-foreground dark:text-white">{repo.fullName}</p>
                    <p className="mt-1 text-sm text-zinc-500">{repo.role}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              PR Number
            </label>
            <Input
              type="number"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              placeholder="e.g. 142"
              className="mt-2 border-black/10 bg-black/4 text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
          </div>

          {selected && (
            <div className="rounded-2xl border border-black/8 bg-black/4 p-4 dark:border-white/8 dark:bg-white/[0.03]">
              <p className="text-sm font-medium text-foreground dark:text-white">Review preview</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                MergeGuard will analyse PR{prNumber ? ` #${prNumber}` : ""} in{" "}
                <span className="font-medium text-foreground dark:text-white">{selected.fullName}</span> using security, logic,
                policy, and style agents.
              </p>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            onClick={handleStart}
            disabled={!selected || !prNumber || submitting || !user}
          >
            {submitting ? "Starting…" : "Start review"}
            {!submitting && <ArrowRight className="size-4" />}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
