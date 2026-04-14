'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Alert } from '@/components/ui/index';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setError('');
    try {
      // In production, call your API reset endpoint
      await new Promise(r => setTimeout(r, 1000)); // simulate
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Savvy UK</span>
          </Link>
        </div>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-6">
              We've sent a password reset link to <strong className="text-gray-700">{getValues('email')}</strong>.
              It will expire in 1 hour.
            </p>
            <Link href="/auth" className="btn-primary w-full justify-center py-2.5 text-sm">
              Back to log in
            </Link>
          </div>
        ) : (
          <div className="card p-8">
            <div className="mb-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                No worries — enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-3 text-sm"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link href="/auth" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
