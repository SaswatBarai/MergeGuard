"use client"

import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const options = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
] as const

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section className="rounded-[28px] border border-black/8 bg-white overflow-hidden dark:border-white/8 dark:bg-[#111114]">
      <div className="border-b border-black/6 px-6 py-5 dark:border-white/6">
        <h2 className="text-base font-semibold text-foreground dark:text-white">Appearance</h2>
        <p className="mt-1 text-xs text-zinc-500">Choose how MergeGuard looks for you.</p>
      </div>

      <div className="px-6 py-5">
        <div className="grid max-w-sm grid-cols-2 gap-3">
          {options.map(({ value, label, icon: Icon }) => {
            const active = mounted && theme === value

            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-[22px] border p-4 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-primary/30 bg-primary/8 text-primary shadow-[0_0_20px_rgba(124,58,237,0.08)] dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-white dark:shadow-[0_0_20px_rgba(155,140,255,0.15)]"
                    : "border-black/8 bg-black/4 text-zinc-500 hover:border-black/12 hover:bg-black/8 hover:text-foreground dark:border-white/8 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:border-white/12 dark:hover:bg-white/[0.05] dark:hover:text-zinc-200"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-2xl border",
                    active
                      ? "border-primary/20 bg-primary/10 text-primary dark:border-violet-300/15 dark:bg-violet-300/10 dark:text-violet-200"
                      : "border-black/8 bg-zinc-100 text-zinc-400 dark:border-white/8 dark:bg-black/20 dark:text-zinc-400"
                  )}
                >
                  <Icon className="size-4" />
                </div>

                {label}

                {active && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary dark:text-violet-200">
                    Active
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
