# Milestone 3 Analysis Report: React Query, Caching & Optimistic UI Architecture

**Author:** Explorer 1 (Milestone 3 — React Query, Caching & Optimistic UI)  
**Working Directory:** `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_1`  
**Date:** 2026-07-26  

---

## 1. Executive Summary

This investigation analyzed all React Query usage, caching configurations, query key structures, and mutation workflows across `src/hooks/`, `src/providers/`, `src/components/`, `src/lib/`, and `src/app/`.

### Key Findings:
1. **Infrastructure Gap**: `src/lib/queryClient.ts` does not exist. `QueryClient` is created inline in `src/providers/ReactQueryProvider.tsx` using `useState`. This prevents helper modules or outside utility functions from accessing `queryClient` or using a single source of truth for query configuration and key management.
2. **Broken Optimistic UI Rollbacks**:
   - In `useCancelBooking` (`src/hooks/useBookings.ts`), `queryClient.getQueryData(['userBookings'])` returns `undefined` because the query key registered by `useUserBookings` is `['userBookings', userId]`. On mutation error, `context.previousBookings` is `undefined`, causing `setQueriesData` to wipe out the cached bookings on error.
   - In `useJoinMatch` and `useLeaveMatch` (`src/hooks/useMatches.ts`), `onError` passes `context.previousMatches` into `setQueriesData({ queryKey: ['publicMatches'] }, ...)`, which overwrites any queries matching prefix `['publicMatches']` with a flat array snapshot.
3. **Query Key Inconsistencies & Collisions**:
   - Key fragmentation exists across pages. For example, pitches are queried as `['pitches']` in `usePitches.ts` & `home/page.tsx`, `['pitches_dict']` in `matches/page.tsx` & `profile/page.tsx`, and `['featured_pitches']` in `FeaturedStadiums.tsx`.
   - Owner dashboard queries use string literals `['owner_bookings']`, `['owner_pitches']`, `['owner_users']`.
4. **Bypassed React Query & Missing Optimistic Mutations**:
   - `NotificationBell.tsx` uses direct Firestore `onSnapshot` and raw `updateDoc`/`writeBatch` calls without React Query or optimistic UI.
   - `FloatingChatWidget.tsx` (Support) uses direct `onSnapshot` and raw `addDoc`/`updateDoc` without optimistic message rendering or error rollback.
   - `MatchChat.tsx` uses direct RTDB `onValue` and `push` without optimistic UI.
   - User role promotions & blacklisting in `owner/users/page.tsx` and `admin/components/PlayersList.tsx` use direct `updateDoc`/`deleteDoc` without React Query mutations or optimistic UI.
   - Booking creation & receipt submission in `src/lib/firebase/booking.ts` and `checkout/page.tsx` are unmanaged by React Query hooks.

---

## 2. Comprehensive Codebase Audit

### 2.1 Provider & Query Client (`src/providers/ReactQueryProvider.tsx`)
```tsx
// Current implementation in ReactQueryProvider.tsx
export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  ...
}
```
* **Observation**: `QueryClient` defaults to 5-minute `staleTime` globally.
* **Evaluation**: A 5-minute `staleTime` is suitable for static pitch details, but dangerous for real-time/rapidly changing state like match availability (`numPeople`, `joinedPlayers`), unread notifications count, or support chat tickets.
* **Recommendation**: Move `QueryClient` instantiation to a dedicated `src/lib/queryClient.ts` module with granular default options per domain.

---

### 2.2 Hooks Analysis (`src/hooks/`)

#### 1. `src/hooks/useBookings.ts`
* **Current Implementation**:
  ```ts
  export function useUserBookings(userId?: string) {
    return useQuery({
      queryKey: ['userBookings', userId],
      queryFn: async (): Promise<Booking[]> => { ... },
      enabled: !!userId,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      networkMode: 'offlineFirst',
    });
  }

  export function useCancelBooking() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ bookingId }: { bookingId: string }) => { ... },
      onMutate: async ({ bookingId }) => {
        await queryClient.cancelQueries({ queryKey: ['userBookings'] });
        const previousBookings = queryClient.getQueryData(['userBookings']); // ❌ Returns undefined!
        queryClient.setQueriesData({ queryKey: ['userBookings'] }, (old: any) => { ... });
        return { previousBookings };
      },
      onError: (err, newTodo, context) => {
        if (context?.previousBookings) {
          queryClient.setQueriesData({ queryKey: ['userBookings'] }, context.previousBookings); // ❌ Wipes out cache!
        }
      },
      ...
    });
  }
  ```
