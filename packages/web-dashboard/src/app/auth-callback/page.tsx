'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Suspense } from 'react';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('mg_token', token);
      router.replace('/dashboard');
    } else {
      router.replace('/auth/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="p-3 bg-blue-500/20 rounded-xl animate-pulse">
        <Shield className="h-8 w-8 text-blue-400" />
      </div>
      <p className="text-slate-300 text-sm">Completing sign-in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackInner />
    </Suspense>
  );
}
