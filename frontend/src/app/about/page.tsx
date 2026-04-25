import { Users, Target, Shield, TrendingUp, Heart, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const TEAM = [
  {
    name: 'Alex Thompson',
    role: 'Co-founder & CEO',
    bio: 'Former policy analyst at DWP with 10 years helping families navigate the benefits system.',
    initials: 'AT',
    bg: 'bg-emerald-600',
  },
  {
    name: 'Priya Sharma',
    role: 'Co-founder & CTO',
    bio: 'Ex-Google engineer passionate about using AI to close the UK welfare gap.',
    initials: 'PS',
    bg: 'bg-indigo-600',
  },
  {
    name: 'James Okafor',
    role: 'Head of Benefits Research',
    bio: 'Welfare rights specialist with a decade of frontline advice work at Citizens Advice.',
    initials: 'JO',
    bg: 'bg-amber-600',
  },
];

const VALUES = [
  {
    icon: Target,
    title: 'Radical accessibility',
    description: 'Benefits and savings advice shouldn\'t require a degree or an adviser. We make it simple for everyone.',
  },
  {
    icon: Shield,
    title: 'Privacy first',
    description: 'We never store your bill files and never sell your data. Full stop.',
  },
  {
    icon: Heart,
    title: 'People over profit',
    description: 'Our free tier is genuinely useful. We grow when you save — that\'s the only alignment we need.',
  },
  {
    icon: Award,
    title: 'Evidence-based',
    description: 'Every recommendation links back to official DWP, Ofgem, or OFCOM guidance.',
  },
];

const STATS = [
  { value: '£2.3bn', label: 'benefits unclaimed in the UK each year' },
  { value: '8m+', label: 'households eligible for but not receiving support' },
  { value: '£1,200', label: 'average annual saving per ClaimWise UK user' },
  { value: 'ICO', label: 'registered data controller' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-glow-sm">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">ClaimWise UK</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/auth" className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden py-24 px-6"
        style={{ background: '#030c18' }}
      >
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 mb-6">
            <Users className="h-3.5 w-3.5" />
            Our story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            Built to close the{' '}
            <span className="text-emerald-400">
              UK welfare gap
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Billions of pounds in benefits go unclaimed every year — not because people don&apos;t need them,
            but because the system is complex. ClaimWise UK uses AI to change that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">Our mission</p>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-6">
              Every household deserves to know what they&apos;re owed
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                ClaimWise UK started as a spreadsheet. Our founders were welfare rights advisers helping people
                in food banks and community centres understand what support was available to them.
                The results were life-changing — but they couldn&apos;t reach enough people.
              </p>
              <p>
                So they built ClaimWise UK: an AI-powered platform that does in minutes what used to take hours
                of one-on-one advice. Benefits eligibility, bill comparison, broadband tariffs, energy switching —
                all in one place, with plain-English guidance.
              </p>
              <p>
                We&apos;re not a comparison site taking referral fees. We&apos;re a subscription tool with
                one goal: maximise your household income and minimise your bills.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              'Analyse your benefits eligibility across 40+ schemes',
              'Parse and benchmark your energy, broadband & mobile bills',
              'Identify switching savings with real tariff data',
              'Track everything in one savings dashboard',
              'Never store your documents — privacy by design',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">What we stand for</p>
            <h2 className="text-3xl font-extrabold text-slate-900">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card hover:shadow-card-hover transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3">The people</p>
          <h2 className="text-3xl font-extrabold text-slate-900">Meet the team</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
            Former welfare advisers, government policy analysts, and engineers — united by a shared frustration
            with how inaccessible the benefits system is.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center">
              <div className={`h-20 w-20 mx-auto rounded-2xl ${member.bg} flex items-center justify-center shadow-card mb-4`}>
                <span className="text-white font-extrabold text-xl">{member.initials}</span>
              </div>
              <h3 className="font-bold text-slate-900">{member.name}</h3>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5 mb-3">{member.role}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Press / trust */}
      <section className="bg-slate-50 border-y border-slate-100 py-12 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Trusted & registered</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[
              { label: 'ICO Registered', sub: 'Data controller' },
              { label: 'GDPR Compliant', sub: 'UK & EU' },
              { label: 'TLS Encrypted', sub: 'All data in transit' },
              { label: 'No bill storage', sub: 'Privacy by design' },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center">
                <p className="text-sm font-bold text-slate-700">{badge.label}</p>
                <p className="text-xs text-slate-400">{badge.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
            <TrendingUp className="h-3.5 w-3.5" />
            Free to start
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            See what you&apos;re owed in minutes
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            No card required. Run your first benefits check free and find out exactly
            how much extra income you could be receiving.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-glow-sm text-base"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            ClaimWise UK provides informational guidance only — not regulated financial advice.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} ClaimWise UK. Registered with the ICO.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
            <a href="mailto:hello@claimwise.co.uk" className="hover:text-slate-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
