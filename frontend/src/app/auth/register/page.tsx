'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton';
import { Alert } from '@/components/ui/index';

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
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      const res = await authApi.register(data) as any;
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-white flex">

      {/* ── Left branding (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-center bg-gradient-to-br from-green-600 to-green-800 p-12 text-white">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <span className="text-base font-bold">S</span>
          </div>
          <span className="text-xl font-bold">Savvy UK</span>
        </div>

        <h2 className="text-4xl font-extrabold mb-4 leading-tight">
          Find your<br />unclaimed money
        </h2>
        <p className="text-green-200 text-lg mb-10">
          Millions of UK residents are missing benefits they're entitled to. We find them in 60 seconds.
        </p>

        <div className="space-y-3.5">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm text-green-100">{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
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
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-gray-500">Free forever — start finding savings today</p>
          </div>

          {error && <Alert variant="error" className="mb-5">{error}</Alert>}

          {/* Google Sign-Up */}
          <div className="mb-5">
            <GoogleSignInButton onError={setError} redirectTo="/onboarding" />
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400">or register with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  autoComplete="name"
                  className={`form-input ${errors.name ? 'border-red-300' : ''}`}
                  placeholder="Jane Smith"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="jane@example.com"
                  {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <label className="form-label">UK Postcode <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
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
                    className={`form-input pr-11 ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="Min 8 chars"
                    {...register('password', {
                      required: 'Password required',
                      minLength: { value: 8, message: 'Min 8 characters' },
                    })}
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-400">
            By signing up you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth" className="font-semibold text-green-600 hover:text-green-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
