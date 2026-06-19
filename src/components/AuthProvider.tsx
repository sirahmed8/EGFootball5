'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { User as AppUser } from '@/types';
import { toast } from 'sonner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);

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
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), 
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
              setAuth(null, null);
            }
          }
        );
      } else {
        setAuth(null, null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, [setAuth]);

  return <>{children}</>;
}
