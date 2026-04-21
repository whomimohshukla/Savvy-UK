'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { Alert } from '@/components/ui/index';

export default function ForgotPasswordPage() {
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async (_data: { email: string }) => {
    setError('');
    try {
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ background: '#F8FAFC' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-glow-sm">
              <span className="text-sm font-black text-white">S</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Savvy UK</span>
          </Link>
        </div>

        {sent ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-card">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Check your email</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              We've sent a password reset link to{' '}
              <strong className="text-slate-700">{getValues('email')}</strong>.
              It will expire in 1 hour.
            </p>
            <Link href="/auth" className="btn-primary w-full justify-center py-3">
              Back to sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset your password</h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email and we'll send you a reset link.
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
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-3 shadow-glow-sm"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Sending…' : 'Send reset link'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
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
