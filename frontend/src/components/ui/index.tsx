import { cn } from '@/lib/utils/cn';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; onClick?: () => void; hoverable?: boolean; }
export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn('card', hoverable && 'card-hover cursor-pointer', className)}
    >
      {children}
    </div>
  );
}

interface CardSectionProps { children?: React.ReactNode; className?: string; title?: string; subtitle?: string; action?: React.ReactNode; }
export function CardHeader({ children, className, title, subtitle, action }: CardSectionProps) {
  if (title || subtitle || action) {
    return (
      <div className={cn('px-6 py-4 border-b border-emerald-50 flex items-center justify-between', className)}>
        <div>
          {title && <h3 className="text-base font-bold text-green-900">{title}</h3>}
          {subtitle && <p className="text-xs text-green-600 mt-0.5 font-medium">{subtitle}</p>}
        </div>
        {action}
      </div>
    );
  }
  return <div className={cn('px-6 py-4 border-b border-emerald-50', className)}>{children}</div>;
}
export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'blue' | 'red' | 'gray' | 'purple' | 'pink';
const badgeVariants: Record<BadgeVariant, string> = {
  green:  'bg-emerald-100 text-emerald-700',
  amber:  'bg-emerald-50 text-emerald-600',
  blue:   'bg-emerald-100 text-emerald-700',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-green-50 text-green-700',
  purple: 'bg-emerald-100 text-emerald-700',
  pink:   'bg-emerald-50 text-emerald-600',
};

export function Badge({ children, variant = 'gray', className }: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
type AlertVariant = 'success' | 'error' | 'warning' | 'info';
const alertConfig: Record<AlertVariant, { icon: React.ReactNode; classes: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4 flex-shrink-0" />, classes: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  error:   { icon: <AlertCircle  className="h-4 w-4 flex-shrink-0" />, classes: 'bg-red-50 border-red-200 text-red-700' },
  warning: { icon: <AlertTriangle className="h-4 w-4 flex-shrink-0"/>, classes: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  info:    { icon: <Info         className="h-4 w-4 flex-shrink-0" />, classes: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
};
export function Alert({ variant = 'info', children, className }: { variant?: AlertVariant; children: React.ReactNode; className?: string }) {
  const { icon, classes } = alertConfig[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm font-medium', classes, className)}>
      {icon}<div>{children}</div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <Loader2 className={cn('animate-spin text-emerald-500', sizes[size], className)} />;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

// ── Dashboard skeleton ─────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* Hero banner */}
      <Skeleton className="h-40 w-full rounded-3xl" />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Lower row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-50">
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="divide-y divide-emerald-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-emerald-100 bg-white p-4 flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-emerald-400">{icon}</div>
      <h3 className="text-base font-bold text-green-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-green-600 leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Loading full page ─────────────────────────────────────────────────────────
export function LoadingPage({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.35)]">
            <span className="text-lg font-black text-white">C</span>
          </div>
          <div className="absolute -inset-1.5 rounded-2xl border-2 border-emerald-400/30 animate-ping" />
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-green-600">{label}</p>
      </div>
    </div>
  );
}

// ── Full-screen page transition loader (after auth) ───────────────────────────
export function PageLoader({ message = 'Setting up your dashboard…' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <span className="text-3xl font-black text-white">C</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-emerald-400/20 animate-ping" />
        </div>
        <div className="flex items-center gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-green-900">{message}</p>
          <p className="text-sm text-green-500">Just a moment…</p>
        </div>
      </div>
    </div>
  );
}
