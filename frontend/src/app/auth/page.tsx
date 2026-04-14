'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, TrendingUp, PoundSterling, Zap } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import { Alert } from '@/components/ui/index';

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const res = await authApi.login(data) as any;
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push(res.data.user.onboardingDone ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-white flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-green-700 to-green-900 p-12 text-white">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <span className="text-base font-bold">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Savvy UK</span>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div>
            <p className="text-5xl font-extrabold mb-2">£24 billion</p>
            <p className="text-green-200 text-lg">in UK benefits goes unclaimed every year</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: <PoundSterling className="h-5 w-5" />, label: '£6,000/year', sub: 'Average found per household' },
              { icon: <Zap className="h-5 w-5" />,           label: '£260–£400',  sub: 'Saved on energy bills' },
              { icon: <TrendingUp className="h-5 w-5" />,    label: '7M+',        sub: 'UK households missing out' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 rounded-xl bg-white/10 px-4 py-3">
                <div className="text-green-300">{s.icon}</div>
                <div>
                  <p className="font-bold text-white">{s.label}</p>
                  <p className="text-xs text-green-200">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-green-300/60">
          Data: ONS Dec 2025 · Policy in Practice 2025 · Ofcom 2025
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Savvy UK</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-500">Log in to your savings dashboard</p>
          </div>

          {error && <Alert variant="error" className="mb-5">{error}</Alert>}

          {/* Google Sign-In */}
          <div className="mb-5">
            <GoogleSignInButton onError={setError} />
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400">or continue with email</span>
            </div>
          </div>

          {/* Email/password form */}
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input pr-11 ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            No account yet?{' '}
            <Link href="/auth/register" className="font-semibold text-green-600 hover:text-green-700">
              Sign up free
            </Link>
          </p>

          {/* Demo account */}
          <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-xs font-semibold text-gray-500 mb-1">Try the demo</p>
            <p className="text-xs text-gray-400">
              Email: <code className="text-gray-600">demo@savvy-uk.com</code>
            </p>
            <p className="text-xs text-gray-400">
              Password: <code className="text-gray-600">Password123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
