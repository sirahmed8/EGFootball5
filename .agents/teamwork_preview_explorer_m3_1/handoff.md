# Handoff Report — Explorer 1 (Milestone 3)

## 1. Observation
Directly observed code inspects and findings across `src/`:

1. **`src/providers/ReactQueryProvider.tsx` (Lines 8-19)**:
   - `QueryClient` is initialized inside `useState` without a centralized `src/lib/queryClient.ts` export:
     ```tsx
     new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 5 * 60 * 1000, // 5 minutes
           gcTime: 10 * 60 * 1000, // 10 minutes
           refetchOnWindowFocus: false,
         },
       },
     })
     ```
2. **`src/hooks/useBookings.ts` (Lines 10 & 36-50)**:
   - Query key registered in `useUserBookings`: `['userBookings', userId]`.
   - Mutation `useCancelBooking` `onMutate`:
     ```ts
     await queryClient.cancelQueries({ queryKey: ['userBookings'] });
     const previousBookings = queryClient.getQueryData(['userBookings']); // Line 37
     ```
   - Exact query key `['userBookings']` does NOT exist in cache because the key has a second argument (`userId`). Therefore `previousBookings` evaluates to `undefined`.
   - `onError`:
     ```ts
     if (context?.previousBookings) {
       queryClient.setQueriesData({ queryKey: ['userBookings'] }, context.previousBookings);
     }
     ```
     Sets matching query caches to `undefined` on mutation error, wiping out cached user bookings.

3. **`src/hooks/useMatches.ts` (Lines 10 & 53-76, 104-127)**:
   - Query key: `['publicMatches']`.
   - `onMutate` in `useJoinMatch` and `useLeaveMatch` optimistically updates `['publicMatches']` array, but does not update single match queries (`['matches', matchId]`).
   - `onError` calls `queryClient.setQueriesData({ queryKey: ['publicMatches'] }, context.previousMatches)`, overwriting any query matching prefix `['publicMatches']` with a single snapshot array.

4. **Query Key Fragmentation**:
   - `src/hooks/usePitches.ts`: `['pitches']`
   - `src/app/[locale]/home/page.tsx`: inline `useQuery` under `['pitches']`
   - `src/app/[locale]/matches/page.tsx`: inline `useQuery` under `['pitches_dict']`
   - `src/app/[locale]/profile/page.tsx`: inline `useQuery` under `['pitches_dict']`
   - `src/components/FeaturedStadiums.tsx`: inline `useQuery` under `['featured_pitches']`
   - `src/app/[locale]/owner/dashboard/page.tsx`: inline `useQuery` under `['owner_bookings']`, `['owner_pitches']`, `['owner_users']`.

5. **Bypassed React Query Components**:
   - `src/components/NotificationBell.tsx`: Direct `onSnapshot` + `updateDoc`/`writeBatch`. No React Query or optimistic UI.
   - `src/components/FloatingChatWidget.tsx` (Support): Direct `onSnapshot` + `addDoc`/`updateDoc`. No React Query or optimistic UI.
   - `src/components/MatchChat.tsx`: Direct RTDB `onValue` + `push`. No React Query or optimistic UI.
   - `src/app/[locale]/owner/users/page.tsx` & `PlayersList.tsx`: Direct `updateDoc`/`deleteDoc`. No React Query or optimistic UI.

---

## 2. Logic Chain
1. **Observation 1 & 4** show that query keys are scattered as raw string literals across pages and hooks (`'pitches'`, `'pitches_dict'`, `'userBookings'`, `'owner_bookings'`), leading to cache collisions, redundant network requests, and inability to perform hierarchical invalidation.
   * *Inference*: A centralized Query Key Factory (`queryKeys`) and dedicated `src/lib/queryClient.ts` module are required to enforce consistency and enable clean invalidation patterns.
2. **Observation 2** shows that `queryClient.getQueryData(['userBookings'])` fails to retrieve `['userBookings', userId]` snapshot, resulting in `undefined` context on rollback.
   * *Inference*: `useCancelBooking` current implementation breaks cache integrity on error. Using `getQueriesData` with prefix query key matching or exact key lookup is required for safe rollback.
3. **Observation 3** shows that match mutations only update the public list cache, neglecting match detail queries (`['matches', matchId]`), and `setQueriesData` in `onError` pollutes non-exact queries.
   * *Inference*: `useJoinMatch` and `useLeaveMatch` must update both list and detail query keys optimistically and restore exact target queries on error.
4. **Observation 5** shows that major user interaction flows (marking notifications as read, sending support messages, updating user roles and blacklist status) bypass TanStack React Query completely.
   * *Inference*: Creating missing custom hooks (`useNotifications.ts`, `useSupport.ts`, `useUserRoles.ts`) with optimistic mutations will ensure instant UI feedback, offline resilience, and consistent cache invalidation.

---

## 3. Caveats
- Realtime subscriptions (Firebase `onSnapshot` / RTDB `onValue`) can be paired with TanStack React Query by updating query cache data inside subscription callbacks or using `useQuery` for initial load + snapshot sync.
- Offline resilience depends on TanStack React Query `networkMode: 'offlineFirst'` and Firestore offline persistence settings.

---

## 4. Conclusion
The current React Query setup requires structural refactoring to achieve production-ready caching, type-safe query keys, and bug-free optimistic updates.
By implementing:
1. `src/lib/queryClient.ts` and `src/lib/queryKeys.ts`
2. Refactored `useBookings.ts`, `useMatches.ts`, and `usePitches.ts`
3. New custom hooks (`useNotifications.ts`, `useSupport.ts`, `useUserRoles.ts`)
the application will eliminate cache corruption, eliminate redundant queries, and provide instant, optimistic UI feedback across all key user interactions.

---

## 5. Verification Method
1. Inspect `analysis.md` in `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_1\analysis.md`.
2. Verify code references and line numbers in:
   - `src/providers/ReactQueryProvider.tsx`
   - `src/hooks/useBookings.ts`
   - `src/hooks/useMatches.ts`
   - `src/hooks/usePitches.ts`
   - `src/components/NotificationBell.tsx`
   - `src/components/FloatingChatWidget.tsx`
   - `src/app/[locale]/owner/users/page.tsx`
3. Confirm that all proposed TanStack React Query patterns include `onMutate`, `onError` (rollback), `onSettled` (invalidation), and type-safe `queryKeys`.
