'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Booking, BookingStatus } from '@/types';
import { lockSlot, submitReceipt, cancelBooking, confirmBooking, rejectBooking, completeBooking } from '@/lib/firebase/booking';
import { queryKeys } from '@/lib/queryKeys';
import { DOMAIN_STALE_TIMES } from '@/lib/queryClient';

export function useUserBookings(userId?: string) {
  return useQuery({
    queryKey: queryKeys.userBookings.byUser(userId),
    queryFn: async (): Promise<Booking[]> => {
      if (!userId) return [];
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    },
    enabled: !!userId,
    staleTime: DOMAIN_STALE_TIMES.userBookings,
    gcTime: 1000 * 60 * 10,
    networkMode: 'offlineFirst',
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, userId }: { bookingId: string; userId: string }) => {
      await cancelBooking(bookingId, userId);
    },
    onMutate: async ({ bookingId, userId }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic updates
      await queryClient.cancelQueries({ queryKey: queryKeys.userBookings.all });
      if (userId) {
        await queryClient.cancelQueries({ queryKey: queryKeys.userBookings.byUser(userId) });
      }

      // Snapshot previous query data across all userBookings matching queries
      const previousQueries = queryClient.getQueriesData<Booking[]>({ queryKey: queryKeys.userBookings.all });

      // Optimistically update query data
      queryClient.setQueriesData<Booking[]>({ queryKey: queryKeys.userBookings.all }, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((booking) =>
          booking.id === bookingId ? { ...booking, status: BookingStatus.CANCELLED } : booking
        );
      });

      return { previousQueries, userId };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.byUser(variables.userId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.public });
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      pitchId: string;
      date: string;
      startSlot: number;
      durationHours: number;
      totalAmount: number;
      depositAmount: number;
      bookingType: 'private' | 'public';
      numPeople: number;
    }) => {
      const bookingId = await lockSlot(
        params.userId,
        params.pitchId,
        params.date,
        params.startSlot,
        params.durationHours,
        params.totalAmount,
        params.depositAmount,
        params.bookingType,
        params.numPeople
      );
      return bookingId;
    },
    onSuccess: (bookingId, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.byUser(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(variables.userId) });
      if (variables.bookingType === 'public') {
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.public });
      }
    },
  });
}

export function useSubmitReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      receiptUrl,
      currentUserId,
    }: {
      bookingId: string;
      receiptUrl: string;
      currentUserId: string;
    }) => {
      await submitReceipt(bookingId, receiptUrl, currentUserId);
    },
    onMutate: async ({ bookingId, receiptUrl, currentUserId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userBookings.all });
      if (currentUserId) {
        await queryClient.cancelQueries({ queryKey: queryKeys.userBookings.byUser(currentUserId) });
      }

      const previousQueries = queryClient.getQueriesData<Booking[]>({ queryKey: queryKeys.userBookings.all });

      queryClient.setQueriesData<Booking[]>({ queryKey: queryKeys.userBookings.all }, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((booking) =>
          booking.id === bookingId
            ? { ...booking, receiptUrl, status: BookingStatus.PENDING_REVIEW }
            : booking
        );
      });

      return { previousQueries, currentUserId };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      if (variables?.currentUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.byUser(variables.currentUserId) });
      }
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: string; userId?: string }) => {
      await confirmBooking(bookingId);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.byUser(variables.userId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.public });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: string; userId?: string }) => {
      await rejectBooking(bookingId);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.byUser(variables.userId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.public });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: string; userId?: string }) => {
      await completeBooking(bookingId);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.all });
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userBookings.byUser(variables.userId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.public });
    },
  });
}
