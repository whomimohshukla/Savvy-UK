'use client';

import { Menu, Bell, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':           'Dashboard',
  '/dashboard/benefits':  'Benefits Check',
  '/dashboard/bills':     'My Bills',
  '/dashboard/energy':    'Energy',
  '/dashboard/savings':   'My Savings',
  '/dashboard/alerts':    'Alerts',
  '/dashboard/settings':  'Settings',
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const title = PAGE_TITLES[pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex-shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Alerts shortcut */}
        <Link
          href="/dashboard/alerts"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Alerts"
        >
          <Bell className="h-5 w-5" />
        </Link>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700 text-sm font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
