'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Code2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-xl tracking-tight">MergeGuard</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Docs
          </Link>
          <Link 
            href="/auth/login"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-dot-pattern">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-heading">
                  AI-Powered Code Reviews that <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Actually Work</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Catch bugs, security flaws, and performance bottlenecks before they hit production.
                  The only review platform with human-in-the-loop AI orchestration.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/auth/login"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Start Your First Review <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="https://github.com"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  View on GitHub
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading">Instant Feedback</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Receive comprehensive analysis within minutes of opening a Pull Request.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading">Security First</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Dedicated AI agents scan for OWASP vulnerabilities and credential leaks.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-xl bg-background shadow-sm">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading">Multi-Agent Brain</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Separate specialized agents for logic, performance, and readability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2026 MergeGuard AI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
