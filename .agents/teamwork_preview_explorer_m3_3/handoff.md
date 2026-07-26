# Handoff Report: Explorer 3 — Milestone 3 (Backend, Realtime & Firestore Architecture)

**Working Directory**: `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_3`  
**Handoff Type**: Hard (Task Complete)  
**Date**: 2026-07-26  

---

## 1. Observation

Direct code observations from inspection:

1. **`src/lib/firebase/booking.ts` (Lines 71-79)**:
   ```typescript
   if (slot.status === BookingStatus.LOCKED_TEMPORARY && slot.lockedUntil && slot.lockedUntil < now) {
     bookedSlots[key] = deleteField() as any;
   }
   ...
   for (const block of blocks) {
     if (bookedSlots[block.toString()]) {
       throw new Error('ERROR_SLOT_TAKEN');
     }
   }
   ```
   *Observation*: `deleteField()` returns an object reference. In JavaScript, an object evaluates as `truthy` in `if (bookedSlots[block.toString()])`, causing expired locks to be treated as taken.

2. **`src/hooks/useBookings.ts` (Lines 28-34)** vs `src/lib/firebase/booking.ts` (Lines 288-335):
   - `src/hooks/useBookings.ts` lines 28-34:
     ```typescript
     const bookingRef = doc(db, 'bookings', bookingId);
     await updateDoc(bookingRef, {
       status: 'cancelled',
       updatedAt: new Date().toISOString(),
     });
     ```
   - `src/lib/firebase/booking.ts` lines 288-335: Defines `cancelBooking(bookingId, userId)` using `runTransaction` to free slots in `day_schedules`.
   *Observation*: `useCancelBooking` bypasses `cancelBooking()`, does not update `day_schedules`, and writes `'cancelled'` which fails `firestore.rules` (which requires `'rejected'`).

3. **`src/types/index.ts` (Lines 50-55)**:
   ```typescript
   export enum BookingStatus {
     LOCKED_TEMPORARY = 'locked_temporary',
     PENDING_REVIEW = 'pending_review',
     CONFIRMED = 'confirmed',
     REJECTED = 'rejected',
   }
   ```
   *Observation*: `BookingStatus` lacks the enum constant `CANCELLED = 'cancelled'`.

4. **`src/lib/firebase/booking.ts` (Lines 337-346)** & `firestore.indexes.json`:
   - `booking.ts` line 340:
     ```typescript
     const q = query(
       bookingsRef,
       where('pitchId', '==', pitchId),
       where('status', '==', BookingStatus.LOCKED_TEMPORARY),
       where('lockedUntil', '<', now)
     );
     ```
   - `firestore.indexes.json`: Contains only index `(bookingType ASC, status ASC)`.
   *Observation*: Index `(pitchId ASC, status ASC, lockedUntil ASC)` is missing, causing `cleanupExpiredBookings()` to fail at runtime.

5. **`firestore.rules` (Lines 59-62)** vs `src/app/[locale]/book/page.tsx` (Lines 207-235):
   - `firestore.rules`:
     ```cel
     request.resource.data.totalAmount == get(/databases/$(database)/documents/pitches/$(request.resource.data.pitchId)).data.pricePerHour * request.resource.data.duration
     ```
   - `book/page.tsx`: Applies promo discounts (10%, 20%) and add-ons (referee, bibs, drinks).
   *Observation*: `totalAmount` does not match `pricePerHour * duration` when discounts or add-ons are active, causing security rule rejection.

6. **`database.rules.json` (Lines 9-14)**:
   ```json
   "chats": {
     "$matchId": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```
   *Observation*: `.write: "auth != null"` allows any authenticated user to overwrite or delete the entire match chat hierarchy.

---

## 2. Logic Chain

1. **Memory Evaluation Logic**:
   - Observation 1 shows `deleteField()` assigned to `bookedSlots[key]` in local memory before availability check.
   - In JS, `Boolean(deleteField()) === true`.
   - Therefore, `bookedSlots[block.toString()]` checks evaluate to `true`, triggering `ERROR_SLOT_TAKEN` on expired slots.
   - *Conclusion*: Expired slots cannot be locked without throwing an error unless cleared with `delete bookedSlots[key]`.

2. **Transaction & State Consistency Logic**:
   - Observation 2 & 3 show `useCancelBooking` mutating Firestore directly via `updateDoc` setting `status: 'cancelled'`.
   - `day_schedules` document is untouched, creating orphaned slot locks in Firestore.
   - `firestore.rules` line 78 requires `status == 'rejected'` for player updates, causing `updateDoc` to fail with permission errors.
   - *Conclusion*: `useCancelBooking` must be updated to call `cancelBooking()` inside an atomic transaction, and `firestore.rules` + `BookingStatus` must accept `'cancelled'`.

3. **Composite Index Requirement Logic**:
   - Observation 4 shows query in `cleanupExpiredBookings()` filtering on 2 equality fields (`pitchId`, `status`) and 1 range field (`lockedUntil`).
   - Firestore query engine requires a composite index for queries combining multiple equality fields with inequality comparisons.
   - `firestore.indexes.json` lacks this index.
   - *Conclusion*: Deploying the composite index definition is required to prevent query failure.

4. **Security Rules Alignment Logic**:
   - Observation 5 shows `firestore.rules` enforcing strict `totalAmount == pricePerHour * duration`.
   - `book/page.tsx` modifies `totalAmount` via discount codes and add-ons.
   - *Conclusion*: Rule assertion must be updated to allow valid total/deposit calculations with discounts and add-ons.

---

## 3. Caveats

- **Test Environment Data**: Investigation was conducted via static code inspection and local architecture evaluation. Live Firebase backend deployment was not altered (read-only mode strictly maintained).
- **Rule Deployment**: Recommended changes in `firestore.rules`, `database.rules.json`, and `firestore.indexes.json` require `firebase deploy --only firestore:rules,firestore:indexes,database` by the implementing agent/user.

---

## 4. Conclusion

KickOff's booking engine and Firestore configuration require targeted refactoring to resolve 5 critical bugs:
1. Fix memory slot deletion in `lockSlot()` (`delete bookedSlots[key]`).
2. Include `CANCELLED` in `BookingStatus` enum and refactor `useCancelBooking()` to invoke `cancelBooking()` in `src/lib/firebase/booking.ts`.
3. Add 5 composite indexes to `firestore.indexes.json` (including `pitchId` + `status` + `lockedUntil`).
4. Update `firestore.rules` to accommodate discounts/add-ons in `totalAmount` check and support `'cancelled'` status.
5. Secure `database.rules.json` with per-message write validation and sender verification.

---

## 5. Verification Method

### 1. Build Verification
Run the build script to confirm TypeScript compilation:
```powershell
npm run build
```

### 2. File & Diff Inspection
Inspect the generated analysis report and proposed patches:
- `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_3\analysis.md`
- `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_3\handoff.md`

### 3. Invalidation Conditions
- Any changes to `BookingStatus` enum values without updating `firestore.rules` update permissions.
- Running `cleanupExpiredBookings()` before deploying `firestore.indexes.json`.
