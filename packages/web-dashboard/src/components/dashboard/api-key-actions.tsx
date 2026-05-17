"use client"

import { useState } from "react"
import { Check, Copy, KeyRound, Plus, ShieldAlert, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createApiKey, revokeApiKey } from "@/lib/api"
import { cn } from "@/lib/utils"

type ApiKey = {
  id: number
  name: string
  createdAt: string
  lastUsedAt: string | null
}

// ── Revoke confirmation dialog ───────────────────────────────────────────────

export function ApiKeyActions({ apiKey, onRevoked }: { apiKey: ApiKey; onRevoked: () => void }) {
  const [open, setOpen] = useState(false)
  const [revoking, setRevoking] = useState(false)

  async function handleRevoke() {
    setRevoking(true)
    try {
      await revokeApiKey(apiKey.id)
      setOpen(false)
      onRevoked()
    } catch {
      alert("Failed to revoke key.")
    } finally {
      setRevoking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="rounded-full"
        >
          <Trash2 className="size-3.5" />
          Revoke
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-400/20 dark:bg-red-400/10">
            <ShieldAlert className="size-5 text-red-500 dark:text-red-400" />
          </div>
          <DialogTitle>Revoke API key?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground dark:text-zinc-200">"{apiKey.name}"</span> will
            stop working immediately. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-full border-black/10 dark:border-white/10"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={revoking}
            className="rounded-full"
          >
            {revoking ? "Revoking…" : "Yes, revoke key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Generate key dialog ──────────────────────────────────────────────────────

export function GenerateKeySheet({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    if (!label.trim()) return
    setCreating(true)
    try {
      const result = await createApiKey(label.trim())
      setNewKey(result.key)
      onCreated()
    } catch {
      alert("Failed to create API key.")
    } finally {
      setCreating(false)
    }
  }

  function handleCopy() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose(v: boolean) {
    setOpen(v)
    if (!v) {
      setTimeout(() => {
        setLabel("")
        setNewKey(null)
        setCopied(false)
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          <Plus className="size-4" />
          Generate key
        </Button>
      </DialogTrigger>

      <DialogContent>
        {newKey ? (
          /* ── Step 2: key revealed ── */
          <>
            <DialogHeader>
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                <KeyRound className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <DialogTitle>Your new API key</DialogTitle>
              <DialogDescription>
                Copy this key now — it won't be shown again after you close this dialog.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 space-y-4">
              {/* Key display + copy button */}
              <div className="group relative rounded-2xl border border-black/8 bg-zinc-50 dark:border-white/8 dark:bg-white/[0.04]">
                <p className="break-all px-4 py-4 pr-14 font-mono text-sm text-zinc-700 dark:text-zinc-200 leading-6">
                  {newKey}
                </p>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "absolute right-3 top-3 flex size-8 items-center justify-center rounded-xl border transition-all",
                    copied
                      ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-400"
                      : "border-black/8 bg-white text-zinc-400 hover:border-black/12 hover:text-zinc-700 dark:border-white/8 dark:bg-white/[0.06] dark:hover:text-white"
                  )}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </button>
              </div>

              {/* Copy confirmation bar */}
              <div className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-300",
                copied
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/8 dark:text-emerald-300"
                  : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/8 dark:text-amber-300"
              )}>
                {copied
                  ? <><Check className="size-4 shrink-0" /> Copied to clipboard!</>
                  : <><KeyRound className="size-4 shrink-0" /> Click the copy icon to copy your key</>
                }
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:w-auto"
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* ── Step 1: name input ── */
          <>
            <DialogHeader>
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 dark:border-violet-400/20 dark:bg-violet-400/10">
                <KeyRound className="size-5 text-violet-600 dark:text-violet-300" />
              </div>
              <DialogTitle>Generate API key</DialogTitle>
              <DialogDescription>
                Give this key a descriptive name so you can identify it later.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 space-y-2">
              <Label htmlFor="key-label" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Key label
              </Label>
              <Input
                id="key-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. CI pipeline · main"
                className="rounded-2xl border-black/10 bg-black/4 text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                autoFocus
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                Choose something that describes where this key will be used.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                className="rounded-full border-black/10 dark:border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !label.trim()}
                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {creating ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
