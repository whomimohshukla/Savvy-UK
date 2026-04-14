'use client';

import { ArrowRight, PoundSterling, Zap, Bell, FileText, TrendingUp, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
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
      <p className="font-semibold text-red-800">Failed to load dashboard</p>
      <p className="text-sm text-red-600 mt-1">{error}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>Try again</Button>
    </div>
  );

  const firstName = user?.name?.split(' ')[0] || '';
  const totalPotential = d?.summary?.totalPotentialSaving ?? 0;
  const benefitsFound  = d?.summary?.benefitsFound ?? 0;
  const unreadAlerts   = d?.summary?.unreadAlerts ?? 0;
  const energySaving   = d?.latestEnergyScan?.potentialSaving ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Welcome header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {firstName ? `Good morning, ${firstName} 👋` : 'Your savings dashboard'}
          </h2>
          <p className="text-gray-500 mt-0.5 text-sm">Here's what we've found for you</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ── Hero banner (if savings found) ── */}
      {totalPotential > 0 ? (
        <div className="animate-fade-up relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-600 to-green-700 p-6 text-white shadow-lg">
          {/* Decorative */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 right-16 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-green-200" />
              <p className="text-green-100 text-sm font-medium">Total potential savings found</p>
            </div>
            <p className="text-5xl font-extrabold tracking-tight mb-1">
              {formatCurrency(totalPotential)}
            </p>
            <p className="text-green-200 text-sm mb-5">per year — ready for you to claim</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/benefits"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors shadow-sm"
              >
                View all savings <ArrowRight className="h-4 w-4" />
              </Link>
              {!d?.latestBenefits && (
                <Link
                  href="/dashboard/benefits"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Run benefits check
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* First-time CTA */
        <div className="animate-fade-up rounded-2xl border-2 border-dashed border-green-200 bg-green-50/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <Sparkles className="h-7 w-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">Discover your savings</h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            Run a benefits check to find out how much money you could be claiming.
            The average UK household finds <strong className="text-gray-700">£2,700/year</strong>.
          </p>
          <Link href="/dashboard/benefits">
            <Button size="lg">
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
          icon={<PoundSterling className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
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
          icon={<Bell className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-100"
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
              <Link href="/dashboard/savings" className="text-xs font-medium text-green-600 hover:text-green-700">
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            {d?.recentSavings?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {d.recentSavings.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between px-6 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {s.category} · {formatDate(s.createdAt)}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-green-600 tabular-nums">
                        {formatCurrency(s.annualSaving)}/yr
                      </p>
                      {s.claimed && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-green-500">
                          <CheckCircle2 className="h-3 w-3" />Claimed
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
          <h3 className="text-base font-semibold text-gray-900">Quick actions</h3>
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${action.iconBg}`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    href: '/dashboard/benefits',
    title: 'Run a benefits check',
    description: 'Check 40+ UK benefits in 60 seconds',
    icon: <PoundSterling className="h-5 w-5 text-green-600" />,
    iconBg: 'bg-green-100',
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
