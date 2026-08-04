'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc, runTransaction, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Booking } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import { DOMAIN_STALE_TIMES } from '@/lib/queryClient';

type PlayerItem = string | { uid: string; name?: string; joinedAt?: number };

export function usePublicMatches() {
  return useQuery({
    queryKey: queryKeys.matches.public,
    queryFn: async (): Promise<Booking[]> => {
      const q = query(
        collection(db, 'bookings'),
        where('bookingType', '==', 'public'),
        where('status', '==', 'confirmed'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    },
    staleTime: DOMAIN_STALE_TIMES.matches,
    gcTime: 1000 * 60 * 10,
    networkMode: 'offlineFirst',
  });
}

export function useMatch(matchId?: string) {
  return useQuery({
    queryKey: queryKeys.matches.detail(matchId || ''),
    queryFn: async (): Promise<Booking | null> => {
      if (!matchId) return null;
      const ref = doc(db, 'bookings', matchId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Booking;
    },
    enabled: !!matchId,
    staleTime: DOMAIN_STALE_TIMES.matches,
    gcTime: 1000 * 60 * 10,
    networkMode: 'offlineFirst',
  });
}

export function useJoinMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, userId, userName }: { bookingId: string; userId: string; userName?: string }) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(bookingRef);
        if (!snap.exists()) throw new Error('Match not found');

        const data = snap.data() as Booking;
        const joinedPlayers = (data.joinedPlayers || []) as PlayerItem[];
        
        // Prevent duplicate joins
        const alreadyJoined = joinedPlayers.some(p => (typeof p === 'string' ? p === userId : p.uid === userId));
        if (alreadyJoined) return;

        if (joinedPlayers.length >= (data.numPeople || 10)) {
          throw new Error('Match is full');
        }

        const newPlayer = { uid: userId, name: userName || 'Player', joinedAt: Date.now() };
        transaction.update(bookingRef, {
          joinedPlayers: [...joinedPlayers, newPlayer],
        });

        // Notify match creator if creator is another user
        if (data.userId && data.userId !== userId) {
          const notificationRef = doc(collection(db, 'notifications'));
          transaction.set(notificationRef, {
            id: notificationRef.id,
            userId: data.userId,
            senderId: userId,
            title: 'Player Joined Your Match!',
            message: `${userName || 'A player'} joined your public match on ${data.date}.`,
            read: false,
            createdAt: Date.now(),
            type: 'match_joined'
          });
        }
      });
    },
    onMutate: async ({ bookingId, userId, userName }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.public });
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.detail(bookingId) });

      const previousPublicMatches = queryClient.getQueriesData<Booking[]>({ queryKey: queryKeys.matches.public });
      const previousMatchDetail = queryClient.getQueryData<Booking>(queryKeys.matches.detail(bookingId));

      // Update public matches list
      queryClient.setQueriesData<Booking[]>({ queryKey: queryKeys.matches.public }, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((match) => {
          if (match.id === bookingId) {
            const joined = match.joinedPlayers || [];
            const newPlayer = { uid: userId, name: userName || 'Player', joinedAt: Date.now() };
            return {
              ...match,
              joinedPlayers: [...joined, newPlayer],
            };
          }
          return match;
        });
      });

      // Update single match detail if cached
      queryClient.setQueryData<Booking>(queryKeys.matches.detail(bookingId), (oldMatch) => {
        if (!oldMatch) return oldMatch;
        const joined = oldMatch.joinedPlayers || [];
        const newPlayer = { uid: userId, name: userName || 'Player', joinedAt: Date.now() };
        return {
          ...oldMatch,
          joinedPlayers: [...joined, newPlayer],
        };
      });

      return { previousPublicMatches, previousMatchDetail };
    },
    onError: (err, variables, context) => {
      if (context?.previousPublicMatches) {
        context.previousPublicMatches.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousMatchDetail && variables?.bookingId) {
        queryClient.setQueryData(queryKeys.matches.detail(variables.bookingId), context.previousMatchDetail);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.public });
      if (variables?.bookingId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.detail(variables.bookingId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useLeaveMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, userId }: { bookingId: string; userId: string }) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(bookingRef);
        if (!snap.exists()) throw new Error('Match not found');

        const data = snap.data() as Booking;
        const joinedPlayers = (data.joinedPlayers || []) as PlayerItem[];
        const updatedPlayers = joinedPlayers.filter(p => (typeof p === 'string' ? p !== userId : p.uid !== userId));

        transaction.update(bookingRef, {
          joinedPlayers: updatedPlayers,
        });

        // Notify match creator if creator is another user
        if (data.userId && data.userId !== userId) {
          const notificationRef = doc(collection(db, 'notifications'));
          transaction.set(notificationRef, {
            id: notificationRef.id,
            userId: data.userId,
            senderId: userId,
            title: 'Player Left Your Match',
            message: `A player left your public match on ${data.date}.`,
            read: false,
            createdAt: Date.now(),
            type: 'match_left'
          });
        }
      });
    },
    onMutate: async ({ bookingId, userId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.public });
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.detail(bookingId) });

      const previousPublicMatches = queryClient.getQueriesData<Booking[]>({ queryKey: queryKeys.matches.public });
      const previousMatchDetail = queryClient.getQueryData<Booking>(queryKeys.matches.detail(bookingId));

      // Update public matches list
      queryClient.setQueriesData<Booking[]>({ queryKey: queryKeys.matches.public }, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((match) => {
          if (match.id === bookingId) {
            const joined = match.joinedPlayers || [];
            return {
              ...match,
              joinedPlayers: joined.filter((p: PlayerItem) => (typeof p === 'string' ? p !== userId : p.uid !== userId)),
            };
          }
          return match;
        });
      });

      // Update single match detail if cached
      queryClient.setQueryData<Booking>(queryKeys.matches.detail(bookingId), (oldMatch) => {
        if (!oldMatch) return oldMatch;
        const joined = oldMatch.joinedPlayers || [];
        return {
          ...oldMatch,
          joinedPlayers: joined.filter((p: PlayerItem) => (typeof p === 'string' ? p !== userId : p.uid !== userId)),
        };
      });

      return { previousPublicMatches, previousMatchDetail };
    },
    onError: (err, variables, context) => {
      if (context?.previousPublicMatches) {
        context.previousPublicMatches.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousMatchDetail && variables?.bookingId) {
        queryClient.setQueryData(queryKeys.matches.detail(variables.bookingId), context.previousMatchDetail);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.public });
      if (variables?.bookingId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.detail(variables.bookingId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

