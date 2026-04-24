'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { PageLoader } from '@/components/ui/index';
import { toast } from '@/lib/store/toast.store';

interface ResetForm { password: string; confirmPassword: string; }

function ResetPasswordContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');

  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess]         = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetForm>();

  useEffect(() => {
    if (!token) toast({ variant: 'error', title: 'Invalid reset link', description: 'Please request a new password reset link.' });
  }, [token]);

  const onSubmit = async (data: ResetForm) => {
    if (!token) return;
    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
      toast({ variant: 'success', title: 'Password reset!', description: 'You can now sign in with your new password.' });
      setTimeout(() => {
        setRedirecting(true);
        router.push('/auth');
      }, 2000);
    } catch (err: any) {
      toast({ variant: 'error', title: 'Reset failed', description: err.message || 'Please request a new link.' });
    }
  };

  if (redirecting) return <PageLoader message="Redirecting to sign in…" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-5">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
              <span className="text-sm font-black text-white">S</span>
            </div>
            <span className="text-lg font-bold text-green-950 tracking-tight">Savvy <span className="text-emerald-500">UK</span></span>
          </Link>
        </div>

        {!token ? (
          /* ── No token ── */
          <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-green-950 mb-2">Invalid reset link</h2>
            <p className="text-green-600 text-sm mb-8 leading-relaxed">
              This link is missing a token. Please request a new password reset link.
            </p>
            <Link href="/auth/forgot-password" className="btn-primary w-full justify-center py-3">
              Request new link <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : success ? (
          /* ── Success ── */
          <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center shadow-sm animate-scale-in">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-green-950 mb-2 tracking-tight">Password reset!</h2>
            <p className="text-green-600 text-sm mb-8 leading-relaxed">
              Your password has been changed. Redirecting you to sign in…
            </p>
            <Link href="/auth" className="btn-primary w-full justify-center py-3">
              Sign in now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* ── Form ── */
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <ShieldAlert className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-green-950 tracking-tight">Set new password</h1>
              <p className="mt-2 text-sm text-green-600 leading-relaxed">
                Choose a strong password you haven&apos;t used before.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">New password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-input pr-11 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="Min 8 characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'At least 8 characters' },
                    })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-700 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <div>
                <label className="form-label">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-input pr-11 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    placeholder="Repeat password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (v) => v === watch('password') || 'Passwords do not match',
                    })}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-700 transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>

              {/* Password strength */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold text-green-700 mb-1.5">Strong passwords include:</p>
                <ul className="space-y-0.5">
                  {[
                    ['At least 8 characters', (watch('password')?.length ?? 0) >= 8],
                    ['Upper and lowercase letters', /(?=.*[a-z])(?=.*[A-Z])/.test(watch('password') ?? '')],
                    ['A number or symbol', /(?=.*[0-9!@#$%^&*])/.test(watch('password') ?? '')],
                  ].map(([label, met]) => (
                    <li key={label as string} className={`flex items-center gap-2 text-xs ${met ? 'text-emerald-600' : 'text-green-400'}`}>
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      {label as string}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-3 mt-2"
              >
                {isSubmitting
                  ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Resetting…</>
                  : <>Reset password <ArrowRight className="h-4 w-4" /></>
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/forgot-password" className="text-sm text-green-500 hover:text-green-700 transition-colors">
                Need a new link?
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500">
          <span className="text-xl font-black text-white">S</span>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
