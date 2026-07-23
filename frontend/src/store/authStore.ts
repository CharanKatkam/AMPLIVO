import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: 'admin' | 'client' | 'sales' | 'hr' | 'employee';
  company?: string;
  image?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  // Zustand's persist middleware rehydrates from localStorage
  // asynchronously after the initial render, so isAuthenticated is always
  // false for one tick on a hard page load. Consumers that gate a redirect
  // on isAuthenticated (e.g. ProtectedRoute) must wait for hasHydrated -
  // otherwise every hard navigation/refresh has a race that can bounce a
  // logged-in user back to /login.
  hasHydrated: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: (user, token, refreshToken = undefined) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      setToken: (token) => set({ token }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
