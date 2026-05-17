'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, GitPullRequest, Zap, Code2, LogOut, X,
  Search, RefreshCw, ChevronRight, CheckCircle2,
  Clock, AlertCircle, MessageSquare, RotateCcw, Ban,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Repo  { id: number; fullName: string; githubRepoId: string; role: string; }
interface User  { id: number; name: string; email: string; avatarUrl: string | null; accessToken: string | null; }
interface Review {
  id: number; prNumber: number; status: string; branchName: string | null; createdAt: string;
  repository: { fullName: string };
  agentResults: { id: number; agentName: string; severity: string }[];
  finalReport: { synthesizedSummary: string } | null;
}
interface AgentProgress { agentName: string; status: string; findingsCount?: number; }

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'muted'; icon: React.ReactNode }> = {
  QUEUED:           { label: 'Queued',           variant: 'muted',       icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS:      { label: 'In Progress',      variant: 'outline',     icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
  PENDING_FEEDBACK: { label: 'Awaiting Feedback',variant: 'secondary',   icon: <MessageSquare className="h-3 w-3" /> },
  COMPLETED:        { label: 'Completed',        variant: 'default',     icon: <CheckCircle2 className="h-3 w-3" /> },
  FAILED:           { label: 'Failed',           variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  CANCELLED:        { label: 'Cancelled',        variant: 'muted',       icon: <Ban className="h-3 w-3" /> },
};

const AGENTS = ['security', 'performance', 'testing', 'architecture', 'readability'];

const SEV_CFG = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/20',
  high:     'bg-orange-500/15 text-orange-400 border-orange-500/20',
  medium:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  low:      'bg-blue-500/15 text-blue-400 border-blue-500/20',
  info:     'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, variant: 'muted' as const, icon: null };
  return (
    <Badge variant={cfg.variant} className="gap-1 text-[11px]">
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

// ── Live Review Card ──────────────────────────────────────────────────────────
function LiveReviewCard({ review, token, userId, onStatusChange }: {
  review: Review; token: string; userId: number;
  onStatusChange: (id: number, status: string, updatedReview?: Partial<Review>) => void;
}) {
  const [agentProgress, setAgentProgress]   = useState<Record<string, AgentProgress>>({});
  const [summary, setSummary]               = useState<string | null>(null);
  const [feedback, setFeedback]             = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [cancelling, setCancelling]         = useState(false);
  const [expanded, setExpanded]             = useState(false);

  const isActive = ['QUEUED', 'IN_PROGRESS'].includes(review.status);

  useEffect(() => {
    if (!isActive) {
      if (review.finalReport?.synthesizedSummary) {
        try {
          const parsed = JSON.parse(review.finalReport.synthesizedSummary);
          setSummary(parsed.executive_summary ?? null);
        } catch { setSummary(review.finalReport.synthesizedSummary); }
      }
      return;
    }

    const es = new EventSource(
      `${API_URL}/reviews/${review.id}/stream?token=${encodeURIComponent(token)}`
    );

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'agent_progress') {
          setAgentProgress(prev => ({
            ...prev,
            [data.agentName]: { agentName: data.agentName, status: data.status, findingsCount: data.findingsCount },
          }));
          onStatusChange(review.id, 'IN_PROGRESS');
        }
        if (data.type === 'job_completed') {
          onStatusChange(review.id, data.status);
          if (data.findings) {
            const summaryF = data.findings.find((f: any) => f.agent_name === 'summary');
            if (summaryF) {
              try { setSummary(JSON.parse(summaryF.content).executive_summary ?? null); }
              catch { setSummary(summaryF.content); }
            }
          }
          es.close();
        }
      } catch {}
    };

    return () => es.close();
  }, [review.id, isActive, token]);

  async function cancelReview(e: React.MouseEvent) {
    e.stopPropagation();
    if (cancelling) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API_URL}/reviews/${review.id}/cancel`, {
        method: 'POST', headers: authHeaders(token),
        body: JSON.stringify({ requesterId: userId }),
      });
      if (res.ok) onStatusChange(review.id, 'CANCELLED');
    } catch {}
    finally { setCancelling(false); }
  }

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmittingFeedback(true);
    try {
      await fetch(`${API_URL}/reviews/${review.id}/feedback`, {
        method: 'POST', headers: authHeaders(token),
        body: JSON.stringify({ feedback }),
      });
      setFeedback('');
      onStatusChange(review.id, 'IN_PROGRESS');
    } catch {}
    finally { setSubmittingFeedback(false); }
  }

  const issueCount    = review.agentResults.length;
  const criticalCount = review.agentResults.filter(r => r.severity === 'critical' || r.severity === 'high').length;

  return (
    <Card className="overflow-hidden transition-colors hover:bg-accent/30">
      {/* Header row — two sibling elements, no nested buttons */}
      <div className="flex items-center">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-1 min-w-0 text-left px-5 py-4 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate">{review.repository.fullName}</span>
              <span className="text-xs text-muted-foreground">PR #{review.prNumber}</span>
              <StatusBadge status={review.status} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()} · {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {issueCount > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {issueCount} findings{criticalCount > 0 ? ` · ${criticalCount} critical/high` : ''}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform shrink-0', expanded && 'rotate-90')} />
        </button>

        {review.status === 'QUEUED' && (
          <Button
            variant="ghost" size="icon"
            onClick={cancelReview} disabled={cancelling}
            title="Cancel review"
            className="mx-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            {cancelling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>

      {expanded && (
        <>
          <Separator />
          <CardContent className="pt-4 space-y-4">

            {/* Agent progress grid */}
            {(isActive || Object.keys(agentProgress).length > 0 || review.agentResults.length > 0) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Agents</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {AGENTS.map(agent => {
                    const prog     = agentProgress[agent];
                    const dbResult = review.agentResults.find(r => r.agentName === agent);
                    const done     = prog?.status === 'completed' || !!dbResult;
                    const failed   = prog?.status === 'failed';
                    return (
                      <div key={agent} className={cn(
                        'rounded-md border px-2 py-2 text-center text-[11px] font-medium',
                        done   ? 'border-border bg-secondary text-foreground' :
                        failed ? 'border-destructive/30 bg-destructive/10 text-destructive' :
                        isActive ? 'border-border bg-secondary/50 text-muted-foreground' :
                        'border-border/50 bg-secondary/30 text-muted-foreground/60'
                      )}>
                        <div className="mb-1">
                          {done    && <CheckCircle2 className="h-3 w-3 mx-auto text-foreground" />}
                          {!done && isActive && <RefreshCw className="h-3 w-3 mx-auto animate-spin" />}
                          {!done && !isActive && <Clock className="h-3 w-3 mx-auto" />}
                        </div>
                        <span className="capitalize">{agent}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {summary && (
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">AI Summary</p>
                <p className="text-sm leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Findings by severity */}
            {review.agentResults.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2">Findings</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(['critical', 'high', 'medium', 'low', 'info'] as const).map(sev => {
                    const count = review.agentResults.filter(r => r.severity === sev).length;
                    if (!count) return null;
                    return (
                      <span key={sev} className={cn('text-[11px] px-2 py-0.5 rounded border font-medium', SEV_CFG[sev])}>
                        {count} {sev}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback form */}
            {review.status === 'PENDING_FEEDBACK' && (
              <form onSubmit={submitFeedback} className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground">Send Feedback to Re-run</p>
                <div className="flex gap-2">
                  <Input
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="e.g. Focus more on SQL injection risks"
                  />
                  <Button type="submit" size="sm" disabled={!feedback.trim() || submittingFeedback} variant="outline">
                    {submittingFeedback ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    Re-run
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}

// ── Start Review Modal ────────────────────────────────────────────────────────
function StartReviewModal({ open, token, userId, githubToken, onClose, onStarted }: {
  open: boolean; token: string; userId: number; githubToken: string | null;
  onClose: () => void;
  onStarted: (review: Review) => void;
}) {
  const [repos, setRepos]       = useState<Repo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<Repo | null>(null);
  const [prNumber, setPrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_URL}/auth/me/repositories`, { headers: authHeaders(token) })
      .then(r => r.json())
      .then(data => { setRepos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('Failed to load repositories.'); setLoading(false); });
  }, [open, token]);

  const filtered = repos.filter(r => r.fullName.toLowerCase().includes(search.toLowerCase()));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !prNumber) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST', headers: authHeaders(token),
        body: JSON.stringify({
          repositoryId: selected.id, fullRepoName: selected.fullName,
          prNumber: parseInt(prNumber), branchName: 'unknown',
          requesterId: userId, githubToken: githubToken ?? token,
        }),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? `HTTP ${res.status}`); }
      const job = await res.json();
      onStarted({
        id: job.id, prNumber: job.prNumber, status: 'QUEUED',
        branchName: job.branchName, createdAt: job.createdAt,
        repository: { fullName: selected.fullName },
        agentResults: [], finalReport: null,
      });
      setSelected(null); setPrNumber(''); setSearch('');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-background shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-heading font-bold tracking-tight">Start a Review</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Select a repository and provide the Pull Request number.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
          {/* Repo picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Repository</label>
              {selected && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium animate-in fade-in zoom-in-95">
                  Selected
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 border border-dashed rounded-xl bg-muted/30">
                <RefreshCw className="h-5 w-5 animate-spin text-primary/60" />
                <p className="text-sm text-muted-foreground font-medium italic text-center">Discovering your projects...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search repositories…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 h-11 bg-muted/50 border-muted-foreground/10 focus:bg-background transition-all rounded-xl"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                  {filtered.map(repo => (
                    <button
                      key={repo.id} type="button"
                      onClick={() => setSelected(repo)}
                      className={cn(
                        'w-full text-left p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group',
                        selected?.id === repo.id 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[0.99]' 
                          : 'hover:bg-muted bg-transparent border border-transparent hover:border-muted-foreground/10'
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        selected?.id === repo.id ? "bg-white/20" : "bg-muted-foreground/10 group-hover:bg-white"
                      )}>
                        <GitPullRequest className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate leading-none mb-1">{repo.fullName}</p>
                        <p className={cn(
                          "text-[10px] font-medium uppercase tracking-tighter opacity-70",
                        )}>
                          {repo.role}
                        </p>
                      </div>
                      {selected?.id === repo.id && (
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20">
                      <p className="text-sm text-muted-foreground font-medium">No repositories found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PR number */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Pull Request Details</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded border border-muted-foreground/10 group-focus-within:border-primary/30 transition-colors">
                #
              </div>
              <Input
                type="number" min="1" placeholder="Enter PR Number (e.g. 42)"
                value={prNumber} onChange={e => setPrNumber(e.target.value)} required
                className="pl-12 h-11 bg-muted/50 border-muted-foreground/10 focus:bg-background transition-all rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting} className="flex-1 h-11 font-semibold rounded-xl hover:bg-muted transition-all">
              Cancel
            </Button>
            <Button type="submit" disabled={!selected || !prNumber || submitting} className="flex-[1.5] h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-xl transition-all active:scale-[0.98] disabled:grayscale disabled:opacity-50">
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4 fill-current" />
                  Initiate Review
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, loading }: {
  label: string; value: number; icon: React.ElementType; loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">
          {loading ? <span className="text-muted-foreground text-2xl">…</span> : value}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken]               = useState<string | null>(null);
  const [user, setUser]                 = useState<User | null>(null);
  const [reviews, setReviews]           = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showModal, setShowModal]       = useState(false);

  const fetchReviews = useCallback(async (t: string, u: User) => {
    try {
      const res = await fetch(`${API_URL}/reviews?requesterId=${u.id}`, { headers: authHeaders(t) });
      if (res.ok) setReviews(await res.json());
    } catch {}
    finally { setLoadingReviews(false); }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('mg_token');
    if (!t) { router.replace('/auth/login'); return; }
    setToken(t);
    fetch(`${API_URL}/auth/me`, { headers: authHeaders(t) })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) { setUser(data); fetchReviews(t, data); }
        else setLoadingReviews(false);
      })
      .catch(() => setLoadingReviews(false));
  }, [router, fetchReviews]);

  function handleLogout() {
    localStorage.removeItem('mg_token');
    router.replace('/auth/login');
  }

  function handleStatusChange(id: number, status: string) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (['PENDING_FEEDBACK', 'COMPLETED', 'FAILED'].includes(status) && token && user) {
      setTimeout(() => fetchReviews(token, user), 800);
    }
  }

  function handleReviewStarted(review: Review) {
    setReviews(prev => [review, ...prev]);
    setShowModal(false);
  }

  if (!token) return null;

  const totalIssues    = reviews.reduce((s, r) => s + r.agentResults.length, 0);
  const reposReviewed  = new Set(reviews.map(r => r.repository?.fullName)).size;
  const activeReviews  = reviews.filter(r => ['QUEUED', 'IN_PROGRESS'].includes(r.status));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top navigation */}
      <header className="h-14 border-b border-border flex items-center px-6 gap-3">
        <Shield className="h-4 w-4" />
        <span className="font-semibold text-sm tracking-tight">MergeGuard</span>

        {activeReviews.length > 0 && (
          <div className="flex items-center gap-1.5 ml-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
            </span>
            <span className="text-xs text-muted-foreground">
              {activeReviews.length} running
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user?.avatarUrl && (
            <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full border border-border" />
          )}
          <span className="text-sm hidden sm:block">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-1.5">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Your AI code review hub.'}
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} size="sm" className="gap-1.5">
            <GitPullRequest className="h-3.5 w-3.5" />
            Start Review
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Reviews Run"    value={reviews.length} icon={Activity}       loading={loadingReviews} />
          <StatCard label="Issues Found"   value={totalIssues}    icon={Zap}            loading={loadingReviews} />
          <StatCard label="Repos Reviewed" value={reposReviewed}  icon={Code2}          loading={loadingReviews} />
        </div>

        {/* Reviews section */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Reviews</h2>
          {!loadingReviews && reviews.length > 0 && (
            <span className="text-xs text-muted-foreground">{reviews.length} total</span>
          )}
        </div>

        {loadingReviews ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-16 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="p-3 rounded-full border border-border bg-secondary">
                <GitPullRequest className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">No reviews yet</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                  Pick a repository and PR number to run your first AI code review.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowModal(true)} className="mt-1">
                Start your first review
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reviews.map(review => (
              <LiveReviewCard
                key={review.id}
                review={review}
                token={token}
                userId={user!.id}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {token && user && (
        <StartReviewModal
          open={showModal}
          token={token}
          userId={user.id}
          githubToken={user.accessToken}
          onClose={() => setShowModal(false)}
          onStarted={handleReviewStarted}
        />
      )}
    </div>
  );
}
