import Link from "next/link"
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"

import { LogoWordmark } from "@/components/brand/logo"

const footerLinks = [
  {
    label: "Product",
    links: [
      { href: "#features", label: "Platform" },
      { href: "#workflow", label: "Workflow" },
      { href: "#pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard shell" },
    ],
  },
  {
    label: "Resources",
    links: [
      { href: "/dashboard/review/rev-2847", label: "Live review" },
      { href: "/dashboard/settings", label: "API keys" },
      { href: "/auth/login", label: "Sign in" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Changelog" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-black/6 bg-background dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground dark:text-white transition-opacity hover:opacity-80">
              <LogoWordmark size="md" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-500">
              AI-powered merge protection that reads your pull requests before they land on main.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-black/4 text-zinc-500 transition-colors hover:bg-black/8 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="GitHub"
              >
                <GitHubLogoIcon className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-black/4 text-zinc-500 transition-colors hover:bg-black/8 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Twitter"
              >
                <TwitterLogoIcon className="size-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">{group.label}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-black/6 dark:border-white/5 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            © {new Date().getFullYear()} MergeGuard. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-zinc-400 hover:text-foreground dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-zinc-400 hover:text-foreground dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
