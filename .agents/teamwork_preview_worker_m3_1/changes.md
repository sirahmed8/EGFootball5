# Changes Summary - Milestone 3 Implementation

## Overview
Implemented Backend, Realtime & Firestore Architecture for EGFootball5 (`kickoff`).

## Modified & Added Files

### 1. `firestore.indexes.json`
- **Changes**: Added composite index definitions for Firestore queries:
  - `bookings`: `userId` + `createdAt` (DESC), `pitchId` + `date` (ASC), `pitchId` + `status` + `lockedUntil`, `bookingType` + `status` + `date`, `bookingType` + `status` + `createdAt` (DESC).
  - `matches`: `status` + `date` (ASC), `status` + `createdAt` (DESC).
  - `notifications`: `userId` + `createdAt` (DESC).
- **Purpose**: Eliminates unindexed query execution errors in Firestore.

### 2. `firestore.rules`
- **Changes**: Updated `notifications` creation security rule to allow creation when `request.auth.uid == request.resource.data.userId` OR `request.auth.uid == request.resource.data.senderId` (e.g. match join/leave notifications sent to match creator).
- **Purpose**: Prevents permission-denied security rule exceptions when players trigger cross-user notification events.

### 3. `src/types/index.ts`
- **Changes**: Added `COMPLETED = 'completed'` to `BookingStatus` enum.
- **Purpose**: Supports complete lifecycle status transitions (`locked_temporary` -> `pending_review` -> `confirmed` / `rejected` / `cancelled` / `completed`).

### 4. `src/lib/firebase/booking.ts`
- **Changes**:
  - Fixed lock expiration logic: replaced `deleteField()` sentinel object assignments with `delete bookedSlots[key]` / `delete slots[slotStr]` to eliminate truthiness evaluation bug where expired slots evaluated as taken.
  - Added clean transaction status transitions (`lockSlot`, `submitReceipt`, `confirmBooking`, `rejectBooking`, `cancelBooking`, and new `completeBooking`).
  - Integrated notification triggers across booking operations (`booking_created`, `booking_confirmed`, `booking_rejected`, `booking_cancelled`, `booking_completed`).
- **Purpose**: Ensures transactional safety, correct slot availability checks, and automatic notification dispatch.

### 5. `src/hooks/useBookings.ts`
- **Changes**:
  - Resolved query key mismatch between `['userBookings']` and `['userBookings', userId]`.
  - Updated `useCancelBooking` optimistic mutation and rollback context to target both `userBookings.all` and `userBookings.byUser(userId)`.
  - Added `useCompleteBooking` mutation hook.
  - Enforced `staleTime: DOMAIN_STALE_TIMES.userBookings` and `gcTime: 10 * 60 * 1000`.
- **Purpose**: Guarantees cache consistency and reliable UI updates/rollbacks.

### 6. `src/hooks/usePitches.ts`
- **Changes**: Enforced `queryKeys.pitches.all` and `queryKeys.pitches.detail(id)`, with `staleTime: DOMAIN_STALE_TIMES.pitches` (5 minutes) and `gcTime: 1000 * 60 * 60` (1 hour).
- **Purpose**: Optimizes pitch query caching.

### 7. `src/hooks/useMatches.ts`
- **Changes**:
  - Updated `useJoinMatch` and `useLeaveMatch` mutations to dispatch transaction notifications (`match_joined`, `match_left`) to match creators.
  - Aligned query key invalidations (`queryKeys.matches.public`, `queryKeys.matches.detail`, `userBookings.all`, `notifications.all`).
  - Enforced `staleTime: DOMAIN_STALE_TIMES.matches` and `gcTime: 10 * 60 * 1000`.
- **Purpose**: Enhances match lobby real-time coordination and notifications.

### 8. `src/hooks/useNotifications.ts`
- **Changes**:
  - Updated `useNotifications` to fetch ordered notifications using `orderBy('createdAt', 'desc')`.
  - Enforced `staleTime: DOMAIN_STALE_TIMES.notifications` and `gcTime: 5 * 60 * 1000`.
  - Aligned optimistic updates and cache invalidation.
- **Purpose**: Provides clean, ordered notification feeds.

### 9. `src/hooks/usePresence.ts` (New) & `src/hooks/useOnlinePresence.ts`
- **Changes**:
  - Created `usePresence(userId)` to listen directly to path `/status/${userId}`.
  - Refactored `useOnlinePresence` to replace root `/status` listener with user-specific path listener (`/status/${userId}`).
- **Purpose**: Eliminates downloading all user presence nodes across the network, reducing ingress bandwidth and client overhead.

### 10. `src/components/PresenceIndicator.tsx`
- **Changes**: Updated component to handle user online presence state.
- **Purpose**: Renders online status indicator cleanly.

## Build & Test Verification
- `npx tsc --noEmit`: Clean compilation with **0 errors**.
- `npm run build`: Production build completed with **0 errors** (33 static pages generated).
