"use client"

import { useEffect, useState } from "react"
import { Clock, KeyRound, ShieldCheck } from "lucide-react"

import { ApiKeyActions, GenerateKeySheet } from "@/components/dashboard/api-key-actions"
import { AppearanceSection } from "@/components/dashboard/appearance-section"
import { StatusBadge } from "@/components/status-badge"
import { listApiKeys } from "@/lib/api"
import { cn } from "@/lib/utils"

type ApiKey = {
  id: number
  name: string
  createdAt: string
  lastUsedAt: string | null
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  const reload = () => {
    listApiKeys()
      .then(setApiKeys)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  const metricCards = [
    {
      icon: KeyRound,
      label: "Active keys",
      value: apiKeys.length.toString(),
      iconWrap: "bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-400/12 dark:text-violet-200 dark:border-violet-300/15",
      accent: "from-violet-500/15 via-violet-400/8 to-transparent",
      extra: null,
    },
    {
      icon: ShieldCheck,
      label: "Unique scopes in use",
      value: "—",
      iconWrap: "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-400/12 dark:text-emerald-200 dark:border-emerald-300/15",
      accent: "from-emerald-500/15 via-lime-300/8 to-transparent",
      extra: null,
    },
    {
      icon: Clock,
      label: "Keys older than 90 days",
      value: "0",
      iconWrap: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-400/10 dark:text-zinc-300 dark:border-white/10",
      accent: "from-zinc-500/15 via-zinc-400/8 to-transparent",
      extra: <StatusBadge tone="emerald">Healthy</StatusBadge>,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header card */}
      <section className="flex flex-col gap-4 rounded-[30px] border border-black/8 bg-white p-6 sm:flex-row sm:items-start sm:justify-between sm:p-7 dark:border-white/8 dark:bg-[#111114]">
        <div className="max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary dark:text-violet-200">
            Settings
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl dark:text-white">
            API key management
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            Generate and revoke scoped credentials for CLI and CI review triggers.
          </p>
        </div>
        <GenerateKeySheet onCreated={reload} />
      </section>

      {/* Metric cards */}
      <section className="grid gap-4 lg:grid-cols-3">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-[26px] border border-black/8 bg-white p-5 dark:border-white/8 dark:bg-[#111114]"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br", card.accent)} />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-foreground dark:text-white">{card.value}</p>
              </div>
              {card.extra}
            </div>
            <div className="relative mt-4">
              <div className={cn("flex size-11 items-center justify-center rounded-2xl border", card.iconWrap)}>
                <card.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <AppearanceSection />

      {/* API keys list */}
      <section className="rounded-[28px] border border-black/8 bg-white overflow-hidden dark:border-white/8 dark:bg-[#111114]">
        <div className="border-b border-black/6 px-6 py-5 dark:border-white/6">
          <h2 className="text-base font-semibold text-foreground dark:text-white">Active API keys</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Token values are masked. A real token is revealed only once on creation.
          </p>
        </div>

        <div className="divide-y divide-black/6 dark:divide-white/6">
          {loading ? (
            <p className="px-6 py-8 text-center text-sm text-zinc-400">Loading API keys…</p>
          ) : apiKeys.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-zinc-400">No API keys yet. Generate one above.</p>
          ) : (
            apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="grid gap-4 px-6 py-5 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] lg:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground dark:text-white">{apiKey.name}</h3>
                  </div>

                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                    Created {new Date(apiKey.createdAt).toLocaleDateString()} ·
                    {apiKey.lastUsedAt
                      ? ` last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`
                      : " never used"}
                  </p>
                </div>

                <ApiKeyActions apiKey={apiKey} onRevoked={reload} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
