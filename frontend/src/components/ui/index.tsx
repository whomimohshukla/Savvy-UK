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

interface CardSectionProps { children: React.ReactNode; className?: string; title?: string; subtitle?: string; action?: React.ReactNode; }
export function CardHeader({ children, className, title, subtitle, action }: CardSectionProps) {
  if (title || subtitle || action) {
    return (
      <div className={cn('px-6 py-4 border-b border-gray-100 flex items-center justify-between', className)}>
        <div>
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    );
  }
  return <div className={cn('px-6 py-4 border-b border-gray-100', className)}>{children}</div>;
}
export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'amber' | 'blue' | 'red' | 'gray' | 'purple' | 'pink';
const badgeVariants: Record<BadgeVariant, string> = {
  green:  'bg-green-100 text-green-700',
  amber:  'bg-amber-100 text-amber-700',
  blue:   'bg-blue-100 text-blue-700',
  red:    'bg-red-100 text-red-700',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
  pink:   'bg-pink-100 text-pink-700',
};

export function Badge({ children, variant = 'gray', className }: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
type AlertVariant = 'success' | 'error' | 'warning' | 'info';
const alertConfig: Record<AlertVariant, { icon: React.ReactNode; classes: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4 flex-shrink-0" />, classes: 'bg-green-50 border-green-200 text-green-800' },
  error:   { icon: <AlertCircle  className="h-4 w-4 flex-shrink-0" />, classes: 'bg-red-50 border-red-200 text-red-700' },
  warning: { icon: <AlertTriangle className="h-4 w-4 flex-shrink-0"/>, classes: 'bg-amber-50 border-amber-200 text-amber-800' },
  info:    { icon: <Info         className="h-4 w-4 flex-shrink-0" />, classes: 'bg-blue-50 border-blue-200 text-blue-800' },
};
export function Alert({ variant = 'info', children, className }: { variant?: AlertVariant; children: React.ReactNode; className?: string }) {
  const { icon, classes } = alertConfig[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm', classes, className)}>
      {icon}<div>{children}</div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <Loader2 className={cn('animate-spin text-green-600', sizes[size], className)} />;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-gray-100', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl bg-gray-100 p-4 text-gray-400">{icon}</div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Loading full page ─────────────────────────────────────────────────────────
export function LoadingPage() {
  return (
    <div className="flex h-full min-h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
