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
  label, value, subvalue, icon, iconBg = 'bg-gray-100',
  href, trend, highlight, className,
}: StatCardProps) {
  const Inner = () => (
    <div className={cn(
      'card p-5 transition-all',
      href && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
      highlight && 'border-green-200 bg-gradient-to-br from-green-50 to-white',
      className,
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('rounded-xl p-2.5', iconBg)}>
          {icon}
        </div>
        {href && <ArrowUpRight className="h-4 w-4 text-gray-300" />}
      </div>
      <div className="space-y-0.5">
        <p className={cn('text-2xl font-bold tabular-nums', highlight ? 'text-green-600' : 'text-gray-900')}>
          {value}
        </p>
        {subvalue && <p className="text-xs text-gray-400">{subvalue}</p>}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-green-600 font-medium">+{trend.value}%</span>
          <span className="text-xs text-gray-400">{trend.label}</span>
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href}><Inner /></Link>;
  return <Inner />;
}
