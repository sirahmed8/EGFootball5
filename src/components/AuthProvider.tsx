'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { User as AppUser } from '@/types';
import { toast } from 'sonner';
import { usePathname, useRouter } from '@/i18n/routing';

import { SetUsernameModal } from '@/components/SetUsernameModal';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/home',
  '/matches',
  '/var-highlights',
  '/live-stream',
  '/challenges',
  '/tournaments',
  '/communities',
  '/leaderboard',
  '/jersey-designer',
  '/subscription',
  '/goal-of-the-month',
  '/ceremony',
  '/announcements',
  '/guide',
  '/privacy',
  '/terms',
  '/cookies',
];

const normalizePath = (p: string) => p.replace(/\/$/, '') || '/';
const isPublicPath = (targetPath: string) =>
  PUBLIC_PATHS.some((pub) => normalizePath(pub) === normalizePath(targetPath));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const loading = useAuthStore((state) => state.loading);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous Firestore document listener if any exists
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = undefined;
      }

      if (firebaseUser) {
        // Subscribe to user profile changes (e.g. role update, blacklisting)
        unsubscribeDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              setAuth(firebaseUser, userDoc.data() as AppUser);
            } else {
              setAuth(firebaseUser, null);
            }
          },
          (error) => {
            console.error('Error fetching user data:', error);
            if (error.code === 'permission-denied') {
              toast.error('Session expired or permission denied');
              clearAuth();
            }
          }
        );
      } else {
        clearAuth();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, [setAuth, clearAuth]);

  // Automatically redirect to Welcome Page ('/') when user is unauthenticated on internal/protected pages
  // (e.g. when user deletes site data, clears storage, or logs out while on any page)
  useEffect(() => {
    if (!loading && !firebaseUser) {
      if (!isPublicPath(pathname)) {
        router.replace('/');
      }
    }
  }, [loading, firebaseUser, pathname, router]);

  // Handle storage clearing events across browser tabs/devtools
  useEffect(() => {
    const handleStorageChange = () => {
      if (!auth.currentUser) {
        clearAuth();
        if (!isPublicPath(pathname)) {
          router.replace('/');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAuth, pathname, router]);

  return (
    <>
      {children}
      <SetUsernameModal />
    </>
  );
}
