'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronRight, CheckCircle2, PoundSterling, Loader2, RotateCcw } from 'lucide-react';
import { benefitsApi } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/cn';
import { BenefitCard, Benefit } from '@/components/benefits/BenefitCard';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/FormFields';
import { Alert } from '@/components/ui/index';

interface BenefitsForm {
  hasChildren: boolean; childrenCount: number;
  hasDisabledMember: boolean; hasCarerInHousehold: boolean; isPensioner: boolean;
  isEmployed: boolean; isUnemployed: boolean; isSelfEmployed: boolean;
  annualIncome: number;
  claimsUniversalCredit: boolean; claimsPensionCredit: boolean;
  claimsESA: boolean; claimsJSA: boolean; claimsPIP: boolean;
  claimsCarersAllowance: boolean; claimsHousingBenefit: boolean;
  claimsChildBenefit: boolean; claimsCouncilTaxReduction: boolean;
  homeOwner: boolean; privateTenant: boolean; socialHousingTenant: boolean;
  onPrepayMeter: boolean; currentEnergySupplier: string;
}

export default function BenefitsPage() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch } = useForm<BenefitsForm>({
    defaultValues: { childrenCount: 1 },
  });
  const hasChildren = watch('hasChildren');

  const onSubmit = async (data: BenefitsForm) => {
    setStep('loading');
    setError('');
    try {
      const res = await benefitsApi.check(data) as any;
      setResults(res.data);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Check failed. Please try again.');
      setStep('form');
    }
  };

  /* ── Loading screen ── */
  if (step === 'loading') return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-emerald-100" />
        <div className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-green-900">Checking your entitlements…</p>
        <p className="text-sm text-green-500 mt-1">Scanning 40+ UK benefits and support schemes</p>
      </div>
      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        {['Checking Universal Credit eligibility…', 'Reviewing energy social tariffs…', 'Scanning housing benefits…'].map((msg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-green-500">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            {msg}
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Results screen ── */
  if (step === 'results' && results) return (
    <BenefitsResults results={results} onReset={() => { setStep('form'); setResults(null); }} />
  );

  /* ── Form ── */
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-green-950">Benefits Check</h2>
        <p className="text-green-600 text-sm mt-1">
          Answer these questions and our AI will find every benefit you're entitled to but not claiming.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
        <div className="text-xl mt-0.5">💡</div>
        <p className="text-sm text-emerald-800">
          <strong>£24 billion</strong> in UK benefits goes unclaimed every year.
          The average eligible household is missing out on <strong>£6,000/year</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection emoji="👨‍👩‍👧" title="Your household">
          <Checkbox id="isPensioner" label="I'm over state pension age (66+)" {...register('isPensioner')} />
          <Checkbox id="hasChildren" label="I have dependent children" {...register('hasChildren')} />
          {hasChildren && (
            <div className="ml-7 flex items-center gap-3">
              <span className="text-sm text-green-700">How many children?</span>
              <input
                type="number" min={1} max={10}
                className="w-16 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-center focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                {...register('childrenCount', { valueAsNumber: true })}
              />
            </div>
          )}
          <Checkbox id="hasDisabledMember" label="I or a household member has a disability or long-term condition" {...register('hasDisabledMember')} />
          <Checkbox id="hasCarerInHousehold" label="I'm an unpaid carer for a family member or friend" {...register('hasCarerInHousehold')} />
        </FormSection>

        <FormSection emoji="💼" title="Employment & income">
          <Checkbox id="isEmployed"     label="Currently employed (working)" {...register('isEmployed')} />
          <Checkbox id="isSelfEmployed" label="Self-employed" {...register('isSelfEmployed')} />
          <Checkbox id="isUnemployed"   label="Unemployed and looking for work" {...register('isUnemployed')} />
          <div>
            <label className="form-label">Approximate annual household income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-sm font-medium">£</span>
              <input
                type="number"
                className="form-input pl-8"
                placeholder="e.g. 25000"
                {...register('annualIncome', { valueAsNumber: true })}
              />
            </div>
          </div>
        </FormSection>

        <FormSection emoji="✅" title="Benefits you currently receive">
          <p className="text-xs text-green-400 mb-1">Tick what you already claim — we'll find what you're missing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CURRENT_BENEFITS.map(b => (
              <Checkbox key={b.id} id={b.id} label={b.label} {...register(b.id as any)} />
            ))}
          </div>
        </FormSection>

        <FormSection emoji="🏠" title="Housing situation">
          <Checkbox id="homeOwner"           label="I own my home (with or without mortgage)" {...register('homeOwner')} />
          <Checkbox id="privateTenant"       label="I rent privately" {...register('privateTenant')} />
          <Checkbox id="socialHousingTenant" label="I'm in social or council housing" {...register('socialHousingTenant')} />
        </FormSection>

        <FormSection emoji="⚡" title="Energy">
          <Checkbox id="onPrepayMeter" label="I'm on a prepayment (pay-as-you-go) meter" {...register('onPrepayMeter')} />
          <div>
            <label className="form-label">Current energy supplier <span className="text-green-400 font-normal">(optional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. British Gas, Octopus Energy"
              {...register('currentEnergySupplier')}
            />
          </div>
        </FormSection>

        <Button type="submit" size="xl" fullWidth>
          Check my entitlements
          <ChevronRight className="h-5 w-5" />
        </Button>
        <p className="text-center text-xs text-green-400">
          We never store sensitive personal data. Results are for guidance only and not regulated financial advice.
        </p>
      </form>
    </div>
  );
}

function FormSection({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{emoji}</span>
        <h3 className="text-base font-semibold text-green-900">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

const CURRENT_BENEFITS = [
  { id: 'claimsUniversalCredit',   label: 'Universal Credit' },
  { id: 'claimsPensionCredit',     label: 'Pension Credit' },
  { id: 'claimsESA',               label: 'ESA (Employment & Support)' },
  { id: 'claimsJSA',               label: "JSA (Jobseeker's Allowance)" },
  { id: 'claimsPIP',               label: 'PIP (Personal Independence Payment)' },
  { id: 'claimsCarersAllowance',   label: "Carer's Allowance" },
  { id: 'claimsHousingBenefit',    label: 'Housing Benefit' },
  { id: 'claimsChildBenefit',      label: 'Child Benefit' },
  { id: 'claimsCouncilTaxReduction', label: 'Council Tax Reduction' },
];

function BenefitsResults({ results, onReset }: { results: any; onReset: () => void }) {
  const benefits: Benefit[] = results?.result?.benefits || [];
  const total   = results?.result?.totalValue || results?.totalPotentialValue || 0;
  const summary = results?.result?.summary || '';

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-up">
      {/* Hero */}
      <div className="rounded-2xl bg-emerald-600 p-6 text-white">
        <p className="text-emerald-100 text-sm mb-1 font-medium">Potential annual savings found</p>
        <p className="text-5xl font-extrabold tabular-nums mb-2">{formatCurrency(total)}</p>
        <p className="text-emerald-100 text-sm">per year — from {benefits.length} benefit{benefits.length !== 1 ? 's' : ''}</p>
        {summary && (
          <p className="mt-3 text-sm text-emerald-100 leading-relaxed border-t border-emerald-500 pt-3">
            {summary}
          </p>
        )}
      </div>

      {benefits.length === 0 ? (
        <div className="card p-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-semibold text-green-900">Great news — you appear to be claiming everything</h3>
          <p className="text-sm text-green-500 mt-1">Check again if your circumstances change</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-green-900">
              {benefits.length} benefit{benefits.length !== 1 ? 's' : ''} found
            </h3>
            <span className="text-xs text-green-400">Click any card for claim steps</span>
          </div>
          <div className="space-y-3">
            {benefits.map((b, i) => <BenefitCard key={i} benefit={b} />)}
          </div>
        </div>
      )}

      <Button variant="outline" fullWidth onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        Run another check
      </Button>
    </div>
  );
}
