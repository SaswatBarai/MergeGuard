"use client"

import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  size?: "sm" | "default"
}

export function ThemeToggle({ className, size = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-full bg-white/5 border border-white/10",
          size === "sm" ? "size-8" : "size-9",
          className
        )}
      />
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "rounded-full border transition-all duration-300",
        size === "sm" ? "size-8" : "size-9",
        isDark
          ? "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          : "border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {isDark ? (
        <Sun className={cn("transition-transform", size === "sm" ? "size-3.5" : "size-4")} />
      ) : (
        <Moon className={cn("transition-transform", size === "sm" ? "size-3.5" : "size-4")} />
      )}
    </Button>
  )
}
