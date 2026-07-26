# Handoff Report — EGFootball5 Security & Backend/Firestore Audit

**Agent ID**: `teamwork_preview_explorer_m1_1`  
**Working Directory**: `d:\football\kickoff\.agents\teamwork_preview_explorer_m1_1`  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Firestore `day_schedules` Security Permissiveness**:
   - Location: `firestore.rules`, lines 89–97.
   - Code:
     ```declarative
     match /day_schedules/{dayId} {
       allow read: if true;
       allow write: if isAuth() && isNotBlacklisted() && (
         isAdmin() || (
           (resource == null && request.resource.data.keys().hasOnly(['slots'])) || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['slots'])
         )
       );
     }
     ```
   - Result: Any logged-in player can update or reset `slots` directly without going through booking verification or deposit submission.

2. **`notifications` Creation Access Failure on Cancellation**:
   - Locations: `firestore.rules`, line 109 & `src/lib/firebase/booking.ts`, lines 325–333.
   - Code snippet (`firestore.rules`):
     ```declarative
     match /notifications/{notificationId} {
       allow create: if isAdmin() || isOwner();
     }
     ```
   - Code snippet (`src/lib/firebase/booking.ts`):
     ```typescript
     export async function cancelBooking(bookingId: string, userId: string) {
       ...
       const notificationRef = doc(collection(db, 'notifications'));
       transaction.set(notificationRef, { ... });
     }
     ```
   - Result: Standard players executing `cancelBooking()` fail with Firestore `permission-denied` because player role is neither `admin` nor `owner`.

3. **API Token Verification Defect**:
   - Location: `src/app/api/ai/tts/route.ts`, lines 9–13.
   - Code:
     ```typescript
     const authHeader = req.headers.get("authorization");
     if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
     ```
   - Result: Bearer token format is checked, but token signature is never validated against Firebase Auth Admin SDK (`adminAuth.verifyIdToken()`).

4. **Missing Realtime DB Rules**:
   - Location: `src/lib/firebase/config.ts` (lines 29–32) & `src/hooks/useOnlinePresence.ts`, `src/components/MatchChat.tsx`.
   - Result: Realtime Database is initialized and actively used for presence (`/status/{uid}`) and match chats (`chats/{matchId}/messages`), but no `database.rules.json` file is defined in the repository.

5. **`joinedPlayers` Schema Inconsistency**:
   - Locations: `src/lib/firebase/booking.ts`, line 134 vs `src/hooks/useMatches.ts`, line 33.
   - Code (`booking.ts`): `joinedPlayers: [{ uid: userId, name: userName }]` (Array of Objects).
   - Code (`useMatches.ts`): `joinedPlayers: arrayUnion(userId)` (Array of Strings).
   - Result: Joining a match via `useMatches.ts` appends strings to an array of objects, corrupting array structure.

---

## 2. Logic Chain

1. **Observation**: `firestore.rules` allows any non-blacklisted authenticated user to update `day_schedules/{dayId}` as long as `affectedKeys()` is `['slots']`.
2. **Logic**: `day_schedules` tracks all field slot locks and booking statuses (`locked_temporary`, `confirmed`). Allowing arbitrary client writes means a player can clear slots locked by another user or lock all slots for free without going through `lockSlot()` or paying a deposit.
3. **Conclusion**: `day_schedules` rule presents an immediate security vulnerability and needs to be restricted to backend server/admin access in Milestone 2.

4. **Observation**: `cancelBooking()` is executed by client players and writes to `notifications`. `firestore.rules` restricts `notifications` document creation to `isAdmin() || isOwner()`.
5. **Logic**: When a transaction attempts a operation forbidden by security rules, the entire Firestore transaction aborts and rolls back.
6. **Conclusion**: Standard players cannot cancel their pending/locked bookings via `cancelBooking()`. The rule or transaction architecture must be updated in Milestone 2.

---

## 3. Caveats

- Investigation was performed strictly read-only.
- Backend infrastructure (Firebase Cloud Functions / Cloud Run) is currently managed on the client side; no `functions/` directory exists in the workspace.
- Live Firebase deployment state (active console rules) cannot be queried directly without Firebase CLI credentials, but repo configuration files (`firestore.rules`, `firebase.json`) were fully audited.

---

## 4. Conclusion

The EGFootball5 security & backend architecture is functional for client prototyping but contains notable security gaps and data structure mismatches that must be resolved in **Milestone 2 (Security Hardening & RBAC)** and **Milestone 3 (Backend & Firestore Architecture)**:
1. Firestore rules allow client-side schedule manipulation.
2. Notification creation rules block user self-cancellation transactions.
3. API route `/api/ai/tts` lacks token signature validation.
4. Realtime Database rules (`database.rules.json`) are missing from repository configuration.
5. Schema mismatch exists between `booking.ts` and `useMatches.ts` for `joinedPlayers`.

Full details and actionable code recommendation patches are documented in `.agents/teamwork_preview_explorer_m1_1/analysis.md`.

---

## 5. Verification Method

To verify these findings independently:
1. **Firestore Rules Inspection**: Inspect lines 89–97 in `firestore.rules` to observe permissive `day_schedules` write rule.
2. **Cancellation Transaction Test**: Trace `cancelBooking()` in `src/lib/firebase/booking.ts:325` against `firestore.rules:109` to confirm permission-denied condition for non-admin users.
3. **API Route Inspection**: Inspect `src/app/api/ai/tts/route.ts:9` to confirm absence of Firebase Admin SDK ID Token verification.
4. **RTDB Rules Inspection**: Verify absence of `database.rules.json` in project root and `firebase.json`.