* **Bug Details**:
  - `getQueryData(['userBookings'])` checks for an exact match of key `['userBookings']`. Because `useUserBookings` uses `['userBookings', userId]`, exact lookup returns `undefined`.
  - On mutation failure, `onError` receives `context.previousBookings` as `undefined` and sets `setQueriesData({ queryKey: ['userBookings'] }, undefined)`, corrupting the query cache.
* **Missing Capabilities**: `useCreateBooking`, `useSubmitReceipt`, `useConfirmBooking`, `useRejectBooking`.

#### 2. `src/hooks/useMatches.ts`
* **Current Implementation**:
  ```ts
  export function usePublicMatches() {
    return useQuery({
      queryKey: ['publicMatches'],
      queryFn: async (): Promise<Booking[]> => { ... },
      staleTime: 1000 * 30, // 30s
      gcTime: 1000 * 60 * 10,
      networkMode: 'offlineFirst',
    });
  }

  export function useJoinMatch() { ... }
  export function useLeaveMatch() { ... }
  ```
* **Defect Analysis**:
  - Both `useJoinMatch` and `useLeaveMatch` optimistically mutate `['publicMatches']`. However, if a user views a specific match page or modal with `['matches', matchId]`, that query is not updated.
  - `onError` calls `setQueriesData({ queryKey: ['publicMatches'] }, context.previousMatches)`, which causes issues if parameterized variants of `publicMatches` exist.
* **Missing Capabilities**: `useMatch(matchId)` hook for individual match details and single-match optimistic updates.

#### 3. `src/hooks/usePitches.ts`
* **Current Implementation**:
  ```ts
  export function usePitches() {
    return useQuery({
      queryKey: ['pitches'],
      queryFn: async (): Promise<Pitch[]> => { ... },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60,
      networkMode: 'offlineFirst',
    });
  }
  ```
* **Defect Analysis**: `matches/page.tsx` and `profile/page.tsx` bypass `usePitches()` and create duplicate queries under key `['pitches_dict']`. `FeaturedStadiums.tsx` creates a duplicate query under `['featured_pitches']`.
* **Missing Capabilities**: `usePitch(pitchId)` for fetching a single pitch by ID.

---

### 2.3 Bypassed React Query Components

| Component / File | Current Logic | Recommended React Query Integration |
|---|---|---|
| `src/components/NotificationBell.tsx` | Direct `onSnapshot` + raw `updateDoc`/`writeBatch` | Create `useNotifications(userId)`, `useMarkNotificationAsRead()`, `useMarkAllNotificationsAsRead()` with optimistic unread count & read flag updates. |
| `src/components/FloatingChatWidget.tsx` (Support) | Direct `onSnapshot` + raw `addDoc`/`updateDoc` | Create `useSupportTickets(userId)`, `useSupportMessages(ticketId)`, `useSendSupportMessage()` with optimistic message insertion. |
| `src/components/MatchChat.tsx` | Direct RTDB `onValue` + `push` | Create `useMatchMessages(matchId)`, `useSendMatchMessage(matchId)` with optimistic message append. |
| `src/app/[locale]/owner/users/page.tsx` & `PlayersList.tsx` | Direct `onSnapshot` + raw `updateDoc`/`deleteDoc` | Create `useUsers()`, `useUpdateUserRole()`, `useToggleBlacklist()` with optimistic status badges and role state. |
| `src/app/[locale]/checkout/page.tsx` | Direct call to `lockSlot` & `submitReceipt` | Create `useLockSlotMutation()`, `useSubmitReceiptMutation()` with optimistic booking cache population. |

---

## 3. Cache Options & Strategy Evaluation

| Domain | Recommended `staleTime` | Recommended `gcTime` | Rationale |
|---|---|---|---|
| **Pitches List & Detail** | `10 minutes` (600,000 ms) | `2 hours` | Pitch details (name, address, surface, photos) change infrequently. High staleTime minimizes Firestore read costs. |
| **Public Matches** | `15 seconds` (15,000 ms) | `15 minutes` | Match slots fill up rapidly. Low staleTime ensures players see accurate open slots. |
| **User Bookings** | `1 minute` (60,000 ms) | `30 minutes` | User's own bookings change on booking/cancellation. |
| **User Notifications** | `30 seconds` (30,000 ms) | `15 minutes` | Notification badges require near real-time updates. |
| **Support Tickets & Messages** | `0 seconds` (Realtime / 5s) | `10 minutes` | Chat messages require immediate updates when open. |
| **Users & Roles (Admin/Owner)** | `2 minutes` (120,000 ms) | `30 minutes` | User administrative data changes moderately. |

