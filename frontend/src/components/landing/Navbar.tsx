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
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? 'bg-white shadow-[0_2px_20px_rgba(16,185,129,0.12)] border-b border-emerald-100'
            : 'bg-transparent border-b border-white/10'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
              scrolled
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
            }`}>
              <span className="text-sm font-black text-white">S</span>
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-green-900' : 'text-white'
            }`}>
              Savvy <span className={scrolled ? 'text-emerald-500' : 'text-emerald-400'}>UK</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  scrolled
                    ? 'text-green-800 hover:text-green-900 hover:bg-emerald-50'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
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
              className={`text-sm font-semibold transition-colors duration-200 ${
                scrolled
                  ? 'text-green-700 hover:text-green-900'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all duration-200 ${
                scrolled
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_2px_12px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.45)]'
                  : 'bg-emerald-500/90 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className={`rounded-xl p-2 transition-all duration-200 md:hidden ${
              scrolled
                ? 'text-green-800 hover:bg-emerald-50'
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
          <div
            className="absolute inset-0 bg-green-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-nav-slide absolute top-16 left-0 right-0 bg-white shadow-xl border-b border-emerald-100 rounded-b-2xl overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full rounded-xl px-4 py-3 text-base font-medium text-green-800 hover:bg-emerald-50 hover:text-green-900 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="px-4 py-4 border-t border-emerald-100 flex flex-col gap-3">
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="btn-outline w-full justify-center py-3"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center py-3"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
