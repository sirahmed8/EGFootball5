'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User as AppUser, Role } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import { DOMAIN_STALE_TIMES } from '@/lib/queryClient';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async (): Promise<AppUser[]> => {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as AppUser);
    },
    staleTime: DOMAIN_STALE_TIMES.users,
    gcTime: 1000 * 60 * 10,
    networkMode: 'offlineFirst',
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: Role }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
    },
    onMutate: async ({ userId, newRole }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      const previousUsers = queryClient.getQueryData<AppUser[]>(queryKeys.users.all);

      queryClient.setQueryData<AppUser[]>(queryKeys.users.all, (old) => {
        if (!old) return old;
        return old.map(u => (u.uid === userId ? { ...u, role: newRole } : u));
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.all, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useToggleBlacklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isBlacklisted }: { userId: string; isBlacklisted: boolean }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isBlacklisted });
    },
    onMutate: async ({ userId, isBlacklisted }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      const previousUsers = queryClient.getQueryData<AppUser[]>(queryKeys.users.all);

      queryClient.setQueryData<AppUser[]>(queryKeys.users.all, (old) => {
        if (!old) return old;
        return old.map(u => (u.uid === userId ? { ...u, isBlacklisted } : u));
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.all, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      const previousUsers = queryClient.getQueryData<AppUser[]>(queryKeys.users.all);

      queryClient.setQueryData<AppUser[]>(queryKeys.users.all, (old) => {
        if (!old) return old;
        return old.filter(u => u.uid !== userId);
      });

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.all, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
