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
  const router = useRouter();
  const { user, clearAuth, refreshToken } = useAuthStore();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken); } catch {}
    clearAuth();
    toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
    router.push('/');
  };

  const planConfig = {
    FREE:    { label: 'Free',    bg: 'bg-slate-100',       text: 'text-slate-600',   upgradeVisible: true  },
    PRO:     { label: 'Pro',     bg: 'bg-emerald-100',     text: 'text-emerald-700', upgradeVisible: false },
    PREMIUM: { label: 'Premium', bg: 'bg-violet-100',      text: 'text-violet-700',  upgradeVisible: false },
  };
  const plan = planConfig[user?.plan ?? 'FREE'];

  return (
    <aside className="flex h-full w-full flex-col bg-white border-r border-slate-100">
      {/* ── Logo ── */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-glow-sm">
            <span className="text-sm font-black text-white">S</span>
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">Savvy UK</span>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── User card ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-100">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <span className={cn('ml-1 flex-shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold', plan.bg, plan.text)}>
            {plan.label}
          </span>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="mb-2 mt-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent',
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-colors',
                  active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600',
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </Link>
          );
        })}

        <div className="my-3 border-t border-slate-100" />
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent',
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600',
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
          <div className="rounded-2xl bg-slate-900 p-4 text-white border border-slate-800">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-bold text-emerald-400">Upgrade to Pro</p>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Unlimited checks, smart alerts &amp; energy comparison
            </p>
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-400 transition-colors"
            >
              <span>£4.99/month</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Logout ── */}
      <div className="border-t border-slate-100 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 group"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-500 transition-colors" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
