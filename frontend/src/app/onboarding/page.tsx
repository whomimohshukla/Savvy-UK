'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, markOnboardingDone } from '@/lib/store/auth.store';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/index';
import { CheckCircle2, ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

const STEPS = [
  { id: 'household',  title: 'Household',    emoji: '🏠' },
  { id: 'employment', title: 'Work & Income', emoji: '💼' },
  { id: 'benefits',   title: 'Benefits',     emoji: '✅' },
  { id: 'finish',     title: 'All Set!',      emoji: '🎉' },
];

interface OnboardingData {
  postcode: string;
  householdSize: number;
  isPensioner: boolean;
  hasChildren: boolean;
  childrenCount: number;
  hasDisabledMember: boolean;
  isEmployed: boolean;
  isUnemployed: boolean;
  isSelfEmployed: boolean;
  annualIncome: string;
  claimsUniversalCredit: boolean;
  claimsPensionCredit: boolean;
  claimsPIP: boolean;
  claimsChildBenefit: boolean;
  homeOwner: boolean;
  privateTenant: boolean;
  onPrepayMeter: boolean;
}

const INITIAL: OnboardingData = {
  postcode: '', householdSize: 1,
  isPensioner: false, hasChildren: false, childrenCount: 1, hasDisabledMember: false,
  isEmployed: false, isUnemployed: false, isSelfEmployed: false, annualIncome: '',
  claimsUniversalCredit: false, claimsPensionCredit: false, claimsPIP: false, claimsChildBenefit: false,
  homeOwner: false, privateTenant: false, onPrepayMeter: false,
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [step, setStep]         = useState(0);
  const [data, setData]         = useState<OnboardingData>(INITIAL);
  const [saving, setSaving]     = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [done, setDone]         = useState(false);

  const update = (k: keyof OnboardingData, v: OnboardingData[typeof k]) =>
    setData(prev => ({ ...prev, [k]: v }));
  const toggle = (k: keyof OnboardingData) =>
    setData(prev => ({ ...prev, [k]: !prev[k] }));

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    setSaving(true);
    try {
      const payload = { ...data, postcode: data.postcode.toUpperCase(), onboardingDone: true };
      await api.patch('/api/v1/auth/profile', payload);
      if (user) {
        // Mark in persistent local storage so login always redirects correctly
        markOnboardingDone(user.email);
        setAuth({ ...user, onboardingDone: true, postcode: data.postcode.toUpperCase() }, accessToken!, refreshToken!);
      }
      setDone(true);
      router.push('/dashboard');
    } catch {
      // Even on error, mark done and go to dashboard
      if (user) markOnboardingDone(user.email);
      setDone(true);
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    setSkipping(true);
    if (user) markOnboardingDone(user.email);
    router.push('/dashboard');
  };

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  if (done || skipping) return <PageLoader message={skipping ? 'Taking you to your dashboard…' : 'Setting up your dashboard…'} />;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Header ── */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-emerald-100 bg-white sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]">
            <span className="text-sm font-black text-white">C</span>
          </div>
          <span className="font-bold text-green-950 tracking-tight">
            ClaimWise <span className="text-emerald-500">UK</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-xs text-green-500 font-medium">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={skip}
            disabled={skipping}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-500 hover:text-green-700 transition-colors disabled:opacity-50"
          >
            {skipping && <span className="h-3.5 w-3.5 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />}
            Skip for now
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-5 py-10">
        <div className="w-full max-w-lg">

          {/* ── Progress ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                      i < step
                        ? 'bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                        : i === step
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                          : 'bg-emerald-50 text-emerald-300 border-2 border-emerald-200',
                    )}>
                      {i < step ? <CheckCircle2 className="h-4.5 w-4.5" /> : <span className="text-sm">{s.emoji}</span>}
                    </div>
                    <span className={cn(
                      'mt-2 text-[10px] font-semibold text-center leading-tight hidden sm:block',
                      i === step ? 'text-green-900' : i < step ? 'text-emerald-500' : 'text-green-300',
                    )}>
                      {s.title}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500',
                      i < step ? 'bg-emerald-400' : 'bg-emerald-100',
                    )} />
                  )}
                </div>
              ))}
            </div>

            <div className="h-2 w-full rounded-full bg-emerald-50 overflow-hidden border border-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-green-500 font-medium">{STEPS[step].emoji} {STEPS[step].title}</p>
              <p className="text-xs text-emerald-500 font-semibold">{progress}% complete</p>
            </div>
          </div>

          {/* ── Step card ── */}
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-[0_4px_24px_rgba(16,185,129,0.08)] animate-fade-up">
            {step === 0 && <HouseholdStep   data={data} update={update} toggle={toggle} />}
            {step === 1 && <EmploymentStep  data={data} update={update} toggle={toggle} />}
            {step === 2 && <BenefitsStep    data={data} toggle={toggle} />}
            {step === 3 && <FinishStep      name={user?.name?.split(' ')[0]} />}
          </div>

          {/* ── Navigation ── */}
          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={back}
              className={cn('text-green-500 hover:text-green-700 hover:bg-emerald-50', step === 0 && 'invisible')}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={next} size="lg">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} loading={saving} size="lg">
                <Sparkles className="h-4 w-4" />
                Go to my dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step sub-components ─────────────────────────────────────────────────── */

function StepHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl mb-4">
        {emoji}
      </div>
      <h2 className="text-2xl font-black text-green-950 tracking-tight">{title}</h2>
      <p className="text-green-600 text-sm mt-1.5 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function Counter({
  label, value, min = 1, max = 10, onChange,
}: { label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex items-center gap-4 mt-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 text-xl font-bold transition-colors disabled:opacity-40"
        >−</button>
        <span className="text-2xl font-black text-green-950 w-10 text-center tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 text-xl font-bold transition-colors disabled:opacity-40"
        >+</button>
      </div>
    </div>
  );
}

