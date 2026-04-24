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
import { toast } from '@/lib/store/toast.store';

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
  const router   = useRouter();
  const { user, clearAuth, refreshToken } = useAuthStore();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken); } catch {}
    clearAuth();
    toast({ variant: 'success', title: 'Signed out', description: 'You have been signed out successfully.' });
    router.push('/');
  };

  const planConfig = {
    FREE:    { label: 'Free',    bg: 'bg-emerald-100', text: 'text-emerald-700', upgradeVisible: true  },
    PRO:     { label: 'Pro',     bg: 'bg-emerald-200', text: 'text-emerald-800', upgradeVisible: false },
    PREMIUM: { label: 'Premium', bg: 'bg-emerald-300', text: 'text-emerald-900', upgradeVisible: false },
  };
  const plan = planConfig[user?.plan ?? 'FREE'];

  return (
    <aside className="flex h-full w-full flex-col bg-white border-r border-emerald-100">

      {/* ── Logo ── */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-emerald-100">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <span className="text-sm font-black text-white">S</span>
          </div>
          <span className="text-lg font-bold text-green-950 tracking-tight">
            Savvy <span className="text-emerald-500">UK</span>
          </span>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-green-500 hover:bg-emerald-50 hover:text-green-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── User card ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2.5 border border-emerald-100">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-green-950 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-green-500 truncate">{user?.email}</p>
          </div>
          <span className={cn('ml-1 flex-shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold', plan.bg, plan.text)}>
            {plan.label}
          </span>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="mb-2 mt-2 px-3 text-[10px] font-bold uppercase tracking-widest text-green-500">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group border',
                active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'text-green-700 hover:bg-emerald-50 hover:text-green-900 border-transparent',
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-colors',
                  active ? 'text-emerald-600' : 'text-green-400 group-hover:text-emerald-600',
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </Link>
          );
        })}

        <div className="my-3 border-t border-emerald-100" />
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-green-500">
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group border',
                active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'text-green-700 hover:bg-emerald-50 hover:text-green-900 border-transparent',
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  active ? 'text-emerald-600' : 'text-green-400 group-hover:text-emerald-600',
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Upgrade Banner (FREE only) ── */}
      {plan.upgradeVisible && (
        <div className="px-3 pb-3">
          <div className="rounded-2xl bg-emerald-600 p-4 text-white">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
              <p className="text-xs font-bold text-emerald-100">Upgrade to Pro</p>
            </div>
            <p className="text-xs text-emerald-100 mb-3 leading-relaxed">
              Unlimited checks, smart alerts &amp; energy comparison
            </p>
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <span>£4.99/month</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Logout ── */}
      <div className="border-t border-emerald-100 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-green-600 transition-all hover:bg-red-50 hover:text-red-600 group"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
