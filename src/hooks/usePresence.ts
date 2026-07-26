'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase/config';

export interface UserPresence {
  state: 'online' | 'offline';
  name?: string;
  lastChanged?: number;
}

export function usePresence(userId?: string) {
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Specific user path listener to avoid root /status download bottleneck
    const userStatusRef = ref(rtdb, `/status/${userId}`);

    const unsubscribe = onValue(
      userStatusRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPresence(snapshot.val() as UserPresence);
        } else {
          setPresence({ state: 'offline' });
        }
        setLoading(false);
      },
      (error) => {
        console.error(`Error listening to presence path /status/${userId}:`, error);
        setPresence({ state: 'offline' });
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { presence: userId ? presence : null, loading: userId ? loading : false };
}

