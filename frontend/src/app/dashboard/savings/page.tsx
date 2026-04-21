'use client';

import { TrendingUp, CheckCircle2, PoundSterling } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { dashboardApi } from '@/lib/api/client';
import { formatCurrency, formatDate, cn } from '@/lib/utils/cn';
import { Badge, Card, CardHeader, CardBody, EmptyState, LoadingPage, Skeleton } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { SavingsChart } from '@/components/dashboard/SavingsChart';

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; badge: 'green' | 'amber' | 'blue' | 'purple' | 'pink' | 'gray' }> = {
  benefits:  { label: 'Benefits',  emoji: '💷', badge: 'green'  },
  energy:    { label: 'Energy',    emoji: '⚡', badge: 'amber'  },
  broadband: { label: 'Broadband', emoji: '📡', badge: 'blue'   },
  insurance: { label: 'Insurance', emoji: '🛡️', badge: 'purple' },
  mobile:    { label: 'Mobile',    emoji: '📱', badge: 'pink'   },
  other:     { label: 'Other',     emoji: '📄', badge: 'gray'   },
};

export default function SavingsPage() {
  const { data, loading, refetch } = useApi(() => dashboardApi.getSavings() as any);
  const d       = (data as any)?.data;
  const records = d?.records || [];
  const totals  = d?.totals  || [];

  const totalAnnual  = records.reduce((s: number, r: any) => s + r.annualSaving, 0);
  const totalClaimed = records.filter((r: any) => r.claimed).reduce((s: number, r: any) => s + r.annualSaving, 0);
  const pending      = totalAnnual - totalClaimed;
  const claimedCount = records.filter((r: any) => r.claimed).length;

  const handleClaim = async (id: string) => {
    await dashboardApi.markSavingClaimed(id);
    refetch();
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          My Savings
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">Every saving and benefit we've found for you</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3 animate-fade-up">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total potential</p>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{formatCurrency(totalAnnual)}</p>
          <p className="text-xs text-slate-400 mt-0.5">per year across all categories</p>
        </div>
        <div className="card p-5 border-emerald-100 bg-emerald-50/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-1">Already claimed</p>
          <p className="text-3xl font-extrabold text-emerald-600 tabular-nums">{formatCurrency(totalClaimed)}</p>
          <p className="text-xs text-emerald-400 mt-0.5">{claimedCount} saving{claimedCount !== 1 ? 's' : ''} actioned</p>
        </div>
        <div className="card p-5 border-amber-100 bg-amber-50/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">Still to claim</p>
          <p className="text-3xl font-extrabold text-amber-600 tabular-nums">{formatCurrency(pending)}</p>
          <p className="text-xs text-amber-400 mt-0.5">waiting for you to act</p>
        </div>
      </div>

      {records.length === 0 ? (
        <Card>
          <EmptyState
            icon={<TrendingUp className="h-8 w-8" />}
            title="No savings found yet"
            description="Run a benefits check or upload a bill — we'll find savings and track them all here"
            action={<Button size="md">Go to Benefits Check</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart */}
          {totals.length > 0 && (
            <Card>
              <CardHeader title="Savings by category" />
              <CardBody>
                <SavingsChart data={totals} />
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {totals.map((t: any) => {
                    const cfg = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.other;
                    return (
                      <div key={t.category} className="flex items-center gap-1.5">
                        <span>{cfg.emoji}</span>
                        <span className="text-xs text-slate-500 capitalize">{t.category}</span>
                        <span className="text-xs font-semibold text-gray-700 tabular-nums">
                          {formatCurrency(t._sum.annualSaving)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Progress towards claiming */}
          {totalAnnual > 0 && (
            <Card>
              <CardHeader title="Claiming progress" />
              <CardBody className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-500">Claimed</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {totalAnnual > 0 ? Math.round((totalClaimed / totalAnnual) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${totalAnnual > 0 ? (totalClaimed / totalAnnual) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-slate-400">{formatCurrency(totalClaimed)} claimed</span>
                    <span className="text-xs text-slate-400">{formatCurrency(totalAnnual)} total</span>
                  </div>
                </div>

                {totals.map((t: any) => {
                  const cfg = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.other;
                  const categoryRecords = records.filter((r: any) => r.category === t.category);
                  const categoryClaimed = categoryRecords.filter((r: any) => r.claimed).reduce((s: number, r: any) => s + r.annualSaving, 0);
                  const pct = t._sum.annualSaving > 0 ? (categoryClaimed / t._sum.annualSaving) * 100 : 0;

                  return (
                    <div key={t.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.emoji}</span>
                          <span className="text-xs font-medium text-gray-700 capitalize">{t.category}</span>
                        </div>
                        <span className="text-xs text-slate-500 tabular-nums">{formatCurrency(t._sum.annualSaving)}/yr</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Savings list */}
      {records.length > 0 && (
        <Card>
          <CardHeader
            title={`All savings (${records.length})`}
            subtitle="Mark items as claimed once you've taken action"
          />
          <div className="divide-y divide-slate-50">
            {records.map((r: any) => {
              const cfg = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.other;
              return (
                <div
                  key={r.id}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 transition-opacity',
                    r.claimed && 'opacity-50',
                  )}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg">
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium text-slate-900">{r.description}</p>
                      <Badge variant={cfg.badge}>{cfg.label}</Badge>
                      {r.claimed && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />Claimed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 tabular-nums">
                        {formatCurrency(r.annualSaving)}/yr
                      </p>
                    </div>
                    {!r.claimed && (
                      <Button variant="outline" size="sm" onClick={() => handleClaim(r.id)}>
                        Mark claimed
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
