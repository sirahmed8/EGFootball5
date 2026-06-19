import { create } from 'zustand';
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

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  appUser: null,
  loading: true,
  setAuth: (firebaseUser, appUser) => set({ firebaseUser, appUser, loading: false }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ firebaseUser: null, appUser: null, loading: false }),
}));
