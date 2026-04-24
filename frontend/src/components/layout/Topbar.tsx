'use client';

import { Menu, Bell, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { useApi } from '@/lib/hooks/useApi';
import { alertsApi } from '@/lib/api/client';

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/dashboard':           { title: 'Dashboard',      description: 'Your savings overview' },
  '/dashboard/benefits':  { title: 'Benefits Check',  description: 'Find unclaimed benefits' },
  '/dashboard/bills':     { title: 'My Bills',        description: 'Upload and analyse bills' },
  '/dashboard/energy':    { title: 'Energy',          description: 'Compare tariffs & deals' },
  '/dashboard/savings':   { title: 'My Savings',      description: 'Track claimed savings' },
  '/dashboard/alerts':    { title: 'Alerts',          description: 'Notifications & updates' },
  '/dashboard/settings':  { title: 'Settings',        description: 'Account & subscription' },
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const meta = PAGE_META[pathname] ?? { title: 'Dashboard', description: '' };
  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();
  const { data: alertsData } = useApi(() => alertsApi.getAlerts('unread') as any);
  const unreadCount = (alertsData as any)?.data?.unreadCount ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-emerald-100 bg-white px-4 lg:px-8">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex-shrink-0 rounded-xl p-2 text-green-600 hover:bg-emerald-50 hover:text-green-800 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Link href="/dashboard" className="text-sm text-green-500 hover:text-green-700 hidden md:block transition-colors">
          Dashboard
        </Link>
        {pathname !== '/dashboard' && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-emerald-300 hidden md:block" />
            <h1 className="text-sm font-semibold text-green-900 truncate">{meta.title}</h1>
          </>
        )}
        {pathname === '/dashboard' && (
          <h1 className="text-sm font-semibold text-green-900 truncate md:hidden">{meta.title}</h1>
        )}
        {meta.description && (
          <span className="hidden lg:block text-xs text-green-400">— {meta.description}</span>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/alerts"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-green-500 hover:bg-emerald-50 hover:text-green-700 transition-colors"
          aria-label="Alerts"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
          {initial}
        </div>
      </div>
    </header>
  );
}
