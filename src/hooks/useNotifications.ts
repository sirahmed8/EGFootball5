'use client';

import { useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  writeBatch,
  limit,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { queryKeys } from '@/lib/queryKeys';

export interface AppNotification {
  id: string;
  userId: string;
  senderId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  type: string;
}

/**
 * Real-time notifications hook using onSnapshot.
 * Bypasses TanStack Query's fetch mechanism in favor of a live listener
 * that pushes updates directly into the query cache.
 */
export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.notifications.byUser(userId);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const notifications = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as AppNotification)
        );
        queryClient.setQueryData(key, notifications);
      },
      (error) => {
        console.warn('[useNotifications] onSnapshot error:', error);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Return current cache value (populated by the listener above)
  const data: AppNotification[] = queryClient.getQueryData(key) ?? [];
  return { data };
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId }: { notificationId: string; userId?: string }) => {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    },
    onMutate: async ({ notificationId, userId }) => {
      if (!userId) return;
      const key = queryKeys.notifications.byUser(userId);
      await queryClient.cancelQueries({ queryKey: key });

      const previousNotifications = queryClient.getQueryData<AppNotification[]>(key);

      queryClient.setQueryData<AppNotification[]>(key, (old) => {
        if (!old) return old;
        return old.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      });

      return { previousNotifications, key };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications && context?.key) {
        queryClient.setQueryData(context.key, context.previousNotifications);
      }
    },
    // No invalidation needed — onSnapshot will push the updated state automatically
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notifications }: { userId: string; notifications: AppNotification[] }) => {
      const unread = notifications.filter((n) => !n.read);
      if (unread.length === 0) return;
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    },

    onMutate: async ({ userId }) => {
      const key = queryKeys.notifications.byUser(userId);
      await queryClient.cancelQueries({ queryKey: key });

      const previousNotifications = queryClient.getQueryData<AppNotification[]>(key);

      queryClient.setQueryData<AppNotification[]>(key, (old) => {
        if (!old) return old;
        return old.map((n) => ({ ...n, read: true }));
      });

      return { previousNotifications, key };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications && context?.key) {
        queryClient.setQueryData(context.key, context.previousNotifications);
      }
    },
    // onSnapshot handles the settled state automatically
  });
}