---

## 4. Query Key Factory Architecture (`queryKeys`)

To prevent key typos, ensure type-safety, and allow hierarchical cache invalidation (e.g. invalidating all match queries with `queryClient.invalidateQueries({ queryKey: queryKeys.matches.all })`), we establish a central Query Key Factory.

```ts
// src/lib/queryKeys.ts
export const queryKeys = {
  pitches: {
    all: ['pitches'] as const,
    lists: () => [...queryKeys.pitches.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.pitches.lists(), { filters }] as const,
    details: () => [...queryKeys.pitches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pitches.details(), id] as const,
    dictionary: () => [...queryKeys.pitches.all, 'dictionary'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    byUser: (userId?: string) => [...queryKeys.bookings.lists(), { userId }] as const,
    byOwner: (ownerId?: string) => [...queryKeys.bookings.lists(), { ownerId }] as const,
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
  },
  matches: {
    all: ['matches'] as const,
    public: () => [...queryKeys.matches.all, 'public'] as const,
    details: () => [...queryKeys.matches.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.matches.details(), id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    byUser: (userId?: string) => [...queryKeys.notifications.all, userId] as const,
  },
  support: {
    all: ['support'] as const,
    tickets: (userId?: string) => [...queryKeys.support.all, 'tickets', userId] as const,
    messages: (ticketId: string) => [...queryKeys.support.all, 'messages', ticketId] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
};
```

---

## 5. Precise Implementation Recommendations & Refactored Patterns

### 5.1 `src/lib/queryClient.ts`
Create `src/lib/queryClient.ts` as the central initialization file:

```ts
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
```

---

### 5.2 Refactored `src/hooks/useBookings.ts`
Fix exact key lookup bug, implement full optimistic rollback, and add `useCreateBooking`:

```ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Booking } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

export function useUserBookings(userId?: string) {
  return useQuery({
    queryKey: queryKeys.bookings.byUser(userId),
    queryFn: async (): Promise<Booking[]> => {
      if (!userId) return [];
      const q = query(collection(db, 'bookings'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      return bookings.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 15,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: string }) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    },
    onMutate: async ({ bookingId }) => {
      // Cancel queries across all booking lists
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all });

      // Save snapshots of matching queries for robust rollback
      const previousQueries = queryClient.getQueriesData<Booking[]>({
        queryKey: queryKeys.bookings.lists(),
      });

      // Optimistically update all matching queries
      queryClient.setQueriesData<Booking[]>(
        { queryKey: queryKeys.bookings.lists() },
        (old) => {
          if (!old) return [];
          return old.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          );
        }
      );

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Restore cached state for each query modified
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}
```

---

### 5.3 Refactored `src/hooks/useMatches.ts`
Fix optimistic UI updates for both list (`publicMatches`) and detail (`matchId`) views:

```ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Booking } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

export function usePublicMatches() {
  return useQuery({
    queryKey: queryKeys.matches.public(),
    queryFn: async (): Promise<Booking[]> => {
      const q = query(
        collection(db, 'bookings'),
        where('bookingType', '==', 'public'),
        where('status', '==', 'confirmed')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    },
    staleTime: 1000 * 15, // 15 seconds fresh
    gcTime: 1000 * 60 * 10,
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
        const joinedPlayers = (data.joinedPlayers || []) as any[];
        const alreadyJoined = joinedPlayers.some(p => (typeof p === 'string' ? p === userId : p.uid === userId));
        if (alreadyJoined) return;

        if (joinedPlayers.length >= (data.numPeople || 10)) {
          throw new Error('Match is full');
        }

        const newPlayer = { uid: userId, name: userName || 'Player', joinedAt: Date.now() };
        transaction.update(bookingRef, {
          joinedPlayers: [...joinedPlayers, newPlayer],
        });
      });
    },
    onMutate: async ({ bookingId, userId, userName }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.all });

      const previousMatches = queryClient.getQueryData<Booking[]>(queryKeys.matches.public());
      const previousMatchDetail = queryClient.getQueryData<Booking>(queryKeys.matches.detail(bookingId));

      const newPlayer = { uid: userId, name: userName || 'Player' };

      // 1. Update public matches list optimistically
      queryClient.setQueryData<Booking[]>(queryKeys.matches.public(), (old) => {
        if (!old) return [];
        return old.map((m) => {
          if (m.id === bookingId) {
            const joined = m.joinedPlayers || [];
            return { ...m, joinedPlayers: [...joined, newPlayer] };
          }
          return m;
        });
      });

      // 2. Update single match detail optimistically
      if (previousMatchDetail) {
        queryClient.setQueryData<Booking>(queryKeys.matches.detail(bookingId), {
          ...previousMatchDetail,
          joinedPlayers: [...(previousMatchDetail.joinedPlayers || []), newPlayer],
        });
      }

      return { previousMatches, previousMatchDetail };
    },
    onError: (err, vars, context) => {
      if (context?.previousMatches) {
        queryClient.setQueryData(queryKeys.matches.public(), context.previousMatches);
      }
      if (context?.previousMatchDetail) {
        queryClient.setQueryData(queryKeys.matches.detail(vars.bookingId), context.previousMatchDetail);
      }
    },
    onSettled: (data, err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
```

