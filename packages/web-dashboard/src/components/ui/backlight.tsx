import { cn } from "@/lib/utils"

interface BacklightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  blur?: number
  opacity?: number
  color?: string
}

export function Backlight({
  children,
  className,
  blur = 80,
  opacity = 0.5,
  color = "#9b8cff",
  ...props
}: BacklightProps) {
  return (
    <div className={cn("relative isolate", className)} {...props}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          filter: `blur(${blur}px)`,
          opacity,
          backgroundColor: color,
          borderRadius: "inherit",
        }}
      />
      {children}
    </div>
  )
}
