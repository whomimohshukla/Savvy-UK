'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#features',     label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing',      label: 'Pricing' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm'
            : 'bg-transparent border-b border-white/10'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-glow-sm">
              <span className="text-sm font-black text-white">S</span>
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              Savvy UK
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  scrolled
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth"
              className={`text-sm font-semibold transition-colors ${
                scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-glow-sm hover:bg-emerald-600 hover:shadow-glow transition-all"
            >
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`rounded-xl p-2 transition-colors md:hidden ${
              scrolled
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-white shadow-xl border-b border-slate-100 animate-fade-down">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full rounded-xl px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="px-4 py-4 border-t border-slate-100 flex flex-col gap-3">
              <Link href="/auth" onClick={() => setMobileOpen(false)} className="btn-outline w-full justify-center py-3">
                Log in
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center py-3">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
