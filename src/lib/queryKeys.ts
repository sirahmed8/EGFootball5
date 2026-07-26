export const queryKeys = {
  pitches: {
    all: ['pitches'] as const,
    detail: (id?: string) => ['pitches', id] as const,
  },
  matches: {
    public: ['publicMatches'] as const,
    detail: (id: string) => ['matches', id] as const,
  },
  userBookings: {
    all: ['userBookings'] as const,
    byUser: (userId?: string) => ['userBookings', userId] as const,
    detail: (bookingId: string) => ['bookings', bookingId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    byUser: (userId?: string) => ['notifications', userId] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (userId: string) => ['users', userId] as const,
  },
  chat: {
    matchMessages: (matchId: string) => ['chat', matchId] as const,
  },
} as const;
