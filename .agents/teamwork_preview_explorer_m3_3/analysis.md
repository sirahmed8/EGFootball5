# Comprehensive Analysis: Booking State Machine, Slot Locking, Firestore Indexes & Security Rules

**Target Directory**: `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_3`  
**Explorer**: Explorer 3 (Milestone 3 — Backend, Realtime & Firestore Architecture)  
**Date**: 2026-07-26  

---

## Executive Summary

This report delivers an end-to-end technical evaluation of KickOff's backend booking state machine, slot locking mechanism, Firestore composite indexes, and Firebase security rules (`firestore.rules` & `database.rules.json`). 

Our investigation uncovered **5 critical architectural bugs & security/rule mismatches** that impact system reliability and security:
1. **Memory Evaluation Bug in `lockSlot`**: `deleteField()` sentinel objects are assigned to expired slots in memory during transaction execution, but JavaScript boolean evaluation checks `if (bookedSlots[slotStr])`, which treats `deleteField()` objects as truthy. This causes `lockSlot` to fail with `ERROR_SLOT_TAKEN` even when slots are expired.
2. **Bypassed Transaction & Slot Leak in `useCancelBooking`**: `src/hooks/useBookings.ts` updates booking documents directly to `cancelled` via `updateDoc()`, bypassing the atomic transaction in `src/lib/firebase/booking.ts`, leaving `day_schedules` locked indefinitely, and violating Firestore security rules.
3. **Missing Index Failure in `cleanupExpiredBookings`**: `cleanupExpiredBookings()` executes a complex inequality query (`pitchId == pitchId`, `status == 'locked_temporary'`, `lockedUntil < now`) without a corresponding composite index in `firestore.indexes.json`, leading to runtime query failures.
4. **Security Rule Pricing Mismatch**: `firestore.rules` strictly checks `totalAmount == pricePerHour * duration` during booking creation, causing booking creation to fail whenever promo discounts or add-ons (referee, bibs, drinks) are applied.
5. **Overly Permissive Realtime DB Chat Rules**: `database.rules.json` uses `.write: "auth != null"` at the root of `chats/{matchId}`, allowing any authenticated user to wipe or delete entire chat rooms.

---

## 1. Booking State Machine & Slot Locking Architecture

### 1.1 State Machine Transition Audit

The booking lifecycle supports five primary states across `BookingStatus`:

```
                 ┌──────────────────┐
                 │ LOCKED_TEMPORARY │ (10-minute temporary lock)
                 └────────┬─────────┘
                          │
          ┌───────────────┼───────────────┐
          │ (Submit       │ (User         │ (Lock
          ▼  Receipt)     ▼  Cancel)      ▼  Expires)
  ┌────────────────┐ ┌───────────┐ ┌─────────────┐
  │ PENDING_REVIEW │ │ CANCELLED │ │   EXPIRED   │ (Cleaned up from
  └───────┬────────┘ └───────────┘ └─────────────┘  day_schedules)
          │
      ┌───┴───┐
      │       │
      ▼       ▼
┌───────────┐ ┌──────────┐
│ CONFIRMED │ │ REJECTED │
└───────────┘ └──────────┘
```

#### Identified State Discrepancies & Deficiencies:
1. **Enum Omission**: `BookingStatus` in `src/types/index.ts` is missing `CANCELLED = 'cancelled'`.
   ```typescript
   // src/types/index.ts (Lines 50-55)
   export enum BookingStatus {
     LOCKED_TEMPORARY = 'locked_temporary',
     PENDING_REVIEW = 'pending_review',
     CONFIRMED = 'confirmed',
     REJECTED = 'rejected',
     // MISSING: CANCELLED = 'cancelled'
   }
   ```
2. **Inconsistent Cancellation Handling**:
   - `cancelBooking()` in `src/lib/firebase/booking.ts:309` sets `status: BookingStatus.REJECTED` (`'rejected'`), blurring the distinction between admin rejection and player self-cancellation.
   - `useCancelBooking()` in `src/hooks/useBookings.ts:30` sets `status: 'cancelled'`, bypassing `cancelBooking()` in `booking.ts` completely!

### 1.2 Slot Locking & Atomic Transaction Logic

#### Memory Mutation Bug in `lockSlot()` (`src/lib/firebase/booking.ts` lines 69-82):
```typescript
// Current Code in booking.ts:
for (const key in bookedSlots) {
  const slot = bookedSlots[key];
  if (slot.status === BookingStatus.LOCKED_TEMPORARY && slot.lockedUntil && slot.lockedUntil < now) {
    // BUG: Assigning deleteField() to a local memory object
    bookedSlots[key] = deleteField() as any;
  }
}

// 1. Check Availability
for (const block of blocks) {
  // BUG: In JS, deleteField() object evaluates to TRUTHY!
  if (bookedSlots[block.toString()]) {
    throw new Error('ERROR_SLOT_TAKEN');
  }
}
```
**Impact**: When an expired lock is encountered, `bookedSlots[key]` is assigned `FieldValue` sentinel object. In JS, `if (bookedSlots[block.toString()])` evaluates to `true` because objects are truthy. As a result, expired slots are incorrectly reported as taken, throwing `ERROR_SLOT_TAKEN`.

