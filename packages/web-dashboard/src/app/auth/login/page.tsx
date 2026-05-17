'use client';

import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'http://localhost:3001';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-secondary">
            <Shield className="h-6 w-6 text-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">MergeGuard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI-powered code review</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-medium">Sign in</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect your GitHub account to get started.
            </p>
          </div>

          <Separator className="mb-5" />

          <Button asChild className="w-full" size="lg">
            <a href={`${AUTH_SERVICE_URL}/auth/github`}>
              <GitHubIcon className="h-4 w-4" />
              Continue with GitHub
            </a>
          </Button>

          <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
