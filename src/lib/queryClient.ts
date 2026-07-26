import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes cache retention
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
      retry: 1,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

export const DOMAIN_STALE_TIMES = {
  pitches: 5 * 60 * 1000, // 5 minutes
  matches: 30 * 1000, // 30 seconds
  userBookings: 2 * 60 * 1000, // 2 minutes
  notifications: 30 * 1000, // 30 seconds
  users: 2 * 60 * 1000, // 2 minutes
};
