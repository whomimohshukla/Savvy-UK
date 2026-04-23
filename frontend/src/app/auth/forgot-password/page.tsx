'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { Alert } from '@/components/ui/index';

export default function ForgotPasswordPage() {
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setError('');
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    }
  };

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

        {sent ? (
          /* ── Success state ── */
          <div className="rounded-2xl border border-emerald-100 bg-white p-10 text-center shadow-sm animate-scale-in">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-green-950 mb-2 tracking-tight">Check your email</h2>
            <p className="text-green-700 text-sm mb-2 leading-relaxed">
              We&apos;ve sent a password reset link to{' '}
              <strong className="text-green-900">{getValues('email')}</strong>.
            </p>
            <p className="text-green-500 text-xs mb-8">
              The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
            </p>
            <div className="space-y-3">
              <Link href="/auth" className="btn-primary w-full justify-center py-3">
                Back to sign in <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => { setSent(false); setError(''); }}
                className="w-full text-sm text-green-500 hover:text-green-700 transition-colors py-2"
              >
                Didn&apos;t receive it? Send again
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-green-950 tracking-tight">Reset your password</h1>
              <p className="mt-2 text-sm text-green-600 leading-relaxed">
                Enter your email and we&apos;ll send you a secure reset link.
              </p>
            </div>

            {error && <Alert variant="error" className="mb-5">{error}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-3"
              >
                {isSubmitting
                  ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Sending…</>
                  : <>Send reset link <ArrowRight className="h-4 w-4" /></>
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-500 hover:text-green-700 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
