'use client';

import { useState } from 'react';
import { Settings, Crown, ExternalLink, Loader2, CheckCircle2, Shield, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { subscriptionApi } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardHeader, CardBody, Alert, Badge } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/cn';

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    features: ['1 benefits check/month', '1 bill upload', 'Basic alerts', 'Benefits report'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 4.99,
    popular: true,
    features: ['Unlimited benefits checks', '5 bill uploads/month', 'Smart alerts', 'Energy comparison', 'Broadband tariff check', 'Priority support'],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 9.99,
    features: ['Everything in Pro', 'Unlimited bill uploads', 'Monthly auto-scan', 'Insurance comparison', 'CSV export of all savings', 'White-glove claim help'],
  },
];

export default function SettingsPage() {
  const user    = useAuthStore((s) => s.user);
  const [upgrading, setUpgrading]     = useState('');
  const [upgradeError, setUpgradeError] = useState('');
  const { data } = useApi(() => subscriptionApi.getCurrent() as any);
  const sub = (data as any)?.data;

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan); setUpgradeError('');
    try {
      const res = await subscriptionApi.createCheckout(plan) as any;
      window.location.href = res.data.checkoutUrl;
    } catch (err: any) {
      setUpgradeError(err.message || 'Failed to start checkout');
    } finally {
      setUpgrading('');
    }
  };

  const currentPlan = user?.plan || 'FREE';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-500" />
          Settings
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and subscription</p>
      </div>

      {/* Account details */}
      <Card>
        <CardHeader title="Account details" />
        <CardBody className="space-y-0 p-0">
          {[
            { label: 'Full name',  value: user?.name || '—' },
            { label: 'Email',      value: user?.email || '—' },
            { label: 'Postcode',   value: user?.postcode || '—' },
            { label: 'Plan',       value: user?.plan || 'FREE' },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-6 py-4 ${i < arr.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="text-sm font-medium text-slate-900">{row.value}</span>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader
          title="Your plan"
          subtitle="Upgrade anytime — cancel anytime"
          action={
            currentPlan !== 'FREE' ? (
              <Badge variant={currentPlan === 'PREMIUM' ? 'amber' : 'green'}>
                {currentPlan === 'PREMIUM' && <Crown className="h-3 w-3" />}
                {currentPlan}
              </Badge>
            ) : undefined
          }
        />
        <CardBody className="space-y-4">
          {upgradeError && <Alert variant="error">{upgradeError}</Alert>}

          {/* Plan cards */}
          <div className="grid gap-3">
            {PLANS.map((plan) => {
              const isActive = currentPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isActive
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : plan.popular
                        ? 'border-slate-200 hover:border-emerald-200'
                        : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {plan.popular && !isActive && (
                    <div className="absolute -top-2.5 left-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Most popular
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{plan.name}</span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />Current plan
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-extrabold text-slate-900">
                          {plan.price === 0 ? 'Free' : `£${plan.price}`}
                        </span>
                        {plan.price > 0 && <span className="text-sm text-slate-400">/month</span>}
                      </div>
                      <ul className="space-y-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {isActive ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                      ) : currentPlan === 'FREE' && plan.id !== 'FREE' ? (
                        <Button
                          size="sm"
                          variant={plan.popular ? 'primary' : 'outline'}
                          loading={upgrading === plan.id}
                          onClick={() => handleUpgrade(plan.id)}
                        >
                          Upgrade
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current subscription details */}
          {sub?.subscription && currentPlan !== 'FREE' && (
            <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-medium capitalize text-slate-900">{sub.subscription.status?.toLowerCase()}</span>
              </div>
              {sub.subscription.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Next billing</span>
                  <span className="font-medium text-slate-900">
                    {new Date(sub.subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              {sub.subscription.priceGbp && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-medium text-slate-900">£{sub.subscription.priceGbp}/month</span>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader
          title="Security"
          action={<Shield className="h-4 w-4 text-slate-400" />}
        />
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Password</p>
              <p className="text-xs text-slate-400">Change your account password</p>
            </div>
            <Button variant="outline" size="sm">Change password</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Email verified</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <span className="badge-green">
              <CheckCircle2 className="h-3 w-3" />Verified
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Legal links */}
      <Card>
        <CardHeader title="Legal & Privacy" />
        <CardBody className="space-y-1 p-0">
          {[
            { label: 'Privacy Policy',    href: '/privacy' },
            { label: 'Terms of Service',  href: '/terms' },
            { label: 'ICO Registration',  href: 'https://ico.org.uk', external: true },
            { label: 'Contact us',        href: 'mailto:hello@savvy-uk.com', external: true },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-between px-6 py-3.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {link.label}
              <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
            </a>
          ))}
        </CardBody>
      </Card>

      <p className="text-xs text-slate-400 text-center pb-4">
        Savvy UK provides informational guidance only — not regulated financial advice.
        We do not store uploaded bill files. Registered with the ICO.
      </p>
    </div>
  );
}
