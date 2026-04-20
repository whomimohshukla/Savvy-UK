'use client';

import { ArrowRight, PoundSterling, Zap, Bell, FileText, TrendingUp, RefreshCw, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/useApi';
import { dashboardApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils/cn';
import { StatCard } from '@/components/dashboard/StatCard';
import { SavingsChart } from '@/components/dashboard/SavingsChart';
import { Card, CardHeader, CardBody, LoadingPage, EmptyState } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, loading, error, refetch } = useApi(() => dashboardApi.getDashboard() as any);
  const d = (data as any)?.data;

  if (loading) return <LoadingPage />;

  if (error) return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
      <p className="font-bold text-red-800">Failed to load dashboard</p>
      <p className="text-sm text-red-600 mt-1">{error}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>Try again</Button>
    </div>
  );

  const firstName       = user?.name?.split(' ')[0] || '';
  const totalPotential  = d?.summary?.totalPotentialSaving ?? 0;
  const benefitsFound   = d?.summary?.benefitsFound ?? 0;
  const unreadAlerts    = d?.summary?.unreadAlerts ?? 0;
  const energySaving    = d?.latestEnergyScan?.potentialSaving ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* ── Welcome header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {firstName ? `${greeting}, ${firstName} 👋` : 'Your savings dashboard'}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="flex-shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ── Hero banner ── */}
      {totalPotential > 0 ? (
        <div className="animate-fade-up relative overflow-hidden rounded-3xl p-7 text-white shadow-xl"
          style={{ background: 'linear-gradient(135deg, #030c18 0%, #051a1a 40%, #041524 70%, #030c18 100%)' }}
        >
          {/* orbs */}
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <p className="text-emerald-400 text-sm font-semibold">Total potential savings found</p>
            </div>
            <p className="text-6xl font-black tracking-tight mb-1.5">
              {formatCurrency(totalPotential)}
            </p>
            <p className="text-slate-400 text-sm mb-6">per year — ready for you to claim</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/benefits"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 transition-colors shadow-glow-sm"
              >
                View all savings <ArrowRight className="h-4 w-4" />
              </Link>
              {!d?.latestBenefits && (
                <Link
                  href="/dashboard/benefits"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
                >
                  Run benefits check
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* First-time CTA */
        <div className="animate-fade-up relative overflow-hidden rounded-3xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <Sparkles className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Discover your savings</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Run a benefits check to find out how much money you could be claiming.
            The average UK household finds <strong className="text-slate-700">£2,700/year</strong>.
          </p>
          <Link href="/dashboard/benefits">
            <Button size="lg" className="shadow-glow-sm">
              Start benefits check <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up stagger-1">
        <StatCard
          label="Benefits found"
          value={benefitsFound}
          subvalue={benefitsFound > 0 ? `${formatCurrency(d?.latestBenefits?.totalPotentialValue ?? 0)}/yr` : 'None yet'}
          icon={<PoundSterling className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
          href="/dashboard/benefits"
          highlight={benefitsFound > 0}
        />
        <StatCard
          label="Energy saving"
          value={energySaving > 0 ? formatCurrency(energySaving) : 'Not scanned'}
          subvalue={energySaving > 0 ? 'per year' : 'Run a scan'}
          icon={<Zap className="h-5 w-5 text-amber-500" />}
          iconBg="bg-amber-100"
          href="/dashboard/energy"
        />
        <StatCard
          label="Bills analysed"
          value={d?.recentBills?.length ?? 0}
          subvalue="bills uploaded"
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-100"
          href="/dashboard/bills"
        />
        <StatCard
          label="Unread alerts"
          value={unreadAlerts}
          subvalue={unreadAlerts > 0 ? 'need attention' : 'All caught up!'}
          icon={<Bell className="h-5 w-5 text-violet-500" />}
          iconBg="bg-violet-100"
          href="/dashboard/alerts"
        />
      </div>

      {/* ── Lower row ── */}
      <div className="grid gap-6 lg:grid-cols-2 animate-fade-up stagger-2">
        {/* Recent savings */}
        <Card>
          <CardHeader
            title="Recent savings found"
            subtitle="All savings identified for you"
            action={
              <Link href="/dashboard/savings" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="p-0">
            {d?.recentSavings?.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {d.recentSavings.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{s.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        {s.category} · {formatDate(s.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-emerald-600 tabular-nums">
                        {formatCurrency(s.annualSaving)}/yr
                      </p>
                      {s.claimed && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" /> Claimed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<TrendingUp className="h-8 w-8" />}
                title="No savings yet"
                description="Run a benefits check or upload a bill to start finding savings"
              />
            )}
          </CardBody>
        </Card>

        {/* Quick actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Quick actions</h3>
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className="block group">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition-all group-hover:shadow-card-hover group-hover:-translate-y-0.5">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${action.iconBg}`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Savings chart ── */}
      {d?.savingsHistory?.length > 0 && (
        <div className="animate-fade-up stagger-3">
          <Card>
            <CardHeader title="Savings over time" subtitle="Monthly breakdown of found savings" />
            <CardBody>
              <SavingsChart data={d.savingsHistory} />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    href: '/dashboard/benefits',
    title: 'Run a benefits check',
    description: 'Check 40+ UK benefits in 60 seconds',
    icon: <PoundSterling className="h-5 w-5 text-emerald-600" />,
    iconBg: 'bg-emerald-100',
  },
  {
    href: '/dashboard/bills',
    title: 'Upload a bill',
    description: 'AI finds cheaper deals from your PDF',
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    iconBg: 'bg-blue-100',
  },
  {
    href: '/dashboard/energy',
    title: 'Compare energy deals',
    description: 'Find the cheapest tariff for your home',
    icon: <Zap className="h-5 w-5 text-amber-500" />,
    iconBg: 'bg-amber-100',
  },
];
