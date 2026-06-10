'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { User as AppUser } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Subscribe to user profile changes (e.g. role update, blacklisting)
        const unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            setAuth(firebaseUser, userDoc.data() as AppUser);
          } else {
            setAuth(firebaseUser, null);
          }
        });
        return () => unsubscribeDoc();
      } else {
        setAuth(null, null);
      }
    });

    return () => unsubscribeAuth();
  }, [setAuth]);

  return <>{children}</>;
}
