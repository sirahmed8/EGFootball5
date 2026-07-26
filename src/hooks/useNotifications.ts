'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { queryKeys } from '@/lib/queryKeys';
import { DOMAIN_STALE_TIMES } from '@/lib/queryClient';

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

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.byUser(userId),
    queryFn: async (): Promise<AppNotification[]> => {
      if (!userId) return [];
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
    },
    enabled: !!userId,
    staleTime: DOMAIN_STALE_TIMES.notifications,
    gcTime: 1000 * 60 * 5,
    networkMode: 'offlineFirst',
  });
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
        return old.map(n => (n.id === notificationId ? { ...n, read: true } : n));
      });

      return { previousNotifications, key };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications && context?.key) {
        queryClient.setQueryData(context.key, context.previousNotifications);
      }
    },
    onSettled: (data, error, variables) => {
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(variables.userId) });
      }
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notifications }: { userId: string; notifications: AppNotification[] }) => {
      const unread = notifications.filter(n => !n.read);
      if (unread.length === 0) return;
      const batch = writeBatch(db);
      unread.forEach(n => {
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
        return old.map(n => ({ ...n, read: true }));
      });

      return { previousNotifications, key };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications && context?.key) {
        queryClient.setQueryData(context.key, context.previousNotifications);
      }
    },
    onSettled: (data, error, variables) => {
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(variables.userId) });
      }
    },
  });
}
