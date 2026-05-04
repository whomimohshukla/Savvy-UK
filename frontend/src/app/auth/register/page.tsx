'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import { PageLoader } from '@/components/ui/index';
import { toast } from '@/lib/store/toast.store';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  postcode?: string;
}

const BENEFITS = [
  'Check 40+ UK benefits instantly',
  'AI analyses your energy & broadband bills',
  'Average user finds £2,700/year',
  'Free forever plan — no credit card needed',
];

export default function RegisterPage() {
  const router      = useRouter();
  const setAuth     = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass]       = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await authApi.register(data) as any;
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast({ variant: 'success', title: 'Account created!', description: 'Welcome to ClaimWise UK.' });
      setRedirecting(true);
      router.push('/onboarding');
    } catch (err: any) {
      toast({ variant: 'error', title: 'Registration failed', description: err.message || 'Please try again.' });
    }
  };

  if (redirecting) return <PageLoader message="Creating your account…" />;

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
              Find your<br />
              <span className="text-emerald-200">unclaimed</span><br />
              money.
            </p>
            <p className="text-emerald-100 text-base leading-relaxed">
              Millions of UK residents miss benefits they're entitled to. We find them in 60 seconds.
            </p>
          </div>
          <div className="space-y-3">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle2 className="h-3 w-3 text-emerald-200" />
                </div>
                <p className="text-sm text-emerald-100">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-emerald-300">
          Data: ONS Dec 2025 · Policy in Practice 2025 · Ofcom 2025
        </p>
      </div>

      {/* ── Right form ── */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
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
            <h1 className="text-3xl font-black text-green-950 tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-green-600 text-sm">Free forever — start finding savings today</p>
          </div>

          {/* Google button */}
          <GoogleSignInButton onError={(msg) => toast({ variant: 'error', title: 'Sign up failed', description: msg })} redirectTo="/onboarding" />

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
              <label className="form-label">Full name</label>
              <input
                type="text"
                autoComplete="name"
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Jane Smith"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">Email address</label>
              <input
                type="email"
                autoComplete="email"
                className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                placeholder="jane@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">
                  UK Postcode <span className="text-green-400 font-normal text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  className="form-input uppercase"
                  placeholder="SW1A 1AA"
                  {...register('postcode')}
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-input pr-11 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="Min 8 chars"
                    {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {isSubmitting
                ? <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Creating account…</>
                : <>Create free account <ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-green-500">
            By signing up you agree to our{' '}
            <Link href="/terms" className="underline hover:text-green-700">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-green-700">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-green-600">
            Already have an account?{' '}
            <Link href="/auth" className="font-bold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
