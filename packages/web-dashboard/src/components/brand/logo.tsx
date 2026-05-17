import type React from "react"

import { cn } from "@/lib/utils"

type LogoSize = "sm" | "md" | "lg" | "xl"
type LogoTone = "brand" | "mono"

const markSizes: Record<LogoSize, string> = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
  xl: "size-16",
}

const wordmarkTextSizes: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
}

export function LogoMark({
  size = "md",
  tone = "brand",
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: LogoSize
  tone?: LogoTone
}) {
  const nodeColor = tone === "brand" ? "var(--warning)" : "currentColor"

  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="MergeGuard"
      className={cn(
        "shrink-0 overflow-visible text-primary",
        tone === "mono" && "text-current",
        markSizes[size],
        className
      )}
      fill="none"
      {...props}
    >
      <path
        d="M24 4.75 38.25 10.5v12.3c0 9.2-5.85 17.45-14.25 20.45C15.6 40.25 9.75 32 9.75 22.8V10.5L24 4.75Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M18 16.5v8.25c0 3.6 2.9 6.5 6.5 6.5H30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 19.25v12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m25.5 23.75 4.5-4.5 4.5 4.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="16.5" r="3.25" fill={nodeColor} />
      <circle cx="30" cy="31.25" r="3.25" fill={nodeColor} />
    </svg>
  )
}

export function LogoWordmark({
  size = "md",
  tone = "brand",
  className,
  markClassName,
}: {
  size?: LogoSize
  tone?: LogoTone
  className?: string
  markClassName?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground",
        wordmarkTextSizes[size],
        className
      )}
    >
      <LogoMark size={size} tone={tone} className={markClassName} />
      <span>MergeGuard</span>
    </span>
  )
}
