'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { googleAuthApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface GoogleSignInButtonProps {
  onError?: (msg: string) => void;
  redirectTo?: string;
}

export function GoogleSignInButton({ onError, redirectTo = '/dashboard' }: GoogleSignInButtonProps) {
  const router    = useRouter();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const googleRef = useRef<HTMLDivElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [loading, setLoading]   = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set — Google login disabled');
      return;
    }

    if (document.getElementById('google-gsi-script')) {
      if (window.google?.accounts?.id) initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id    = 'google-gsi-script';
    script.src   = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initGoogle();
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  function initGoogle() {
    if (!window.google?.accounts?.id || !googleRef.current || !clientId) return;
    const w = wrapRef.current?.offsetWidth || 420;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(googleRef.current, {
      theme: 'outline',
      size: 'large',
      width: w,
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    });

    setSdkReady(true);
  }

  async function handleCredentialResponse(response: { credential: string }) {
    setLoading(true);
    try {
      const res = await googleAuthApi.signIn(response.credential) as any;
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push(res.data.isNewUser ? '/onboarding' : redirectTo);
    } catch (err: any) {
      onError?.(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!clientId) return null;

  return (
    <div ref={wrapRef} className="group relative w-full" style={{ height: 46 }}>
      {/*
        The real Google SDK button sits here — invisible (opacity ~0) but on top,
        so it captures all pointer events and opens the Google account chooser.
      */}
      <div
        ref={googleRef}
        className="absolute inset-0 z-10 overflow-hidden rounded-xl"
        style={{ opacity: sdkReady ? 0.001 : 0, pointerEvents: sdkReady ? 'auto' : 'none' }}
      />

      {/* Custom-styled visual button — decorative only, no pointer events */}
      <div
        className={[
          'pointer-events-none absolute inset-0 z-0',
          'flex items-center justify-center gap-3',
          'rounded-xl border-2 border-gray-200 bg-white',
          'text-sm font-semibold text-gray-700',
          'transition-all duration-150',
          'group-hover:border-gray-300 group-hover:bg-gray-50 group-hover:shadow-md',
          loading || !sdkReady ? 'opacity-60' : '',
        ].join(' ')}
      >
        {loading ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin text-gray-400 flex-shrink-0" />
            <span>Signing in…</span>
          </>
        ) : !sdkReady ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin text-gray-300 flex-shrink-0" />
            <span className="text-gray-400">Loading Google…</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Continue with Google</span>
          </>
        )}
      </div>

      {/* Blocks further clicks while the API call is in flight */}
      {loading && (
        <div className="absolute inset-0 z-20 rounded-xl cursor-wait" />
      )}
    </div>
  );
}
