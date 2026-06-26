'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';

export function LandingRedirect() {
  const { firebaseUser, appUser, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser && appUser) {
      if (appUser.role === 'owner') {
        router.replace('/owner');
      } else if (appUser.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/home');
      }
    }
  }, [firebaseUser, appUser, loading, router]);

  return null;
}
