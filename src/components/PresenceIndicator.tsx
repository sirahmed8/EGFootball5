'use client';

import { useEffect, useState } from 'react';
import { rtdb } from '@/lib/firebase/config';
import { ref, onValue, onDisconnect, set, serverTimestamp, DatabaseReference } from 'firebase/database';
import { useAuthStore } from '@/store/useAuthStore';
import { Users } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function PresenceIndicator() {
  const { firebaseUser, appUser } = useAuthStore();
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const locale = useLocale();

  useEffect(() => {
    // Reference to the global list of active connections
    const connectionsRef = ref(rtdb, 'presence');
    const connectedRef = ref(rtdb, '.info/connected');

    let userPresenceRef: DatabaseReference | null = null;

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected)!
        if (firebaseUser) {
          // If logged in, use their UID to avoid duplicate connections counting twice if they have multiple tabs
          userPresenceRef = ref(rtdb, `presence/${firebaseUser.uid}`);
        } else {
          // If anonymous/not logged in, generate a random temporary ID for this session
          const sessionId = Math.random().toString(36).substring(2, 15);
          userPresenceRef = ref(rtdb, `presence/anon_${sessionId}`);
        }

        // When I disconnect, remove this device
        if (userPresenceRef) {
          onDisconnect(userPresenceRef).remove().then(() => {
            // Set user to online
            if (userPresenceRef) { // Ensure TS knows it's defined inside the callback
              set(userPresenceRef, {
                status: 'online',
                lastChanged: serverTimestamp(),
                role: appUser?.role || 'user',
                name: appUser?.name || firebaseUser?.displayName || 'Anonymous',
              });
            }
          });
        }
      }
    });

    // Listen to total connections
    const unsubscribeConnections = onValue(connectionsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setOnlineCount(Object.keys(data).length);
      } else {
        setOnlineCount(0);
      }
    });

    return () => {
      unsubscribeConnected();
      unsubscribeConnections();
      if (userPresenceRef) {
        set(userPresenceRef, null); // Clean up on unmount
      }
    };
  }, [firebaseUser]);

  if (onlineCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold animate-in fade-in zoom-in duration-500">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </div>
      <Users className="w-3.5 h-3.5" />
      <span>{onlineCount} {locale === 'ar' ? 'متصل الآن' : 'Online'}</span>
    </div>
  );
}
