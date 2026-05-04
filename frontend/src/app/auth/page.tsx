'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, PoundSterling, TrendingUp, Shield, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { useAuthStore, isOnboardingDone } from '@/lib/store/auth.store';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import { PageLoader } from '@/components/ui/index';
import { toast } from '@/lib/store/toast.store';

interface LoginForm { email: string; password: string; }

const TRUST_STATS = [
  { icon: <PoundSterling className="h-5 w-5 text-emerald-300" />, value: '£6,000/year',  label: 'Average found per household' },
  { icon: <TrendingUp className="h-5 w-5 text-emerald-300" />,    value: '7M+',          label: 'UK households missing out' },
  { icon: <Shield className="h-5 w-5 text-emerald-300" />,        value: '£24 billion',  label: 'Unclaimed UK benefits (2025)' },
];

export default function LoginPage() {
  const router      = useRouter();
  const setAuth     = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass]       = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data) as any;
      const serverUser = res.data.user;
      const onboardingComplete = serverUser.onboardingDone || isOnboardingDone(serverUser.email);
      const mergedUser = { ...serverUser, onboardingDone: onboardingComplete };
      setAuth(mergedUser, res.data.accessToken, res.data.refreshToken);
      toast({ variant: 'success', title: `Welcome back, ${mergedUser.name?.split(' ')[0] || 'there'}!`, description: 'Signed in successfully.' });
      setRedirecting(true);
      router.push(onboardingComplete ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      toast({ variant: 'error', title: 'Sign in failed', description: err.message || 'Invalid email or password. Please try again.' });
    }
  };

  if (redirecting) return <PageLoader message="Signing you in…" />;

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 text-white bg-emerald-700">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <span className="text-base font-black text-white">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ClaimWise UK</span>
        </Link>

        <div className="space-y-8">
          <div>
            <p className="text-5xl font-black tracking-tight mb-3 leading-none">
              £24 billion<br />
              <span className="text-emerald-200">unclaimed.</span>
            </p>
            <p className="text-emerald-100 text-base leading-relaxed">
              UK benefits go unclaimed every year. Find out what you're missing in 60 seconds.
            </p>
          </div>
          <div className="space-y-3">
            {TRUST_STATS.map((s) => (
              <div key={s.value} className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3.5">
                <div className="flex-shrink-0">{s.icon}</div>
                <div>
                  <p className="font-bold text-white">{s.value}</p>
                  <p className="text-xs text-emerald-200">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-emerald-300">
          Data: ONS Dec 2025 · Policy in Practice 2025 · Ofcom 2025
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
                <span className="text-sm font-black text-white">C</span>
              </div>
              <span className="text-lg font-bold text-green-900">ClaimWise UK</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-black text-green-950 tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-green-600 text-sm">Sign in to your savings dashboard</p>
          </div>

          {/* Google button */}
          <GoogleSignInButton onError={(msg) => toast({ variant: 'error', title: 'Sign in failed', description: msg })} />

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Email address</label>
              <input
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input pr-11 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-700 transition-colors"
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
              {isSubmitting
                ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Signing in…</>
                : <>Sign in <ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-green-600">
            No account yet?{' '}
            <Link href="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Sign up free
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
