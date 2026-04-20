'use client';

import { Menu, Bell, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-100 bg-white/95 backdrop-blur-md px-4 lg:px-8">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex-shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600 hidden md:block transition-colors">
          Dashboard
        </Link>
        {pathname !== '/dashboard' && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 hidden md:block" />
            <h1 className="text-sm font-semibold text-slate-900 truncate">{meta.title}</h1>
          </>
        )}
        {pathname === '/dashboard' && (
          <h1 className="text-sm font-semibold text-slate-900 truncate md:hidden">{meta.title}</h1>
        )}
        {meta.description && (
          <span className="hidden lg:block text-xs text-slate-400">— {meta.description}</span>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Alerts button */}
        <Link
          href="/dashboard/alerts"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Alerts"
        >
          <Bell className="h-4.5 w-4.5" />
        </Link>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-bold shadow-glow-sm">
          {initial}
        </div>
      </div>
    </header>
  );
}
