'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Zap, ExternalLink, TrendingDown, Info } from 'lucide-react';
import { energyApi } from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils/cn';
import { useAuthStore } from '@/lib/store/auth.store';
import { EnergyDealCard } from '@/components/energy/EnergyDealCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/index';
import { toast } from '@/lib/store/toast.store';

interface EnergyForm {
  currentSupplier: string;
  currentTariff: string;
  annualUsageKwh: number;
  postcode: string;
}

export default function EnergyPage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<EnergyForm>({
    defaultValues: { postcode: user?.postcode || '' },
  });

  const onSubmit = async (data: EnergyForm) => {
    setLoading(true);
    try {
      const res = await energyApi.scan(data) as any;
      setResult(res.data);
    } catch (err: any) {
      toast({ variant: 'error', title: 'Scan failed', description: err.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (partner: string) => {
    try {
      const res = await energyApi.clickAffiliate(partner, 'ENERGY_SWITCH') as any;
      const url = res?.data?.redirectUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback to Uswitch if no redirect URL returned
        window.open('https://www.uswitch.com/gas-electricity/', '_blank', 'noopener,noreferrer');
      }
    } catch {
      toast({ variant: 'error', title: 'Could not open switching site', description: 'Try visiting uswitch.com directly to compare deals.' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-green-950 flex items-center gap-2">
          <Zap className="h-6 w-6 text-emerald-500" />
          Energy Comparison
        </h2>
        <p className="text-green-600 text-sm mt-1">Find the cheapest energy deal for your home in under a minute</p>
      </div>

      {/* Price cap info */}
      <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
        <Info className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-800">
          <strong>Energy prices rising in 2026.</strong> The Ofgem price cap is £1,849/year.
          Switching to a fixed deal now could lock in lower rates and save you £200–£400/year.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader title="Enter your details" subtitle="More detail = more accurate comparison" />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Current supplier</label>
                <input className="form-input" placeholder="e.g. British Gas" {...register('currentSupplier')} />
              </div>
              <div>
                <label className="form-label">Current tariff</label>
                <input className="form-input" placeholder="e.g. Standard Variable" {...register('currentTariff')} />
              </div>
              <div>
                <label className="form-label">Annual usage (kWh) <span className="text-xs text-green-400">optional</span></label>
                <input type="number" className="form-input" placeholder="~3100 for average home" {...register('annualUsageKwh', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="form-label">Your postcode <span className="text-red-400">*</span></label>
                <input
                  className={`form-input uppercase ${errors.postcode ? 'border-red-300' : ''}`}
                  placeholder="e.g. SW1A 1AA"
                  {...register('postcode', { required: 'Postcode is required' })}
                />
                {errors.postcode && <p className="form-error">{errors.postcode.message}</p>}
              </div>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              {!loading && <Zap className="h-4 w-4" />}
              {loading ? 'Finding best deals…' : 'Compare energy deals'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Results */}
      {result && <EnergyResults data={result} onSwitch={handleSwitch} />}
    </div>
  );
}

function EnergyResults({ data, onSwitch }: { data: any; onSwitch: (p: string) => void }) {
  const res = data?.result;
  if (!res) return null;

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Saving hero */}
      {res.potentialSaving > 0 && (
        <div className="rounded-2xl bg-emerald-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-5 w-5 text-emerald-200" />
            <p className="text-emerald-100 text-sm font-medium">You could save</p>
          </div>
          <p className="text-5xl font-extrabold mb-1">
            {formatCurrency(res.potentialSaving)}
            <span className="text-2xl font-normal text-emerald-200">/year</span>
          </p>
          <p className="text-emerald-100 text-sm">
            by switching from your current supplier to <strong className="text-white">{res.bestDeal?.supplier}</strong>
          </p>
        </div>
      )}

      {/* AI Recommendation */}
      {res.recommendation && (
        <Card>
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">AI Recommendation</p>
                <p className="text-sm text-green-700 leading-relaxed">{res.recommendation}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Warm Home Discount */}
      {res.warmHomeDiscount && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <span className="text-xl">🏠</span>
          <div>
            <p className="font-semibold text-emerald-900 text-sm">Warm Home Discount — £150</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              You may qualify for a £150 one-off energy bill discount. Apply through your supplier.
            </p>
            <a href="https://www.gov.uk/the-warm-home-discount-scheme" target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
              Check eligibility <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Deal cards */}
      {res.deals?.length > 0 && (
        <Card>
          <CardHeader title="Best deals for your home" subtitle="Based on your usage and location" />
          <CardBody className="space-y-2.5">
            {res.deals.map((deal: any, i: number) => (
              <EnergyDealCard
                key={i}
                deal={deal}
                isBest={i === 0}
                index={i}
                onSwitch={() => onSwitch(res.affiliateProvider || 'energy_shop')}
              />
            ))}
            <p className="text-xs text-green-400 text-center pt-2">
              We may earn a commission if you switch — you pay nothing extra.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