function HouseholdStep({ data, update, toggle }: { data: OnboardingData; update: any; toggle: any }) {
  return (
    <div className="space-y-5">
      <StepHeader emoji="🏠" title="Your household" subtitle="This helps us find the most relevant benefits for you" />

      <div>
        <label className="form-label">UK Postcode</label>
        <input
          type="text"
          className="form-input uppercase"
          placeholder="e.g. SW1A 1AA"
          value={data.postcode}
          onChange={e => update('postcode', e.target.value)}
        />
        <p className="mt-1.5 text-xs text-green-500">Used to check regional tariffs and local support schemes</p>
      </div>

      <Counter
        label="People in household (including you)"
        value={data.householdSize}
        onChange={v => update('householdSize', v)}
      />

      <div className="space-y-2.5">
        <p className="form-label">Which of these apply to you?</p>
        {[
          { key: 'isPensioner',       emoji: '🧓', text: "I'm over state pension age (66+)" },
          { key: 'hasChildren',       emoji: '👶', text: 'I have dependent children' },
          { key: 'hasDisabledMember', emoji: '♿', text: 'I or a household member has a disability' },
          { key: 'homeOwner',         emoji: '🏠', text: 'I own my home (with or without mortgage)' },
          { key: 'privateTenant',     emoji: '🔑', text: 'I rent privately' },
          { key: 'onPrepayMeter',     emoji: '⚡', text: "I'm on a prepayment energy meter" },
        ].map(({ key, emoji, text }) => (
          <OButton key={key} emoji={emoji} label={text} active={data[key as keyof OnboardingData] as boolean} onClick={() => toggle(key)} />
        ))}
      </div>

      {data.hasChildren && (
        <Counter
          label="How many dependent children?"
          value={data.childrenCount}
          onChange={v => update('childrenCount', v)}
        />
      )}
    </div>
  );
}

function EmploymentStep({ data, update, toggle }: { data: OnboardingData; update: any; toggle: any }) {
  return (
    <div className="space-y-5">
      <StepHeader emoji="💼" title="Work & income" subtitle="Your employment status affects which benefits you can claim" />

      <div className="space-y-2.5">
        <p className="form-label">Current employment status</p>
        {[
          { key: 'isEmployed',     emoji: '💼', text: 'Currently employed (part or full time)' },
          { key: 'isSelfEmployed', emoji: '🧑‍💻', text: 'Self-employed' },
          { key: 'isUnemployed',   emoji: '🔍', text: 'Unemployed and looking for work' },
        ].map(({ key, emoji, text }) => (
          <OButton key={key} emoji={emoji} label={text} active={data[key as keyof OnboardingData] as boolean} onClick={() => toggle(key)} />
        ))}
      </div>

      <div>
        <label className="form-label">
          Annual household income{' '}
          <span className="text-green-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-semibold text-sm">£</span>
          <input
            type="number"
            className="form-input pl-8"
            placeholder="e.g. 25000"
            value={data.annualIncome}
            onChange={e => update('annualIncome', e.target.value)}
          />
        </div>
        <p className="mt-1.5 text-xs text-green-500">Used only to check income-related benefit eligibility</p>
      </div>
    </div>
  );
}

function BenefitsStep({ data, toggle }: { data: OnboardingData; toggle: any }) {
  return (
    <div className="space-y-5">
      <StepHeader emoji="✅" title="Benefits you already receive" subtitle="Tick what you currently claim — we'll find what you're missing" />

      <div className="space-y-2.5">
        {[
          { key: 'claimsUniversalCredit', emoji: '💷', text: 'Universal Credit' },
          { key: 'claimsPensionCredit',   emoji: '🧓', text: 'Pension Credit' },
          { key: 'claimsPIP',             emoji: '♿', text: 'Personal Independence Payment (PIP)' },
          { key: 'claimsChildBenefit',    emoji: '👶', text: 'Child Benefit' },
        ].map(({ key, emoji, text }) => (
          <OButton key={key} emoji={emoji} label={text} active={data[key as keyof OnboardingData] as boolean} onClick={() => toggle(key)} />
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="text-base flex-shrink-0">💡</span>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Don't worry if you're not sure — we'll run a full check during your benefits analysis anyway.
        </p>
      </div>
    </div>
  );
}

function FinishStep({ name }: { name?: string }) {
  return (
    <div className="py-4 text-center space-y-6">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-5xl shadow-[0_0_24px_rgba(16,185,129,0.2)]">
            🎉
          </div>
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-green-950 tracking-tight">
          {name ? `You're all set, ${name}! 🎊` : "You're all set!"}
        </h2>
        <p className="text-green-600 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
          Your profile is saved. Head to your dashboard to run a full benefits check
          and discover exactly how much money you could be claiming.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: '💷', label: 'Benefits check', desc: '40+ schemes' },
          { emoji: '⚡', label: 'Energy savings',  desc: 'Compare tariffs' },
          { emoji: '🔔', label: 'Smart alerts',    desc: 'Never miss a saving' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5 text-center">
            <div className="text-2xl mb-1.5">{s.emoji}</div>
            <p className="text-xs font-bold text-green-800">{s.label}</p>
            <p className="text-[10px] text-green-500 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Toggle Button ─────────────────────────────────────────────────────── */
function OButton({ emoji, label, active, onClick }: { emoji: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all text-left',
        active
          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
          : 'border-emerald-100 bg-white text-green-700 hover:border-emerald-300 hover:bg-emerald-50/50',
      )}
    >
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <span className="flex-1">{label}</span>
      <div className={cn(
        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
        active ? 'border-emerald-500 bg-emerald-500' : 'border-emerald-200',
      )}>
        {active && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
