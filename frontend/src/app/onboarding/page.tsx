'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const STEPS = [
  { id: 'household',   title: 'Your household',    emoji: '🏠' },
  { id: 'employment',  title: 'Work & income',      emoji: '💼' },
  { id: 'benefits',    title: 'Current benefits',   emoji: '✅' },
  { id: 'finish',      title: 'All set!',           emoji: '🎉' },
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
  const router   = useRouter();
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [step, setStep]     = useState(0);
  const [data, setData]     = useState<OnboardingData>(INITIAL);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof OnboardingData, v: any) => setData(prev => ({ ...prev, [k]: v }));
  const toggle = (k: keyof OnboardingData) => setData(prev => ({ ...prev, [k]: !(prev[k]) }));

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    setSaving(true);
    try {
      await api.patch('/api/v1/auth/profile', {
        postcode: data.postcode.toUpperCase(),
        householdSize: data.householdSize,
        ...data,
        onboardingDone: true,
      });
      // Update local user
      if (user) {
        const updated = { ...user, onboardingDone: true, postcode: data.postcode };
        setAuth(updated, accessToken!, refreshToken!);
      }
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-white flex flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="font-bold text-gray-900">Savvy UK</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600">
          Skip for now
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all',
                    i < step  ? 'bg-green-600 text-white' :
                    i === step ? 'bg-green-600 text-white ring-4 ring-green-100' :
                                 'bg-gray-100 text-gray-400',
                  )}>
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('h-0.5 flex-1 mx-1 w-16 transition-all', i < step ? 'bg-green-500' : 'bg-gray-200')} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {STEPS.map((s, i) => (
                <p key={s.id} className={cn('text-xs text-center w-24', i === step ? 'font-semibold text-gray-900' : 'text-gray-400')}>
                  {s.emoji} {s.title}
                </p>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="card p-8 animate-fade-up">
            {step === 0 && <HouseholdStep data={data} set={set} toggle={toggle} />}
            {step === 1 && <EmploymentStep data={data} set={set} toggle={toggle} />}
            {step === 2 && <BenefitsStep data={data} toggle={toggle} />}
            {step === 3 && <FinishStep name={user?.name?.split(' ')[0]} />}
          </div>

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-between">
            <Button variant="ghost" onClick={back} className={step === 0 ? 'invisible' : ''}>
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

/* ── Step 1: Household ── */
function HouseholdStep({ data, set, toggle }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your household</h2>
        <p className="text-gray-500 text-sm mt-1">This helps us find the most relevant benefits for you</p>
      </div>
      <div>
        <label className="form-label">UK Postcode</label>
        <input type="text" className="form-input uppercase" placeholder="e.g. SW1A 1AA"
          value={data.postcode} onChange={e => set('postcode', e.target.value)} />
      </div>
      <div>
        <label className="form-label">Number of people in household</label>
        <div className="flex items-center gap-4">
          <button onClick={() => set('householdSize', Math.max(1, data.householdSize - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
          <span className="text-2xl font-bold text-gray-900 w-8 text-center">{data.householdSize}</span>
          <button onClick={() => set('householdSize', Math.min(10, data.householdSize + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-lg font-bold">+</button>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { key: 'isPensioner',       label: '🧓 I\'m over state pension age (66+)' },
          { key: 'hasChildren',       label: '👶 I have dependent children' },
          { key: 'hasDisabledMember', label: '♿ I or a household member has a disability' },
          { key: 'homeOwner',         label: '🏠 I own my home' },
          { key: 'privateTenant',     label: '🔑 I rent privately' },
          { key: 'onPrepayMeter',     label: '⚡ I\'m on a prepayment energy meter' },
        ].map(({ key, label }) => (
          <OButton key={key} label={label} active={data[key]} onClick={() => toggle(key)} />
        ))}
      </div>
      {data.hasChildren && (
        <div>
          <label className="form-label">How many dependent children?</label>
          <div className="flex items-center gap-4">
            <button onClick={() => set('childrenCount', Math.max(1, data.childrenCount - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
            <span className="text-2xl font-bold text-gray-900 w-8 text-center">{data.childrenCount}</span>
            <button onClick={() => set('childrenCount', Math.min(10, data.childrenCount + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-lg font-bold">+</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Employment ── */
function EmploymentStep({ data, set, toggle }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Work & income</h2>
        <p className="text-gray-500 text-sm mt-1">Your employment status affects which benefits you can claim</p>
      </div>
      <div className="space-y-3">
        {[
          { key: 'isEmployed',    label: '💼 Currently employed (part or full time)' },
          { key: 'isSelfEmployed', label: '🧑‍💻 Self-employed' },
          { key: 'isUnemployed',  label: '🔍 Unemployed and looking for work' },
        ].map(({ key, label }) => (
          <OButton key={key} label={label} active={data[key]} onClick={() => toggle(key)} />
        ))}
      </div>
      <div>
        <label className="form-label">Approximate annual household income <span className="text-gray-400 font-normal">(optional)</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">£</span>
          <input type="number" className="form-input pl-8" placeholder="e.g. 25000"
            value={data.annualIncome} onChange={e => set('annualIncome', e.target.value)} />
        </div>
        <p className="mt-1 text-xs text-gray-400">Used only to check income-related benefit eligibility</p>
      </div>
    </div>
  );
}

/* ── Step 3: Current Benefits ── */
function BenefitsStep({ data, toggle }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Benefits you already receive</h2>
        <p className="text-gray-500 text-sm mt-1">Tick what you currently claim — we'll find what you're missing</p>
      </div>
      <div className="space-y-3">
        {[
          { key: 'claimsUniversalCredit', label: '💷 Universal Credit' },
          { key: 'claimsPensionCredit',   label: '🧓 Pension Credit' },
          { key: 'claimsPIP',             label: '♿ Personal Independence Payment (PIP)' },
          { key: 'claimsChildBenefit',    label: '👶 Child Benefit' },
        ].map(({ key, label }) => (
          <OButton key={key} label={label} active={data[key]} onClick={() => toggle(key)} />
        ))}
      </div>
      <p className="text-xs text-gray-400 rounded-lg bg-gray-50 p-3">
        Don't worry if you're not sure — we'll check everything during your full benefits analysis
      </p>
    </div>
  );
}

/* ── Step 4: Done ── */
function FinishStep({ name }: { name?: string }) {
  return (
    <div className="py-4 text-center space-y-5">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">🎉</div>
          <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {name ? `You're all set, ${name}!` : 'You\'re all set!'}
        </h2>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Your profile is saved. Head to your dashboard to run a full benefits check
          and discover exactly how much money you could be claiming.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { emoji: '💷', label: 'Benefits check' },
          { emoji: '⚡', label: 'Energy savings' },
          { emoji: '🔔', label: 'Smart alerts' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <p className="text-xs font-medium text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Toggle Button ── */
function OButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all text-left',
        active
          ? 'border-green-300 bg-green-50 text-green-800 shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50/30',
      )}
    >
      <span>{label}</span>
      <div className={cn(
        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
        active ? 'border-green-500 bg-green-500' : 'border-gray-300',
      )}>
        {active && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