---

### 5.4 Proposed `src/hooks/useNotifications.ts`
Provide a dedicated React Query hook to replace raw Firestore snapshots and offer optimistic read toggling in `NotificationBell.tsx`:

```ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { queryKeys } from '@/lib/queryKeys';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  type: string;
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.byUser(userId),
    queryFn: async (): Promise<Notification[]> => {
      if (!userId) return [];
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      return notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30s
  });
}

export function useMarkNotificationAsRead(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    },
    onMutate: async (id: string) => {
      const key = queryKeys.notifications.byUser(userId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Notification[]>(key);

      queryClient.setQueryData<Notification[]>(key, (old) => {
        if (!old) return [];
        return old.map(n => n.id === id ? { ...n, read: true } : n);
      });

      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous && userId) {
        queryClient.setQueryData(queryKeys.notifications.byUser(userId), context.previous);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(userId) });
      }
    },
  });
}
```

---

### 5.5 Proposed `src/hooks/useUserRoles.ts`
Provide custom hooks for user role updates and blacklisting in admin/owner panels:

```ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User as AppUser } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async (): Promise<AppUser[]> => {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => d.data() as AppUser);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppUser['role'] }) => {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    },
    onMutate: async ({ userId, newRole }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.list() });
      const previousUsers = queryClient.getQueryData<AppUser[]>(queryKeys.users.list());

      queryClient.setQueryData<AppUser[]>(queryKeys.users.list(), (old) => {
        if (!old) return [];
        return old.map(u => u.uid === userId ? { ...u, role: newRole } : u);
      });

      return { previousUsers };
    },
    onError: (err, vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.list(), context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}

export function useToggleBlacklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isBlacklisted }: { userId: string; isBlacklisted: boolean }) => {
      await updateDoc(doc(db, 'users', userId), { isBlacklisted });
    },
    onMutate: async ({ userId, isBlacklisted }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.list() });
      const previousUsers = queryClient.getQueryData<AppUser[]>(queryKeys.users.list());

      queryClient.setQueryData<AppUser[]>(queryKeys.users.list(), (old) => {
        if (!old) return [];
        return old.map(u => u.uid === userId ? { ...u, isBlacklisted } : u);
      });

      return { previousUsers };
    },
    onError: (err, vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.list(), context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
    },
  });
}
```

---

## 6. Summary of Action Plan for Implementation Phase

1. **Create `src/lib/queryClient.ts` & `src/lib/queryKeys.ts`**:
   - Establish central QueryClient setup and standardized `queryKeys` factory.
2. **Update `src/providers/ReactQueryProvider.tsx`**:
   - Import `queryClient` from `src/lib/queryClient`.
3. **Refactor Existing Custom Hooks**:
   - Fix exact key lookup & rollback logic in `src/hooks/useBookings.ts`.
   - Update `src/hooks/useMatches.ts` to use `queryKeys` and support single match detail updates.
   - Refactor `src/hooks/usePitches.ts` and eliminate inline pitch queries in `home/page.tsx`, `matches/page.tsx`, `profile/page.tsx`, and `FeaturedStadiums.tsx`.
4. **Create New Custom Hooks**:
   - `src/hooks/useNotifications.ts` (with optimistic updates for reading notifications).
   - `src/hooks/useSupport.ts` (with optimistic updates for sending support messages).
   - `src/hooks/useUserRoles.ts` (with optimistic updates for user role updates & blacklisting).
5. **Connect UI Components**:
   - Refactor `NotificationBell.tsx`, `FloatingChatWidget.tsx`, `owner/users/page.tsx`, `PlayersList.tsx`, and `checkout/page.tsx` to consume the new React Query hooks.
