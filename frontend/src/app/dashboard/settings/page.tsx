'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Settings, Crown, ExternalLink, CheckCircle2, Shield,
  Eye, EyeOff, X, User, Trash2, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { subscriptionApi, authApi } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/useApi';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/store/toast.store';

// ─── Change Password Modal ─────────────────────────────────────────────────────

interface PasswordForm { currentPassword: string; newPassword: string; confirmPassword: string; }

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<PasswordForm>();

  const onSubmit = async (data: PasswordForm) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast({ variant: 'success', title: 'Password updated', description: 'Your password has been changed.' });
      onClose();
    } catch (err: any) {
      toast({ variant: 'error', title: 'Update failed', description: err.message || 'Failed to update password.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white border border-emerald-100 shadow-xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-green-950">Change password</h3>
            <p className="text-xs text-green-400 mt-0.5">Other sessions will be signed out.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-green-400 hover:bg-emerald-50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Current password</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'}
                className={`form-input pr-11 ${errors.currentPassword ? 'border-red-400' : ''}`}
                placeholder="••••••••"
                {...register('currentPassword', { required: 'Required' })} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-700">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="form-error">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="form-label">New password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'}
                className={`form-input pr-11 ${errors.newPassword ? 'border-red-400' : ''}`}
                placeholder="Min 8 characters"
                {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })} />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-700">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="form-error">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="form-label">Confirm new password</label>
            <input type="password"
              className={`form-input ${errors.confirmPassword ? 'border-red-400' : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === watch('newPassword') || 'Passwords do not match',
              })} />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">Update password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Profile Modal ────────────────────────────────────────────────────────

interface ProfileForm { name: string; postcode: string; householdSize: number; }

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const user    = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { accessToken, refreshToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      postcode: user?.postcode || '',
      householdSize: (user as any)?.householdSize || 1,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const res = await authApi.updateProfile({
        name: data.name,
        postcode: data.postcode?.toUpperCase() || undefined,
        householdSize: Number(data.householdSize),
      }) as any;
      setAuth(res.data, accessToken!, refreshToken!);
      toast({ variant: 'success', title: 'Profile updated', description: 'Your details have been saved.' });
      onClose();
    } catch (err: any) {
      toast({ variant: 'error', title: 'Update failed', description: err.message || 'Failed to save profile.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white border border-emerald-100 shadow-xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-green-950">Edit profile</h3>
            <p className="text-xs text-green-400 mt-0.5">Update your personal details.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-green-400 hover:bg-emerald-50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Full name</label>
            <input className={`form-input ${errors.name ? 'border-red-400' : ''}`}
              placeholder="Jane Smith"
              {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">UK Postcode</label>
              <input className="form-input uppercase" placeholder="SW1A 1AA"
                {...register('postcode')} />
            </div>
            <div>
              <label className="form-label">Household size</label>
              <select className="form-input" {...register('householdSize')}>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router    = useRouter();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const isGoogleUser = !(user as any)?.passwordHash;
  const canDelete = isGoogleUser ? confirm === 'DELETE' : (password.length >= 8 && confirm === 'DELETE');

  const handleDelete = async () => {
    if (confirm !== 'DELETE') return;
    setLoading(true);
    try {
      await authApi.deleteAccount(isGoogleUser ? undefined : password);
      clearAuth();
      toast({ variant: 'success', title: 'Account deleted', description: 'Your account and all data have been permanently removed.' });
      router.push('/');
    } catch (err: any) {
      toast({ variant: 'error', title: 'Delete failed', description: err.message || 'Failed to delete account. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white border border-red-100 shadow-xl p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-950">Delete account</h3>
              <p className="text-xs text-red-500 mt-0.5">This action cannot be undone.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-green-400 hover:bg-emerald-50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-5">
          <p className="text-sm font-semibold text-red-800 mb-1">This will permanently delete:</p>
          <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
            <li>Your profile and all personal information</li>
            <li>All benefits check history and results</li>
            <li>All savings records and alerts</li>
            <li>Your subscription (no refunds for partial months)</li>
          </ul>
        </div>

        <div className="space-y-4">
          {!isGoogleUser && (
            <div>
              <label className="form-label">Confirm with your password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-700">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="form-label">
              Type <strong className="text-red-600">DELETE</strong> to confirm
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="DELETE"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Plans ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'FREE', name: 'Free', price: 0,
    features: ['1 benefits check/month', '1 bill upload', 'Basic alerts', 'Benefits report'],
  },
  {
    id: 'PRO', name: 'Pro', price: 4.99, popular: true,
    features: ['Unlimited benefits checks', '5 bill uploads/month', 'Smart alerts', 'Energy comparison', 'Broadband tariff check', 'Priority support'],
  },
  {
    id: 'PREMIUM', name: 'Premium', price: 9.99,
    features: ['Everything in Pro', 'Unlimited bill uploads', 'Monthly auto-scan', 'Insurance comparison', 'CSV export of all savings', 'White-glove claim help'],
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [upgrading, setUpgrading]           = useState('');
  const [showPasswordModal, setShowPasswordModal]   = useState(false);
  const [showProfileModal, setShowProfileModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal]       = useState(false);
  const { data } = useApi(() => subscriptionApi.getCurrent() as any);
  const sub = (data as any)?.data;
  const currentPlan = user?.plan || 'FREE';

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan);
    try {
      const res = await subscriptionApi.createCheckout(plan) as any;
      window.location.href = res.data.checkoutUrl;
    } catch (err: any) {
      toast({ variant: 'error', title: 'Checkout failed', description: err.message || 'Failed to start checkout.' });
    } finally {
      setUpgrading('');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showProfileModal  && <EditProfileModal   onClose={() => setShowProfileModal(false)} />}
      {showDeleteModal   && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}

      <div>
        <h2 className="text-2xl font-bold text-green-950 flex items-center gap-2">
          <Settings className="h-6 w-6 text-green-600" />
          Settings
        </h2>
        <p className="text-green-600 text-sm mt-0.5">Manage your account and subscription</p>
      </div>

      {/* ── Profile ── */}
      <Card>
        <CardHeader
          title="Profile"
          action={
            <Button variant="outline" size="sm" onClick={() => setShowProfileModal(true)}>
              <User className="h-3.5 w-3.5" /> Edit
            </Button>
          }
        />
        <CardBody className="space-y-0 p-0">
          {[
            { label: 'Full name',       value: user?.name      || '—' },
            { label: 'Email',           value: user?.email     || '—' },
            { label: 'Postcode',        value: (user as any)?.postcode || '—' },
            { label: 'Household size',  value: (user as any)?.householdSize ? `${(user as any).householdSize} people` : '—' },
            { label: 'Plan',            value: currentPlan },
          ].map((row, i, arr) => (
            <div key={row.label}
              className={`flex items-center justify-between px-6 py-4 ${i < arr.length - 1 ? 'border-b border-emerald-50' : ''}`}>
              <span className="text-sm text-green-600">{row.label}</span>
              <span className="text-sm font-medium text-green-950">{row.value}</span>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* ── Subscription ── */}
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
          <div className="grid gap-3">
            {PLANS.map((plan) => {
              const isActive = currentPlan === plan.id;
              return (
                <div key={plan.id}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isActive ? 'border-emerald-300 bg-emerald-50/50'
                    : plan.popular ? 'border-emerald-200 hover:border-emerald-200'
                    : 'border-emerald-100 hover:border-emerald-200'
                  }`}>
                  {plan.popular && !isActive && (
                    <div className="absolute -top-2.5 left-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Most popular
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-green-950">{plan.name}</span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />Current plan
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-extrabold text-green-950">
                          {plan.price === 0 ? 'Free' : `£${plan.price}`}
                        </span>
                        {plan.price > 0 && <span className="text-sm text-green-400">/month</span>}
                      </div>
                      <ul className="space-y-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-emerald-500" />{f}
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
                        <Button size="sm" variant={plan.popular ? 'primary' : 'outline'}
                          loading={upgrading === plan.id} onClick={() => handleUpgrade(plan.id)}>
                          Upgrade
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {sub?.subscription && currentPlan !== 'FREE' && (
            <div className="mt-2 rounded-xl bg-emerald-50/30 border border-emerald-100 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">Status</span>
                <span className="font-medium capitalize text-green-950">{sub.subscription.status?.toLowerCase()}</span>
              </div>
              {sub.subscription.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-green-600">Next billing</span>
                  <span className="font-medium text-green-950">
                    {new Date(sub.subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              {sub.subscription.priceGbp && (
                <div className="flex justify-between">
                  <span className="text-green-600">Amount</span>
                  <span className="font-medium text-green-950">£{sub.subscription.priceGbp}/month</span>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Security ── */}
      <Card>
        <CardHeader title="Security" action={<Shield className="h-4 w-4 text-green-400" />} />
        <CardBody className="divide-y divide-emerald-50 p-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-green-950">Password</p>
              <p className="text-xs text-green-400">Change your account password</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
              Change password
            </Button>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-green-950">Email address</p>
              <p className="text-xs text-green-400">{user?.email}</p>
            </div>
            <span className="badge-green">
              <CheckCircle2 className="h-3 w-3" />Verified
            </span>
          </div>
        </CardBody>
      </Card>

      {/* ── Legal ── */}
      <Card>
        <CardHeader title="Legal & Privacy" />
        <CardBody className="space-y-1 p-0">
          {[
            { label: 'Privacy Policy',   href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'ICO Registration', href: 'https://ico.org.uk', external: true },
            { label: 'Contact us',       href: 'mailto:hello@savvy-uk.com', external: true },
          ].map((link) => (
            <a key={link.label} href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-between px-6 py-3.5 text-sm text-green-700 hover:bg-emerald-50 transition-colors">
              {link.label}
              <ExternalLink className="h-3.5 w-3.5 text-green-300" />
            </a>
          ))}
        </CardBody>
      </Card>

      {/* ── Danger zone ── */}
      <Card>
        <CardHeader title="Danger zone" />
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600">Delete account</p>
              <p className="text-xs text-green-400 mt-0.5">
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete account
            </Button>
          </div>
        </CardBody>
      </Card>

      <p className="text-xs text-green-400 text-center pb-4">
        Savvy UK provides informational guidance only — not regulated financial advice.
        We do not store uploaded bill files. Registered with the ICO.
      </p>
    </div>
  );
}
