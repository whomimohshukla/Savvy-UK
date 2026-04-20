import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, PoundSterling, Zap, Shield,
  TrendingUp, Bell, Star, ChevronRight, Sparkles, Users,
  FileText, Brain, Clock, Lock,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingNavbar />

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative hero-gradient min-h-screen flex items-center justify-center overflow-hidden pt-16">

        <div className="relative mx-auto max-w-5xl px-5 text-center py-20 md:py-28">
          {/* Live badge */}
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-5 py-2 text-sm font-semibold text-emerald-300 animate-fade-down backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            £24 billion in UK benefits goes unclaimed every year
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl leading-[0.95]">
            Stop leaving<br />
            <span className="text-emerald-400">money behind.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 leading-relaxed md:text-xl">
            Our AI scans your situation in 60 seconds and finds every benefit,
            social tariff, and bill saving you're entitled to.
            <br className="hidden md:block" />
            <span className="font-bold text-white"> Average user discovers £2,700/year.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center mb-14">
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-glow hover:bg-emerald-400 hover:shadow-glow-lg transition-all hover:-translate-y-0.5"
            >
              Check my entitlements free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/6 px-8 py-4 text-base font-semibold text-white/90 backdrop-blur-sm hover:bg-white/12 hover:border-white/35 transition-all"
            >
              See how it works
            </Link>
          </div>

          {/* Trust signal */}
          <p className="text-sm text-slate-400 mb-12 tracking-wide">
            No credit card · Free forever plan · Takes 60 seconds · Data never sold
          </p>

          {/* Floating stat cards */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl border border-emerald-500/20 bg-white/5 backdrop-blur-xl px-4 py-5 animate-fade-up hover:bg-white/8 hover:border-emerald-400/30 transition-all"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <p className="text-2xl font-black text-emerald-300 md:text-3xl tabular-nums">{s.value}</p>
                <p className="mt-1 text-xs text-slate-400 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="h-6 w-3.5 rounded-full border-2 border-white/30 flex items-start justify-center pt-1">
            <div className="h-1.5 w-1 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* ══════════════════ TRUST BAR ══════════════════ */}
      <section className="border-y border-slate-100 bg-slate-50 py-5">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Built on official UK data</p>
            {TRUST_ITEMS.map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Everything we check
            </div>
            <h2 className="section-title mb-4">One scan. Every saving.</h2>
            <p className="section-subtitle">
              Our AI checks 40+ benefits and support schemes in one go — things most people don't even know they're entitled to.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-250"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.description}</p>
                <div className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${f.valueBg}`}>
                  <TrendingUp className="h-3 w-3" />
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-4xl px-5">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
              <Clock className="h-3.5 w-3.5" /> 60 seconds
            </div>
            <h2 className="section-title mb-4">How Savvy UK works</h2>
            <p className="section-subtitle">Three simple steps to finding your unclaimed money</p>
          </div>

          <div className="relative space-y-4">
            {/* Connecting line */}
            <div className="absolute left-7 top-16 bottom-16 w-0.5 bg-emerald-200 hidden md:block" />

            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 items-stretch animate-fade-up" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="flex-shrink-0 relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-glow-sm">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{s.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{s.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/auth/register" className="btn-primary px-8 py-3.5 text-base">
              Get my free report <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-5">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-12">
            The scale of the problem — backed by official data
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card hover:shadow-card-hover transition-all animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="text-4xl font-black text-slate-900 mb-1 tabular-nums">{s.value}</div>
                <div className="text-sm font-medium text-slate-600 leading-snug mb-2">{s.label}</div>
                <div className="text-xs text-slate-400">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-12 text-center">
            <h2 className="section-title mb-3">Real savings, real people</h2>
            <p className="section-subtitle">Thousands of UK households have already discovered what they were missing</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-slate-100 p-6 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location} · Saved {t.saved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PRICING ══════════════════ */}
      <section id="pricing" className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              <Lock className="h-3.5 w-3.5" /> Simple pricing
            </div>
            <h2 className="section-title mb-4">Start free. Upgrade when ready.</h2>
            <p className="section-subtitle">No hidden fees. Cancel any time.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 items-start">
            {PLANS.map((p, i) => (
              <div
                key={p.name}
                className={`relative rounded-3xl p-8 transition-all ${
                  p.highlighted
                    ? 'bg-slate-900 text-white shadow-2xl scale-[1.04] border border-white/10'
                    : 'bg-white border border-slate-100 shadow-card hover:shadow-card-hover'
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-900 shadow-glow-sm">
                    Most popular
                  </div>
                )}

                <div className={`mb-1 text-xs font-bold uppercase tracking-widest ${p.highlighted ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {p.name}
                </div>
                <div className="mb-2 flex items-end gap-1">
                  <span className={`text-5xl font-black ${p.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {p.price}
                  </span>
                  {p.period && (
                    <span className={`mb-2 text-sm font-medium ${p.highlighted ? 'text-slate-400' : 'text-slate-400'}`}>
                      {p.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-8 ${p.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{p.tagline}</p>

                <ul className="mb-8 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${p.highlighted ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span className={`text-sm ${p.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all ${
                    p.highlighted
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-glow-sm'
                      : 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {p.cta} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            All plans include a 14-day money-back guarantee · Secure payments via Stripe
          </p>
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ══════════════════ */}
      <section className="py-24 cta-gradient relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free to start — no card required
          </div>
          <h2 className="text-4xl font-black text-white mb-4 md:text-5xl tracking-tight leading-tight">
            Your unclaimed money<br />
            <span className="text-emerald-400">is waiting for you.</span>
          </h2>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Join thousands of UK residents who've discovered savings they didn't know existed.
            It takes 60 seconds and it's completely free.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-9 py-4 text-base font-bold text-white shadow-glow hover:bg-emerald-400 transition-all hover:-translate-y-0.5"
            >
              Check my entitlements free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/6 px-9 py-4 text-base font-semibold text-white/85 backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">Free forever plan · Cancel Pro/Premium anytime · ICO registered</p>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-10 md:grid-cols-4 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
                  <span className="text-xs font-black text-white">S</span>
                </div>
                <span className="font-bold text-white text-lg">Savvy UK</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                AI-powered tool that finds your unclaimed UK benefits and bill savings.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Product</h4>
              <ul className="space-y-3">
                {[['Features', '#features'], ['Pricing', '#pricing'], ['How it works', '#how-it-works'], ['Dashboard', '/dashboard']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-sm hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Company</h4>
              <ul className="space-y-3">
                {[['About', '/about'], ['Contact', 'mailto:hello@savvy-uk.com'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-sm hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Resources</h4>
              <ul className="space-y-3">
                {[['GOV.UK Benefits', 'https://www.gov.uk/benefits'], ['Universal Credit', 'https://www.gov.uk/universal-credit'], ['Ofgem Tariff', 'https://www.ofgem.gov.uk']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-sm hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <p className="text-xs text-slate-600 max-w-xl text-center md:text-left">
              Savvy UK is an informational tool and is not a regulated financial adviser. Always verify eligibility at{' '}
              <a href="https://www.gov.uk/benefits" className="underline hover:text-slate-400" target="_blank" rel="noopener">gov.uk</a>.
              Data: ONS Dec 2025 · Policy in Practice 2025 · Ofcom 2025 · Ofgem Q1 2026.
            </p>
            <p className="text-xs text-slate-600 flex-shrink-0">© {new Date().getFullYear()} Savvy UK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────── Data ──────────────────────────── */

const HERO_STATS = [
  { value: '£24B',   label: 'Unclaimed UK benefits (2025)' },
  { value: '£6,000', label: 'Average found per household' },
  { value: '60s',    label: 'To get your full report' },
];

const TRUST_ITEMS = [
  'GOV.UK data 2025/26',
  'HMRC verified rates',
  'Ofgem tariff data',
  'Policy in Practice',
  'Never sells your data',
];

const FEATURES = [
  {
    title: 'Benefits Check',
    icon: <PoundSterling className="h-5 w-5 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    valueBg: 'bg-emerald-50 text-emerald-700',
    value: 'Up to £24,000/yr',
    description: 'Check 40+ UK benefits: Universal Credit, PIP, Carer\'s Allowance, Pension Credit, Council Tax Reduction and more.',
  },
  {
    title: 'Energy Bill Analysis',
    icon: <Zap className="h-5 w-5 text-amber-500" />,
    iconBg: 'bg-amber-50',
    valueBg: 'bg-amber-50 text-amber-700',
    value: 'Save £260–£400/yr',
    description: 'Upload your energy bill — AI reads your tariff and finds cheaper deals. Average UK household saves £340/year by switching.',
  },
  {
    title: 'Broadband Social Tariffs',
    icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
    iconBg: 'bg-blue-50',
    valueBg: 'bg-blue-50 text-blue-700',
    value: 'Save £144–£250/yr',
    description: '97% of eligible households miss out on broadband social tariffs. We check your eligibility and link you to deals from £12/month.',
  },
  {
    title: 'Smart Alerts',
    icon: <Bell className="h-5 w-5 text-violet-500" />,
    iconBg: 'bg-violet-50',
    valueBg: 'bg-violet-50 text-violet-700',
    value: 'Never miss a saving',
    description: 'Get notified when the price cap changes, a better tariff appears, or a new benefit applies to your situation.',
  },
  {
    title: 'Warm Home Discount',
    icon: <Shield className="h-5 w-5 text-orange-500" />,
    iconBg: 'bg-orange-50',
    valueBg: 'bg-orange-50 text-orange-700',
    value: '£150 one-off',
    description: 'Check eligibility for the government\'s £150 Warm Home Discount — applied directly to your energy bill.',
  },
  {
    title: 'AI-Powered Analysis',
    icon: <Brain className="h-5 w-5 text-pink-500" />,
    iconBg: 'bg-pink-50',
    valueBg: 'bg-pink-50 text-pink-700',
    value: 'Monthly auto-scan',
    description: 'Premium users get their full situation re-scanned every month as rules, tariffs, and benefit rates change.',
  },
];

const STEPS = [
  {
    emoji: '📋',
    title: 'Answer 10 quick questions',
    description: 'Tell us about your household, employment, current benefits, and housing. Takes under 60 seconds. We never store sensitive personal data.',
  },
  {
    emoji: '🤖',
    title: 'AI analyses your situation',
    description: 'Claude AI cross-references your profile against all 40+ UK benefits, social tariffs, and bill savings schemes using the latest 2025/26 government rates.',
  },
  {
    emoji: '💰',
    title: 'Get your personalised report',
    description: 'See every benefit and saving you\'re entitled to in plain English — with annual £ values, probability scores, and direct links to claim on GOV.UK.',
  },
];

const STATS = [
  { value: '£24B',  label: 'Benefits unclaimed annually',         source: 'Policy in Practice 2025' },
  { value: '88%',   label: 'UK adults affected by cost crisis',   source: 'ONS Dec 2025' },
  { value: '97%',   label: 'Miss broadband social tariffs',       source: 'Ofcom 2025' },
  { value: '7M+',   label: 'Households missing out',             source: 'Policy in Practice 2025' },
];

const TESTIMONIALS = [
  {
    quote: "I had no idea I was entitled to Carer's Allowance until Savvy UK told me. That's £3,624 a year I was missing. Absolutely game-changing.",
    name: 'Sarah M.',
    location: 'Manchester',
    saved: '£3,624/yr',
  },
  {
    quote: "Switched energy supplier based on the recommendation and saved £380 in my first year. The bill upload feature is brilliant — took 30 seconds.",
    name: 'James T.',
    location: 'Birmingham',
    saved: '£380/yr',
  },
  {
    quote: "Found out I qualify for Pension Credit AND a broadband social tariff. Combined that's over £2,000 a year. Why isn't everyone using this?",
    name: 'Patricia H.',
    location: 'Bristol',
    saved: '£2,100/yr',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '£0',
    period: '',
    tagline: 'Get started with the basics',
    features: [
      '1 benefits check per month',
      '1 bill upload',
      'Basic email alerts',
      'Benefits eligibility report',
      'GOV.UK claim links',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '£4.99',
    period: '/month',
    tagline: 'Everything you need to save more',
    features: [
      'Unlimited benefits checks',
      '5 bill uploads per month',
      'Smart alerts & notifications',
      'Energy tariff comparison',
      'Broadband social tariff check',
      'Priority support',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '£9.99',
    period: '/month',
    tagline: 'Maximum savings, zero effort',
    features: [
      'Everything in Pro',
      'Unlimited bill uploads',
      'Monthly auto-scan',
      'Insurance comparison',
      'CSV export of all savings',
      'White-glove claim assistance',
    ],
    cta: 'Start Premium',
    highlighted: false,
  },
];
