'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, ArrowRight, PoundSterling, Zap, TrendingUp, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import { Alert } from '@/components/ui/index';
import { toast } from '@/lib/store/toast.store';

interface LoginForm { email: string; password: string; }

const TRUST_STATS = [
  { icon: <PoundSterling className="h-5 w-5 text-emerald-400" />, value: '£6,000/year', label: 'Average found per household' },
  { icon: <Zap className="h-5 w-5 text-amber-400" />,             value: '£260–£400',  label: 'Saved on energy bills' },
  { icon: <TrendingUp className="h-5 w-5 text-violet-400" />,     value: '7M+',        label: 'UK households missing out' },
];

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
      toast({ title: `Welcome back, ${res.data.user.name?.split(' ')[0] || 'there'}!`, description: 'You are now signed in.' });
      router.push(res.data.user.onboardingDone ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: '#030c18' }}
      >

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-glow-sm">
            <span className="text-base font-black">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Savvy UK</span>
        </Link>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div>
            <p className="text-5xl font-black tracking-tight mb-3 leading-none">£24 billion<br/><span className="text-emerald-400">unclaimed.</span></p>
            <p className="text-slate-400 text-lg leading-relaxed">UK benefits go unclaimed every year. Find out what you're missing.</p>
          </div>
          <div className="space-y-3">
            {TRUST_STATS.map((s) => (
              <div key={s.value} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3.5 backdrop-blur-sm">
                <div className="flex-shrink-0">{s.icon}</div>
                <div>
                  <p className="font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          Data: ONS Dec 2025 · Policy in Practice 2025 · Ofcom 2025
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
                <span className="text-sm font-black text-white">S</span>
              </div>
              <span className="text-lg font-bold text-slate-900">Savvy UK</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-slate-500">Log in to your savings dashboard</p>
          </div>

          {error && <Alert variant="error" className="mb-6">{error}</Alert>}

          {/* Google */}
          <div className="mb-5">
            <GoogleSignInButton onError={setError} />
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-medium text-slate-400">or continue with email</span>
            </div>
          </div>

          {/* Form */}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-base mt-2 shadow-glow-sm"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account yet?{' '}
            <Link href="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Sign up free
            </Link>
          </p>

          {/* Demo */}
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Try the demo</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Email: <code className="text-slate-700 font-semibold">demo@savvy-uk.com</code></p>
              <p className="text-xs text-slate-500">Password: <code className="text-slate-700 font-semibold">Password123!</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
