import { cn } from '@/lib/utils/cn';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  icon: React.ReactNode;
  iconBg?: string;
  href?: string;
  trend?: { value: number; label: string };
  highlight?: boolean;
  className?: string;
}

export function StatCard({
  label, value, subvalue, icon, iconBg = 'bg-emerald-100',
  href, trend, highlight, className,
}: StatCardProps) {
  const Inner = () => (
    <div className={cn(
      'card p-5 transition-all duration-200',
      href && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer group',
      highlight && 'border-emerald-200 bg-emerald-50',
      className,
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('rounded-xl p-2.5', iconBg)}>
          {icon}
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-green-300 group-hover:text-emerald-500 transition-colors" />
        )}
      </div>
      <div className="space-y-0.5">
        <p className={cn('text-2xl font-bold tabular-nums tracking-tight', highlight ? 'text-emerald-600' : 'text-green-950')}>
          {value}
        </p>
        {subvalue && <p className="text-xs text-green-400 font-medium">{subvalue}</p>}
        <p className="text-sm text-green-600 font-medium">{label}</p>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 pt-3 border-t border-emerald-50">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-600 font-semibold">+{trend.value}%</span>
          <span className="text-xs text-green-400">{trend.label}</span>
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href}><Inner /></Link>;
  return <Inner />;
}