**Recommended Fix**:
Use standard JavaScript `delete bookedSlots[key]` for in-memory checks, and build a clean `slotsToUpdate` object or rely on atomic transaction overwrite.

#### Refactored `lockSlot` snippet:
```typescript
// Corrected in-memory cleanup:
for (const key of Object.keys(bookedSlots)) {
  const slot = bookedSlots[key];
  if (slot && slot.status === BookingStatus.LOCKED_TEMPORARY && slot.lockedUntil && slot.lockedUntil < now) {
    delete bookedSlots[key];
  }
}
```

### 1.3 Anti-Gap Validation

`lockSlot()` enforces rules against leaving 30-minute dead gaps before or after booked slots:
- **Before Check**: Prevents leaving a single 30-min gap after another booking or opening hour.
- **After Check**: Prevents leaving a single 30-min gap before another booking or closing hour.

Because `deleteField()` previously left truthy objects in `bookedSlots`, anti-gap logic also generated false positives (`ERROR_GAP_BEFORE` / `ERROR_GAP_AFTER`). Cleaning up `bookedSlots` with `delete bookedSlots[key]` restores accurate anti-gap evaluation.

### 1.4 Auto-Expiration & Cleanup Routine (`cleanupExpiredBookings`)

`cleanupExpiredBookings` in `src/lib/firebase/booking.ts:337` scans for expired locks:
```typescript
const q = query(
  bookingsRef,
  where('pitchId', '==', pitchId),
  where('status', '==', BookingStatus.LOCKED_TEMPORARY),
  where('lockedUntil', '<', now)
);
```

#### Deficiencies Identified:
1. **Missing Composite Index**: Throws a Firestore index error unless index `(pitchId ASC, status ASC, lockedUntil ASC)` is declared in `firestore.indexes.json`.
2. **Security Rules Restriction**: Non-admin users calling `cleanupExpiredBookings()` trigger `transaction.delete(bookingDoc.ref)`, which is blocked by `firestore.rules` line 99 (`allow delete: if isAdmin();`).

---

## 2. Firestore Composite Index Inspection (`firestore.indexes.json`)

### 2.1 Current State Analysis
`firestore.indexes.json` contains only a single composite index:
```json
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bookingType", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 2.2 Missing Composite Indexes

| Collection | Fields & Sort Order | Query Purpose | Priority |
|------------|---------------------|---------------|----------|
| `bookings` | `pitchId` ASC, `status` ASC, `lockedUntil` ASC | `cleanupExpiredBookings()` query | **CRITICAL** |
| `bookings` | `pitchId` ASC, `status` ASC, `date` ASC | Admin/Owner dashboard schedule filtering | **HIGH** |
| `bookings` | `bookingType` ASC, `status` ASC, `date` ASC, `timeSlot` ASC | Public match discovery & lobby listings | **HIGH** |
| `bookings` | `userId` ASC, `createdAt` DESC | Player profile booking history | **MEDIUM** |
| `notifications` | `userId` ASC, `createdAt` DESC | Player notification bell stream | **MEDIUM** |

### 2.3 Proposed `firestore.indexes.json` Definition

```json
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bookingType", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "pitchId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "lockedUntil", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "pitchId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bookingType", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "timeSlot", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 3. Firestore & Realtime DB Security Rules Alignment

### 3.1 `firestore.rules` Mismatches & Vulnerabilities

#### Mismatch 1: Strict Total Amount Equality Blocks Promo Codes & Addons
- **Location**: `firestore.rules` lines 59-60
- **Rule**:
  ```cel
  request.resource.data.totalAmount == get(/databases/$(database)/documents/pitches/$(request.resource.data.pitchId)).data.pricePerHour * request.resource.data.duration
  ```
- **Problem**: In `src/app/[locale]/book/page.tsx:207-235`, `totalAmount` accounts for discounts (e.g., 10% off with `KICKOFF10`) and add-ons (referee +150, bibs +50, drinks +100). The rule rejects valid transactions where discounts or add-ons are applied.
- **Fix**: Validate that `totalAmount > 0` and `depositAmount >= 0` and `depositAmount <= totalAmount`.

#### Mismatch 2: Cancellation Status & Permission Gap
- **Location**: `firestore.rules` lines 76-80
- **Rule**:
  ```cel
  request.resource.data.status == 'rejected' &&
  (resource.data.status == 'locked_temporary' || resource.data.status == 'pending_review')
  ```
