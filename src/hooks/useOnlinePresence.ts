'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';

export function useOnlinePresence() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    if (!firebaseUser) {
      return;
    }

    const userId = firebaseUser.uid;
    const userStatusRef = ref(rtdb, `/status/${userId}`);
    const connectedRef = ref(rtdb, '.info/connected');

    // Handle connection status and onDisconnect hook specifically for /status/${userId}
    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(userStatusRef)
          .set({
            state: 'offline',
            lastChanged: serverTimestamp(),
          })
          .then(() => {
            set(userStatusRef, {
              state: 'online',
              name: appUser?.name || firebaseUser.displayName || 'Player',
              lastChanged: serverTimestamp(),
            });
            setIsOnline(true);
          })
          .catch((err) => console.error('Presence set error:', err));
      }
    });

    // Listen specifically to this user's path /status/${userId} (avoids downloading root /status)
    const unsubscribeUserStatus = onValue(
      userStatusRef,
      (snap) => {
        if (snap.exists()) {
          const val = snap.val();
          setIsOnline(val.state === 'online');
        }
      },
      () => {
        setIsOnline(false);
      }
    );

    return () => {
      unsubscribeConnected();
      unsubscribeUserStatus();
      set(userStatusRef, {
        state: 'offline',
        lastChanged: serverTimestamp(),
      }).catch(() => {});
    };
  }, [firebaseUser, appUser?.name]);

  return { isOnline: firebaseUser ? isOnline : false, onlineCount: isOnline ? 1 : 0 };
}

