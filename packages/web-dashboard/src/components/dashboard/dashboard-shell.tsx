"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  KeyRound,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react"

import { LogoMark } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "API keys", icon: KeyRound },
]

function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useCurrentUser()

  const displayName = user?.name ?? "Guest"
  const displayEmail = user?.email ?? "Not signed in"
  const initial = displayName.charAt(0)

  return (
    <Sidebar collapsible="icon" className="border-r border-black/8 bg-white dark:border-white/6 dark:bg-[#0b0b0e]">
      {/* Logo — wordmark when expanded, mark-only when collapsed */}
      <SidebarHeader className="px-3 py-4">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <LogoMark size="sm" className="shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden text-base font-semibold tracking-tight text-foreground dark:text-white">
            MergeGuard
          </span>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup className="px-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "h-10 rounded-xl transition-all duration-150",
                        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                        active
                          ? "bg-primary/10 text-primary dark:bg-violet-400/12 dark:text-violet-200"
                          : "text-zinc-500 hover:bg-black/4 hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 px-3">
                        <item.icon className="size-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-3 space-y-2">
        {/* Status widget — only in expanded state */}
        <div className="group-data-[collapsible=icon]:hidden rounded-2xl border border-primary/12 bg-gradient-to-br from-primary/6 via-blue-400/4 to-transparent p-3.5 dark:border-violet-400/12 dark:from-violet-400/8 dark:via-sky-400/4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground dark:text-white">
            <Sparkles className="size-3.5 text-primary dark:text-violet-300" />
            MergeGuard
          </div>
          <p className="mt-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
            Orchestration healthy.
          </p>
        </div>

        {/* User row — full when expanded, avatar-only when collapsed */}
        <div className="group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:p-0 rounded-2xl border border-black/8 bg-zinc-50/80 p-2.5 dark:border-white/8 dark:bg-white/[0.03] transition-all">
          <div className="flex items-center gap-2.5">
            {/* Avatar — always visible */}
            <button
              onClick={logout}
              title={user ? "Sign out" : undefined}
              className="relative flex size-8 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-violet-400/40 via-sky-400/30 to-lime-300/30 text-xs font-bold text-white hover:opacity-80 transition-opacity"
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                initial
              )}
            </button>
            {/* Name + email — expanded only */}
            <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground dark:text-white">{displayName}</p>
              <p className="truncate text-[11px] text-zinc-500">{displayEmail}</p>
            </div>
            {user && (
              <button
                onClick={logout}
                title="Sign out"
                className="group-data-[collapsible=icon]:hidden shrink-0 text-zinc-400 hover:text-foreground dark:hover:text-white"
              >
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser()

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />

        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          {/* Top header */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-black/8 bg-white/80 px-4 backdrop-blur-xl sm:px-6 dark:border-white/6 dark:bg-zinc-950/80">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="rounded-xl border border-black/10 bg-black/4 p-2 text-foreground hover:bg-black/8 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]" />
              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  Control center
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground dark:text-zinc-200">
                  {user?.name ?? "MergeGuard"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-black/10 bg-black/4 text-zinc-600 hover:bg-black/8 hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                asChild
              >
                <Link href="/">Public site</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
