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

interface GoogleSignInButtonProps {
  onError?: (msg: string) => void;
  redirectTo?: string;
}

export function GoogleSignInButton({ onError, redirectTo = '/dashboard' }: GoogleSignInButtonProps) {
  const router    = useRouter();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const btnRef    = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set — Google login disabled');
      return;
    }

    // Load Google Identity Services script
    if (document.getElementById('google-gsi-script')) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.id  = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initGoogle();
    document.head.appendChild(script);

    return () => { /* cleanup handled by React StrictMode */ };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  function initGoogle() {
    if (!window.google?.accounts?.id || !btnRef.current || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Render the styled Google button
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      width: btnRef.current.offsetWidth || 400,
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
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
        </div>
      )}
      <div
        ref={btnRef}
        className="w-full overflow-hidden rounded-xl"
        style={{ minHeight: 44 }}
      />
      {!sdkReady && (
        <div className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading Google...
        </div>
      )}
    </div>
  );
}
