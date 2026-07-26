## 2026-07-26T09:50:13Z
You are Worker M3 for EGFootball5 100x Overhaul — Milestone 3 (Backend, Realtime & Firestore Architecture).
Your working directory is `d:\football\kickoff\.agents\teamwork_preview_worker_m3_1`.
Please create your directory and write your `progress.md` liveness heartbeat and report `handoff.md` inside your working directory.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective is to implement, test, and verify all Backend, Realtime & Firestore Architecture upgrades for Milestone 3 across `d:\football\kickoff`.

### Task Checklist:

1. **Infrastructure & Query Setup**:
   - Create `src/lib/queryClient.ts` with central `QueryClient` defaults (offlineFirst mode, domain staleTimes).
   - Create `src/lib/queryKeys.ts` with central Query Key Factory (`queryKeys`).
   - Update `src/providers/ReactQueryProvider.tsx` to import `queryClient` from `@/lib/queryClient`.

2. **Booking State Machine & In-Memory Logic Fixes**:
   - Update `src/types/index.ts`: Add `CANCELLED = 'cancelled'` to `BookingStatus` enum.
   - Update `src/lib/firebase/booking.ts`:
     - Fix `lockSlot()` in-memory slot deletion bug where `deleteField()` sentinels were assigned to local objects causing `if (bookedSlots[key])` to evaluate as truthy. Replace with `delete bookedSlots[key]` for in-memory cleanup.
     - Update `cancelBooking()` to support user self-cancellation setting `status: BookingStatus.CANCELLED`.

3. **React Query Hooks & Optimistic UI Refactoring**:
   - Refactor `src/hooks/useBookings.ts`: Fix exact query key lookup bug in `useCancelBooking`, integrate `cancelBooking()` transaction, implement full optimistic state rollback with query snapshots, add `useCreateBooking` & `useSubmitReceipt`.
   - Refactor `src/hooks/useMatches.ts`: Use `queryKeys`, support both list (`publicMatches`) and detail (`matchId`) queries in `useJoinMatch` and `useLeaveMatch` with optimistic UI updates and proper rollback.
   - Refactor `src/hooks/usePitches.ts`: Standardize query keys via `queryKeys`, add `usePitch(pitchId)`.
   - Create `src/hooks/useNotifications.ts`: Provide `useNotifications(userId)`, `useMarkNotificationAsRead()`, `useMarkAllNotificationsAsRead()` with optimistic UI updates.
   - Create `src/hooks/useChat.ts`: Provide `useMatchChat(matchId)` hook for RTDB match messages, optimistic message sending with input text restoration on error, typing indicator support, and pagination.
   - Create `src/hooks/useUserRoles.ts`: Provide `useUsers()`, `useUpdateUserRole()`, `useToggleBlacklist()` with optimistic UI for admin/owner dashboards.
   - Refactor `src/hooks/useOnlinePresence.ts` and `src/components/PresenceIndicator.tsx`: Standardize on `/status/$uid` path in RTDB, fix reference closures, support presence count.

4. **UI Component Integration**:
   - Refactor `src/components/NotificationBell.tsx` to use `useNotifications`.
   - Refactor `src/components/MatchChat.tsx` to use `useMatchChat`.
   - Refactor `src/app/[locale]/owner/users/page.tsx` & `src/components/admin/PlayersList.tsx` to use `useUserRoles`.
   - Refactor `src/components/FloatingChatWidget.tsx` (Support) to use optimistic updates.

5. **Security Rules & Indexes Alignment**:
   - Update `firestore.indexes.json`: Add required composite indexes for `bookings` and `notifications`.
   - Update `firestore.rules`: Relax totalAmount strict equality to allow promo code discounts and add-ons (`totalAmount > 0`, `depositAmount >= 0`), permit `'cancelled'` status, validate `joinedPlayers` mutations.
   - Update `database.rules.json`: Add `.indexOn: ["timestamp"]` for `chats/$matchId/messages`, enforce sender ID and string validation.

6. **Build & Type Verification**:
   - Run `npx tsc --noEmit` and ensure 0 TypeScript errors.
   - Run `npm run build` and ensure Next.js production build completes successfully.

Write full details of your changes, code modifications, and build outputs in `d:\football\kickoff\.agents\teamwork_preview_worker_m3_1\handoff.md`.
Communicate back when done.
