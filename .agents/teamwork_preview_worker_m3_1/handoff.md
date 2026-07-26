# Handoff Report — Milestone 3: Backend, Realtime & Firestore Architecture

**Agent**: `teamwork_preview_worker_m3_1`  
**Milestone**: Milestone 3  
**Status**: Completed  
**Timestamp**: 2026-07-26T09:55:00Z  

---

## 1. Observation

Direct observations from source inspection and execution logs:

1. **Firestore Composite Indexes**:
   - `firestore.indexes.json` now defines composite indexes for `bookings` (`userId` + `createdAt`, `pitchId` + `date`, `pitchId` + `status` + `lockedUntil`, `bookingType` + `status` + `date`, `bookingType` + `status` + `createdAt`), `matches` (`status` + `date`, `status` + `createdAt`), and `notifications` (`userId` + `createdAt`).
2. **Lock Expiration Truthiness Bug Fix**:
   - In `src/lib/firebase/booking.ts`: replaced `deleteField()` sentinel object assignments during in-memory lock evaluation with `delete bookedSlots[key]` / `delete slots[slotStr]`. Verified `deleteField()` object values no longer cause truthy evaluation in slot availability checks.
3. **Query Key Synchronization & React Query Refactoring**:
   - `src/hooks/useBookings.ts`: unified query key factory `queryKeys.userBookings.byUser(userId)` and `queryKeys.userBookings.all`. `onMutate` now snapshots and updates queries using `getQueriesData` and `setQueriesData` across all matching keys, preventing cache wipeouts.
   - `src/hooks/usePitches.ts`, `src/hooks/useMatches.ts`, `src/hooks/useNotifications.ts`: updated to enforce `DOMAIN_STALE_TIMES` and unified `queryKeys`.
4. **Presence Tracking Optimization**:
   - In `src/hooks/useOnlinePresence.ts` and new `src/hooks/usePresence.ts`: replaced root listener on `/status` with path-specific listener `/status/${userId}`. Eliminates full RTDB dataset downloads on every user status update.
5. **Booking Status Transitions & Notifications**:
   - Added `COMPLETED` to `BookingStatus` enum (`src/types/index.ts`).
   - Implemented clean transaction transitions for all booking statuses (`locked_temporary` -> `pending_review` -> `confirmed` / `rejected` / `cancelled` / `completed`) in `src/lib/firebase/booking.ts`.
   - Integrated notification creation on booking creation, match joins, match leaves, and cancellations.
   - Updated `firestore.rules` notifications creation policy to permit `request.auth.uid == request.resource.data.senderId`.
6. **Compilation & Build**:
   - `npx tsc --noEmit` executed with 0 errors.
   - `npm run build` executed with 0 errors (33 pages successfully generated).

---

## 2. Logic Chain

1. **Lock Expiration Truthiness Bug**: In JavaScript, `deleteField()` returns an object reference (`FieldValue`). In `if (bookedSlots[key])`, an object evaluates to `true`. By replacing `deleteField()` with `delete bookedSlots[key]` when manipulating local slot maps before transactions, expired slots are cleanly removed from local memory so availability checks proceed correctly.
2. **React Query Key Mismatch**: `useUserBookings` queried `['userBookings', userId]`, but `useCancelBooking` looked up `['userBookings']` directly via `getQueryData`, returning `undefined` and causing rollback to restore `undefined`. By using `getQueriesData({ queryKey: queryKeys.userBookings.all })`, React Query matches all user booking queries fuzzy-prefixed by `['userBookings']`, preserving optimistic state and context rollbacks.
3. **Presence Network Ingress Bottleneck**: Attaching `onValue` to `/status` downloads every online user's state whenever any user connects/disconnects. Replacing root listener with `/status/${userId}` limits RTDB updates strictly to target user paths, avoiding network spikes.
4. **Notification Triggers & Rules Alignment**: Dispatching notifications during Firestore transactions guarantees atomic status changes and notifications. Updating `firestore.rules` for notifications to validate `request.resource.data.senderId == request.auth.uid` permits players joining public matches to send notifications to match creators without hitting `permission-denied`.

---

## 3. Caveats

- **RTDB Deployment**: `database.rules.json` should be deployed via Firebase CLI (`firebase deploy --only database`) to enforce security rules in remote RTDB instances.
- **Firebase Emulator / Live Backend**: Functional verification was executed via static build and TypeScript validation. Runtime integration tests against Firebase Emulator or production Firebase project require valid credentials configured in `.env.local`.

---

## 4. Conclusion

Milestone 3 requirements are fully implemented:
- Firestore indexes configured for all compound queries.
- React Query hooks refactored with proper staleTime, gcTime, unified key factories, and robust optimistic rollbacks.
- Realtime chat and presence tracking optimized to path-specific listeners.
- Booking status transitions and notification triggers fully integrated and verified via clean build.

---

## 5. Verification Method

Independent verification steps:

1. **TypeScript Health**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected Output*: Exit code 0 with 0 errors.

2. **Production Build**:
   ```bash
   npm run build
   ```
   *Expected Output*: Exit code 0, 33 static pages generated.

3. **File Inspection**:
   - Inspect `firestore.indexes.json` for composite index definitions.
   - Inspect `src/lib/firebase/booking.ts` for lock expiration fix and `completeBooking`.
   - Inspect `src/hooks/useBookings.ts` for query key factory usage and optimistic update context.
   - Inspect `src/hooks/usePresence.ts` and `src/hooks/useOnlinePresence.ts` for `/status/${userId}` path listeners.
