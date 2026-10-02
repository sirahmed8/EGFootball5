import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User as FirebaseUser } from 'firebase/auth';
import { User as AppUser } from '@/types';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  setAuth: (firebaseUser: FirebaseUser | null, appUser: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      firebaseUser: null,
      appUser: null,
      loading: true,
      setAuth: (firebaseUser, appUser) => set({ firebaseUser, appUser, loading: false }),
      setLoading: (loading) => set({ loading }),
      clearAuth: () => {
        set({ firebaseUser: null, appUser: null, loading: false });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('egfootball5_cached_app_user');
          } catch {
            // Ignore storage clearing error
          }
        }
      },
    }),
    {
      name: 'egfootball5_cached_app_user',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({ appUser: state.appUser }),
      onRehydrateStorage: () => (state) => {
        if (state?.appUser) {
          state.loading = false;
        }
      },
    }
  )
);
