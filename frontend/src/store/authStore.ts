import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: 'admin' | 'client' | 'sales' | 'hr' | 'employee' | 'crm';
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
      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        // Other persisted Zustand stores (crmStore's selected-lead/client/
        // project ids, hrStore's cached state) must not survive a logout -
        // otherwise the next person to use this browser/device inherits the
        // previous user's leftover UI state.
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('amplivo-crm-store');
          window.localStorage.removeItem('amplivo-hr-storage');
        }
      },
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