- **Problem**: Player cancellation should set `status == 'cancelled'`. The rule currently only permits status transition to `'rejected'`.
- **Fix**: Change condition to `request.resource.data.status in ['cancelled', 'rejected']`.

#### Mismatch 3: Public Match Join/Leave Authorization Loophole
- **Location**: `firestore.rules` lines 81-97
- **Problem**: The rule checks `joinedPlayers.size() == resource.data.joinedPlayers.size() + 1`, but does NOT verify that the user adding/removing themselves matches `request.auth.uid`. A malicious user could rewrite array entries of other players.
- **Fix**: Require that the modified element matches `request.auth.uid`.

#### Mismatch 4: Schedule Slot Deletion Limit
- **Location**: `firestore.rules` line 108
- **Rule**:
  ```cel
  resource == null || request.resource.data.slots.size() >= resource.data.slots.size() - 4
  ```
- **Problem**: When a booking exceeding 2 hours (4 half-hour blocks, e.g., 2.5h or 3h = 5 or 6 blocks) is cancelled or rejected, deleting those slots decreases `slots.size()` by more than 4, violating security rule assertions for non-admin callers.
- **Fix**: Remove arbitrary numeric size bound `- 4` or increase limit to match max allowable booking duration (e.g. 12 blocks).

---

### 3.2 Realtime Database Rules Audit (`database.rules.json`)

#### Current Rules:
```json
{
  "rules": {
    "status": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "chats": {
      "$matchId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

#### Vulnerabilities & Flaws:
1. **Entire Tree Overwrite**: `.write: "auth != null"` at `$matchId` allows ANY logged-in user to wipe out `chats/$matchId` entirely.
2. **Missing Field Schema Validation**: Messages pushed in `MatchChat.tsx` require `text`, `senderId`, `senderName`, and `timestamp`. The current rule accepts arbitrary JSON structures.
3. **No Sender Identity Check**: A user can impersonate other users by sending arbitrary `senderId` and `senderName`.

#### Recommended `database.rules.json`:
```json
{
  "rules": {
    "status": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "chats": {
      "$matchId": {
        ".read": "auth != null",
        "messages": {
          "$messageId": {
            ".write": "auth != null && (!data.exists() || auth.uid === data.child('senderId').val() || root.child('users').child(auth.uid).child('role').val() === 'admin')",
            ".validate": "newData.hasChildren(['text', 'senderId', 'timestamp']) && newData.child('senderId').val() === auth.uid && newData.child('text').isString() && newData.child('text').val().length > 0 && newData.child('text').val().length <= 1000"
          }
        }
      }
    }
  }
}
```

---

## 4. Proposed Code Patch Proposals

### 4.1 Fix `BookingStatus` Enum & Hook (`src/types/index.ts` & `src/hooks/useBookings.ts`)

#### Patch 1: `src/types/index.ts`
```typescript
export enum BookingStatus {
  LOCKED_TEMPORARY = 'locked_temporary',
  PENDING_REVIEW = 'pending_review',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}
```

#### Patch 2: Refactor `useCancelBooking` in `src/hooks/useBookings.ts`
```typescript
import { cancelBooking } from '@/lib/firebase/booking';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, userId }: { bookingId: string; userId: string }) => {
      await cancelBooking(bookingId, userId);
    },
    onMutate: async ({ bookingId }) => {
      await queryClient.cancelQueries({ queryKey: ['userBookings'] });
      const previousBookings = queryClient.getQueryData(['userBookings']);

      queryClient.setQueriesData({ queryKey: ['userBookings'] }, (old: any) => {
        if (!old) return old;
        return old.map((booking: any) => 
          booking.id === bookingId ? { ...booking, status: BookingStatus.CANCELLED } : booking
        );
      });

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueriesData({ queryKey: ['userBookings'] }, context.previousBookings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
}
```

### 4.2 Fix Memory Cleanup Bug in `src/lib/firebase/booking.ts`
```typescript
// Lines 68-76 in lockSlot():
for (const key of Object.keys(bookedSlots)) {
  const slot = bookedSlots[key];
  if (slot && slot.status === BookingStatus.LOCKED_TEMPORARY && slot.lockedUntil && slot.lockedUntil < now) {
    delete bookedSlots[key];
  }
}
```

---

## 5. Summary of Recommended Actions

1. Update `BookingStatus` enum to include `CANCELLED = 'cancelled'`.
2. Replace memory object `deleteField()` with JS `delete` operator inside `lockSlot()`.
3. Refactor `useCancelBooking` in `useBookings.ts` to call transaction-safe `cancelBooking(bookingId, userId)`.
4. Deploy updated `firestore.indexes.json` containing the 5 newly identified composite indexes.
5. Relax price strictness in `firestore.rules` booking creation to accommodate discounts/addons, allow `cancelled` status on updates, and fix slot deletion bounds in `day_schedules`.
6. Enforce schema and sender identity validation in `database.rules.json` for match chats.
