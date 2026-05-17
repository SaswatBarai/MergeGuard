"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { motion } from "motion/react"
import { useState, useEffect } from "react"

import { LogoWordmark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useCurrentUser } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#features", label: "Platform" },
  { href: "#workflow", label: "Workflow" },
  { href: "#pricing", label: "Pricing" },
] as const

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-bold text-foreground transition-opacity hover:opacity-80"
    >
      <LogoWordmark size="lg" />
    </Link>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useCurrentUser()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center p-4 transition-all duration-300 pointer-events-none">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "pointer-events-auto flex items-center justify-between w-full max-w-6xl px-5 py-2.5 rounded-2xl border transition-all duration-500",
          scrolled
            ? "bg-white/90 border-black/8 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-zinc-950/80 dark:border-white/8 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            : "bg-white/60 border-black/5 backdrop-blur-md dark:bg-zinc-950/40 dark:border-white/5"
        )}
      >
        <Brand />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-full px-4 py-1.5 text-sm font-medium text-zinc-500 transition-all hover:text-foreground hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/8"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!loading && user ? (
            /* Authenticated — avatar only */
            <Link href="/dashboard" title="Go to dashboard">
              <div className="relative size-8 overflow-hidden rounded-full border-2 border-[#9885fa]/40 shadow-sm hover:border-[#9885fa] transition-colors">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-400/40 via-sky-400/30 to-lime-300/30 text-xs font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
            </Link>
          ) : !loading ? (
            /* Unauthenticated */
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-zinc-500 hover:text-foreground transition-colors px-2 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign in
              </Link>
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
                <Button
                  size="sm"
                  className="rounded-full h-9 px-5 bg-[#9885fa] hover:bg-[#7c5cf6] text-white border-0 shadow-lg shadow-[#9885fa]/30 hover:shadow-[#7c5cf6]/40 transition-all font-bold text-sm"
                  asChild
                >
                  <Link href="/dashboard">Start free</Link>
                </Button>
              </motion.div>
            </>
          ) : null}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle size="sm" />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-black/10 bg-black/5 text-foreground hover:bg-black/8 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="border-black/8 bg-white/95 backdrop-blur-2xl text-foreground dark:border-white/10 dark:bg-zinc-950/95 dark:text-white pt-20"
            >
              <SheetHeader className="hidden">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 items-center py-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-2xl font-bold text-zinc-500 hover:text-foreground transition-colors dark:text-zinc-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px w-12 bg-black/10 my-4 dark:bg-white/10" />
                {!loading && user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-full border-2 border-[#9885fa]/40">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-400/40 via-sky-400/30 to-lime-300/30 text-sm font-bold text-white">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground dark:text-white">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full max-w-xs rounded-full mt-2 bg-[#9885fa] hover:bg-[#7c5cf6] border-0 font-bold text-white shadow-lg shadow-[#9885fa]/30"
                      size="lg"
                      asChild
                    >
                      <Link href="/dashboard">Go to dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-lg font-medium text-zinc-500 hover:text-foreground transition-colors dark:text-zinc-400 dark:hover:text-white"
                    >
                      Sign in
                    </Link>
                    <Button
                      className="w-full max-w-xs rounded-full mt-4 bg-[#9885fa] hover:bg-[#7c5cf6] border-0 font-bold text-white shadow-lg shadow-[#9885fa]/30"
                      size="lg"
                      asChild
                    >
                      <Link href="/dashboard">Start free</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </motion.header>
    </div>
  )
}
