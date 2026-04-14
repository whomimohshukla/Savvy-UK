'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, PoundSterling, FileText, Zap,
  Bell, Settings, LogOut, TrendingUp, ChevronRight,
  Sparkles, X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { authApi } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Dashboard',      icon: LayoutDashboard, exact: true },
  { href: '/dashboard/benefits',  label: 'Benefits Check', icon: PoundSterling },
  { href: '/dashboard/bills',     label: 'My Bills',       icon: FileText },
  { href: '/dashboard/energy',    label: 'Energy',         icon: Zap },
  { href: '/dashboard/savings',   label: 'My Savings',     icon: TrendingUp },
  { href: '/dashboard/alerts',    label: 'Alerts',         icon: Bell },
];

const BOTTOM_ITEMS = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({ onClose, mobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth, refreshToken } = useAuthStore();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken); } catch {}
    clearAuth();
    router.push('/');
  };

  const planConfig = {
    FREE:    { label: 'Free', classes: 'bg-gray-100 text-gray-600', upgradeVisible: true },
    PRO:     { label: 'Pro',  classes: 'bg-green-100 text-green-700', upgradeVisible: false },
    PREMIUM: { label: 'Premium', classes: 'bg-amber-100 text-amber-700', upgradeVisible: false },
  };
  const plan = planConfig[user?.plan ?? 'FREE'];

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      {/* ── Logo ── */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 shadow-sm">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Savvy UK</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── User Plan Badge ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <span className={cn('ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', plan.classes)}>
            {plan.label}
          </span>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="mb-1 mt-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-green-600' : 'text-gray-400')} />
              <span className="flex-1">{item.label}</span>
              {item.href === '/dashboard/alerts' && user && (
                <UnreadBadge userId={user.id} />
              )}
            </Link>
          );
        })}

        <div className="my-3 border-t border-gray-100" />
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Account
        </p>
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-green-600' : 'text-gray-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Upgrade Banner (FREE only) ── */}
      {plan.upgradeVisible && (
        <div className="px-3 pb-3">
          <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-700 p-4 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-green-200" />
              <p className="text-xs font-semibold text-green-100">Upgrade to Pro</p>
            </div>
            <p className="text-xs text-green-100 mb-3">Unlimited checks, smart alerts &amp; more</p>
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-50 transition-colors"
            >
              <span>£4.99/month</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Logout ── */}
      <div className="border-t border-gray-100 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

// Small unread counter — reads from localStorage/API cache
function UnreadBadge({ userId }: { userId: string }) {
  // In a real app this would use a global state / SWR / react-query
  // For now just render nothing — alerts page shows the count
  return null;
}
