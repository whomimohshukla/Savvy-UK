import Link from 'next/link';
import { ArrowRight, CheckCircle2, PoundSterling, Zap, Shield, TrendingUp, Bell, Star, Users, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 shadow-sm">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Savvy UK</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features"    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How it works</Link>
            <Link href="#pricing"     className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-gray-900">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 hover:shadow-md transition-all"
            >
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50/80 to-white pb-20 pt-16 md:pt-28">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-green-100/50 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-green-50 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            £24 billion in UK benefits goes unclaimed every year
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl leading-none">
            Find your<br />
            <span className="text-green-600">unclaimed money</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-500 leading-relaxed">
            AI scans your situation in 60 seconds and finds every benefit,
            social tariff, and bill saving you're entitled to but not claiming.
            Average user finds <span className="font-bold text-gray-900">£2,700/year</span>.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-green-700 hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Check my entitlements free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm text-gray-400">No credit card · Free forever plan · Takes 60 seconds</p>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-gray-100 pt-12">
            {[
              { num: '£24B',  label: 'Unclaimed UK benefits (2025)' },
              { num: '£6,000', label: 'Average found per household' },
              { num: '60s',   label: 'To get your full report' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-green-600 md:text-4xl">{s.num}</p>
                <p className="mt-1 text-xs text-gray-400 md:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Everything we check for you</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Our AI checks 40+ benefits and support schemes in one go — things most people don't even know they're entitled to
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{f.description}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  <TrendingUp className="h-3 w-3" />
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-lg text-gray-500">Three steps to finding your unclaimed money</p>
          </div>
          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white font-extrabold text-lg shadow-md">
                  {i + 1}
                </div>
                <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-5xl px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-10">
            Backed by official UK government data
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center rounded-2xl border border-gray-100 p-5">
                <div className="text-3xl font-extrabold text-gray-900 mb-1">{s.value}</div>
                <div className="text-xs text-gray-400 leading-tight">{s.label}</div>
                <div className="text-[10px] text-gray-300 mt-1">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Simple, honest pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-8 transition-all ${
                  p.highlighted
                    ? 'bg-green-600 text-white shadow-2xl scale-[1.03]'
                    : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                    Most popular
                  </div>
                )}
                <div className={`mb-1 text-lg font-bold ${p.highlighted ? 'text-green-100' : 'text-gray-900'}`}>
                  {p.name}
                </div>
                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${p.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {p.price}
                  </span>
                  {p.period && (
                    <span className={`text-sm ml-1 ${p.highlighted ? 'text-green-200' : 'text-gray-400'}`}>
                      {p.period}
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${p.highlighted ? 'text-green-200' : 'text-green-500'}`} />
                      <span className={`text-sm ${p.highlighted ? 'text-green-100' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    p.highlighted
                      ? 'bg-white text-green-700 hover:bg-green-50'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.cta} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Ready to find your unclaimed money?</h2>
          <p className="text-green-200 text-lg mb-10">
            Join thousands of UK residents who've discovered savings they didn't know existed.
            It takes 60 seconds and it's completely free.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-lg font-extrabold text-green-700 shadow-lg hover:bg-green-50 transition-all hover:-translate-y-0.5"
          >
            Start for free <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-green-300">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600">
                <span className="text-xs font-bold text-white">S</span>
              </div>
              <span className="font-bold text-white">Savvy UK</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                { label: 'Privacy',  href: '/privacy' },
                { label: 'Terms',    href: '/terms' },
                { label: 'Contact',  href: 'mailto:hello@savvy-uk.com' },
                { label: 'GOV.UK',  href: 'https://www.gov.uk/benefits' },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-500 max-w-2xl mx-auto">
              Savvy UK is an informational tool and is not a regulated financial adviser.
              Always verify benefit eligibility at{' '}
              <a href="https://www.gov.uk/benefits" className="text-gray-400 underline hover:text-white" target="_blank" rel="noopener">gov.uk</a>.
              Data sources: ONS Dec 2025, Policy in Practice 2025, Ofcom 2025, Ofgem Q1 2026.
            </p>
            <p className="mt-3 text-xs text-gray-600">© {new Date().getFullYear()} Savvy UK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { title: 'Benefits Check',           icon: <PoundSterling className="h-5 w-5 text-green-600" />,  iconBg: 'bg-green-100',  value: 'Up to £24,000/yr',    description: 'Check 40+ UK benefits: Universal Credit, PIP, Carer\'s Allowance, Pension Credit, Council Tax Reduction and more.' },
  { title: 'Energy Bill Analysis',      icon: <Zap          className="h-5 w-5 text-amber-600" />,  iconBg: 'bg-amber-100',  value: 'Save £260–£400/yr',   description: 'Upload your energy bill — AI reads your tariff and finds cheaper deals. Average UK household saves £340/year by switching.' },
  { title: 'Broadband Social Tariffs',  icon: <TrendingUp   className="h-5 w-5 text-blue-600" />,   iconBg: 'bg-blue-100',   value: 'Save £144–£250/yr',   description: '97% of eligible households miss out on broadband social tariffs. We check your eligibility and link you to deals from £12/month.' },
  { title: 'Smart Alerts',              icon: <Bell         className="h-5 w-5 text-purple-600" />, iconBg: 'bg-purple-100', value: 'Never miss a saving', description: 'Get notified when the price cap changes, a better tariff appears, or a new benefit applies to your situation.' },
  { title: 'Warm Home Discount',        icon: <Shield       className="h-5 w-5 text-orange-600" />, iconBg: 'bg-orange-100', value: '£150 one-off',         description: 'Check eligibility for the government\'s £150 Warm Home Discount — applied directly to your energy bill.' },
  { title: 'Monthly Auto-Scan',         icon: <Star         className="h-5 w-5 text-rose-600" />,   iconBg: 'bg-rose-100',   value: 'Premium feature',     description: 'Premium users get their full situation re-scanned every month as rules, tariffs, and benefit rates change.' },
];

const STEPS = [
  { emoji: '📋', title: 'Answer 10 quick questions', description: 'Tell us about your household, employment, current benefits, and housing. Takes under 60 seconds. We never store sensitive personal data.' },
  { emoji: '🤖', title: 'AI analyses your situation', description: 'Claude AI cross-references your profile against all 40+ UK benefits, social tariffs, and bill savings schemes using the latest 2025/26 government rates.' },
  { emoji: '💰', title: 'Get your personalised report', description: 'See every benefit and saving you\'re entitled to in plain English — with annual £ values, probability scores, and direct links to claim on GOV.UK.' },
];

const STATS = [
  { value: '£24B',  label: 'Benefits unclaimed annually',    source: 'Policy in Practice 2025' },
  { value: '88%',   label: 'UK adults affected by cost crisis', source: 'ONS Dec 2025' },
  { value: '97%',   label: 'Miss out on broadband social tariffs', source: 'Ofcom 2025' },
  { value: '7M+',   label: 'Households missing out',         source: 'Policy in Practice 2025' },
];

const PLANS = [
  {
    name: 'Free', price: '£0', period: '',
    features: ['1 benefits check/month', '1 bill upload', 'Basic alerts', 'Benefits eligibility report'],
    cta: 'Get started', highlighted: false,
  },
  {
    name: 'Pro', price: '£4.99', period: '/month',
    features: ['Unlimited benefits checks', '5 bill uploads/month', 'Smart alerts & notifications', 'Energy tariff comparison', 'Broadband social tariff check', 'Priority support'],
    cta: 'Start Pro', highlighted: true,
  },
  {
    name: 'Premium', price: '£9.99', period: '/month',
    features: ['Everything in Pro', 'Unlimited bill uploads', 'Monthly auto-scan', 'Insurance comparison', 'CSV export of savings', 'White-glove claim help'],
    cta: 'Start Premium', highlighted: false,
  },
];
