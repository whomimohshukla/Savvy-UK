import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  postcode: string | null;
  onboardingDone: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'savvy-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ── Onboarding completion tracking ───────────────────────────────────────────
// Stored separately from the Zustand store so it survives logout.
// This is needed because the server login response may not always return
// onboardingDone: true even after the user has completed onboarding.

const ONBOARDING_KEY = 'savvy-onboarding-done';

export function markOnboardingDone(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
    const normalised = email.toLowerCase();
    if (!existing.includes(normalised)) {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify([...existing, normalised]));
    }
  } catch {}
}

export function isOnboardingDone(email: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
    return existing.includes(email.toLowerCase());
  } catch {
    return false;
  }
}
