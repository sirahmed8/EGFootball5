# Security & Backend/Firestore Architecture Audit — EGFootball5

**Target Project**: `d:\football\kickoff`  
**Date**: July 26, 2026  
**Auditor**: `teamwork_preview_explorer_m1_1` (Baseline Technical Exploration)

---

## 1. Executive Summary

A comprehensive, read-only architectural and security audit of EGFootball5 was performed covering:
1. **Firestore Security Rules (`firestore.rules`) & Realtime Database (RTDB)**.
2. **Next.js API Routes (`src/app/api/...`) & Role-Based Access Control (RBAC)**.
3. **Data Integrity, Transactional Safety & Input Sanitization**.

### Core Findings Overview
- **Firestore Security Vulnerability (High)**: `match /pitches/{pitchId}` has `allow read: if true;`, and `match /day_schedules/{dayId}` permits **unauthenticated / arbitrary client updates** to `slots` if `resource == null` or `slots` is the only modified key (`firestore.rules:89-97`). This allows malicious users to directly overwrite pitch schedule slots without invoking transactions or paying deposits.
- **Missing API Token & Admin Verification (High)**: API route `/api/ai/tts` accepts any non-empty `Authorization: Bearer <token>` header without verifying the Firebase ID Token signature or checking user claims/roles via Firebase Admin SDK.
- **Client-Side Admin Role Updates (Critical/High)**: In `OwnerDashboard` (`src/app/[locale]/owner/page.tsx:80-101`), updating user roles (`role: 'admin'`) is performed directly from the browser client via `updateDoc(userRef, { role: 'admin' })`. While `firestore.rules:40` restricts `users/{userId}` update to `isAdmin()`, role promotion across uids relies entirely on client-side search without server-side verification.
- **Absence of Realtime DB Rules File**: RTDB rules (`database.rules.json`) are completely missing from the project repository. Direct client writes to `chats/{matchId}/messages` and `/status/{uid}` operate without backend security rules checks unless deployed separately.
- **Client-Driven Business Mutations & Lack of Cloud Functions**: Lock cleanup, booking confirmations, pitch updates, and global stats increments are performed directly in client-side transactions (`src/lib/firebase/booking.ts`). If client code is bypassed, malicious users can send direct Firestore REST / SDK payloads.

---

## 2. Firestore Security Rules & Realtime DB Audit

### 2.1 Firestore Rules Assessment (`firestore.rules`)

#### A. `users` Collection (`firestore.rules:34-43`)
```declarative
match /users/{userId} {
  allow read: if isAuth() && (request.auth.uid == userId || isAdmin());
  allow create: if isAuth() && request.auth.uid == userId && request.resource.data.role == 'player' && request.resource.data.isBlacklisted == false;
  allow update: if isAuth() && (
    (request.auth.uid == userId && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isBlacklisted'])) ||
    isAdmin()
  );
  allow delete: if isAdmin();
}
```
- **Strengths**:
  - Direct protection against self-elevation of role or self-removal of blacklisting via `.hasAny(['role', 'isBlacklisted'])`.
  - Restricts creation to `role == 'player'` and `isBlacklisted == false`.
- **Weaknesses**:
  - `isAdmin()` helper performs a synchronous `get()` on `/databases/$(database)/documents/users/$(request.auth.uid)`. If the document does not exist yet during login/signup, rule evaluation can fail or cause rule evaluation overhead. Custom Auth Claims (`request.auth.token.role`) should be used for optimal security and performance.

#### B. `pitches` Collection (`firestore.rules:45-51`)
```declarative
match /pitches/{pitchId} {
  allow read: if true;
  allow create: if isOwner() || (isAdmin() && request.resource.data.adminEmail == request.auth.token.email);
  allow update: if isOwner() || (isAdmin() && resource.data.adminEmail == request.auth.token.email && request.resource.data.adminEmail == request.auth.token.email);
  allow delete: if isOwner();
}
```
- **Weaknesses**:
  - `allow read: if true;` is open publicly. While public pitch listing is intended, unauthenticated users can dump full pitch metadata (including manager email, phone, internal recipient details).
  - Admin creation/update checks `request.resource.data.adminEmail == request.auth.token.email`. Email in Firebase auth token can be spoofed if unverified or if third-party auth provider allows arbitrary email claims.

#### C. `bookings` Collection (`firestore.rules:53-87`)
```declarative
match /bookings/{bookingId} {
  allow read: if isAuth() && (request.auth.uid == resource.data.userId || isAdmin() || (resource.data.bookingType == 'public' && resource.data.status == 'confirmed'));
  allow create: if isAuth() 
                && isNotBlacklisted()
                && request.resource.data.userId == request.auth.uid
                && request.resource.data.status == 'locked_temporary'
                && request.resource.data.totalAmount == get(/databases/$(database)/documents/pitches/$(request.resource.data.pitchId)).data.pricePerHour * request.resource.data.duration
                && request.resource.data.depositAmount >= 0
                && request.resource.data.duration > 0;
  allow update: ...
}
```
- **Vulnerabilities**:
  1. **Public Match Join Hijacking (`firestore.rules:68-84`)**:
     The update rule allows players to join or leave public matches if `affectedKeys().hasOnly(['joinedPlayers'])`. However, it only checks `request.resource.data.joinedPlayers.size() == resource.data.joinedPlayers.size() + 1`. It **does NOT verify** that the added player element matches `request.auth.uid`. A malicious user could append another user's UID or clear legitimate users.
  2. **Status Transition & Receipt Submission Bypass (`firestore.rules:66-67`)**:
     Allows update if `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['receiptUrl', 'status']) && request.resource.data.status == 'pending_review' && resource.data.status == 'locked_temporary'`.
     Notice: It does **NOT** require `receiptUrl` to be a non-empty string or a valid Storage URL. An attacker can set `receiptUrl` to an arbitrary string or `null` and transition the status to `pending_review` without actually uploading a receipt image.

#### D. `day_schedules` Collection (`firestore.rules:89-97`) — CRITICAL
```declarative
match /day_schedules/{dayId} {
  allow read: if true;
  allow write: if isAuth() && isNotBlacklisted() && (
    isAdmin() || (
      // Only allowed to modify or create the slots field. In a real production app, this should be purely driven by Cloud Functions.
      (resource == null && request.resource.data.keys().hasOnly(['slots'])) || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['slots'])
    )
  );
}
```
- **Critical Vulnerability**:
  - Any authenticated non-blacklisted user can overwrite `slots` on ANY `day_schedule` document.
  - The rule allows direct client writes as long as `affectedKeys().hasOnly(['slots'])`.
  - An attacker can execute a client script writing `{ slots: {} }` or fake `status: 'confirmed'` to arbitrarily lock or wipe out reservations for competing teams/pitch managers without paying any deposit or executing anti-gap validation!

#### E. `notifications` Collection (`firestore.rules:106-112`)
```declarative
match /notifications/{notificationId} {
  allow read: if isAuth() && resource.data.userId == request.auth.uid;
  allow create: if isAdmin() || isOwner();
  allow update: if isAuth() && resource.data.userId == request.auth.uid && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
  allow delete: if isAuth() && resource.data.userId == request.auth.uid;
}
```
- **Observations**:
  - `create` allowed only for `isAdmin() || isOwner()`. However, `confirmBooking`, `rejectBooking`, and `cancelBooking` in `src/lib/firebase/booking.ts` attempt to write notifications from the client browser.
  - If a standard player cancels their booking via `cancelBooking()` (`src/lib/firebase/booking.ts:325`), the client attempt to write to `/notifications` will **FAIL with permission-denied** because the standard user is neither `isAdmin()` nor `isOwner()`.

---

### 2.2 Realtime Database Security Status

- **Config in `src/lib/firebase/config.ts:29-32`**:
  ```typescript
  export const rtdb = getDatabase(
    app,
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://football1fc1-default-rtdb.europe-west1.firebasedatabase.app"
  );
  ```
- **Active Usage**:
  1. `useOnlinePresence` (`src/hooks/useOnlinePresence.ts`): writes presence to `/status/{uid}` and reads `/status`.
  2. `MatchChat` (`src/components/MatchChat.tsx`): reads/writes messages to `chats/{matchId}/messages`.
- **Defect**:
  - No `database.rules.json` file exists in the repo.
  - Without deployed RTDB security rules, `/status` and `/chats` are either exposed to unauthorized reads/writes or locked entirely depending on Firebase console defaults.
  - **Required RTDB Rules**:
    - Users can only write their own status to `/status/$uid`.
    - Only confirmed participants of `matchId` can read/write to `chats/$matchId/messages`.

---

## 3. API Routes & RBAC Audit

### 3.1 Route Inspection (`src/app/api/...`)

Only 1 API route exists in the project:
- `src/app/api/ai/tts/route.ts` (Text-To-Speech endpoint).

#### Vulnerability Analysis in `src/app/api/ai/tts/route.ts`:
1. **Dummy Bearer Token Check (`lines 9-13`)**:
   ```typescript
   const authHeader = req.headers.get("authorization");
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```
   - The handler checks if `Authorization` header starts with `"Bearer "`, but **NEVER verifies the token**! Passing `Authorization: Bearer fake_token` grants 100% access.
2. **IP-Based Rate Limiting Flaw (`lines 4, 8, 19-30`)**:
   ```typescript
   const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
   const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown_ip";
   ```
   - In serverless environments (Vercel, Next.js App Router, Firebase Hosting), an in-memory `Map` is reset across instance cold-starts and is not shared across lambda instances.
   - `x-forwarded-for` header can be spoofed by client headers if not sanitized by a trusted reverse proxy.

### 3.2 Role-Based Access Control (RBAC) Architecture

The application defines 3 roles (`types/index.ts`): `player`, `admin` (pitch manager), `owner` (platform owner).

#### Current RBAC Verification Flow:
- **Client-Side Routing Guard**: `AdminDashboard` (`src/app/[locale]/admin/dashboard/page.tsx:40-44`) and `OwnerDashboard` (`src/app/[locale]/owner/page.tsx:26-30`) check `appUser?.role` via Zustand `useAuthStore` and redirect unauthorized users via `router.push('/')`.
- **Client-Side Firestore Listener (`AuthProvider.tsx:26-40`)**: `AuthProvider` listens to `doc(db, 'users', firebaseUser.uid)` and populates `appUser`.
- **Missing Middleware**: No Next.js `middleware.ts` exists to perform server-side cookie/token verification or protect edge routes before rendering page shells.

---

## 4. Data Integrity & Input Sanitization Audit

### 4.1 Client-Side Business Logic & Transaction Vulnerabilities

#### A. Lock Slot & Anti-Gap Logic (`src/lib/firebase/booking.ts:24-139`)
- `lockSlot()` calculates temporary slot locks and enforces anti-gap rules (preventing 30-minute dead gaps).
- **Vulnerability**: Because logic is executed inside the client browser, a user can modify local JS or send direct Firestore transactions to bypass anti-gap logic or set custom `depositAmount` / `totalAmount` if rules do not enforce strict mathematical validation.

#### B. Cancel Booking Notification Failure (`src/lib/firebase/booking.ts:325-333`)
```typescript
const notificationRef = doc(collection(db, 'notifications'));
transaction.set(notificationRef, {
  id: notificationRef.id,
  userId: booking.userId,
  ...
});
```
- A player calling `cancelBooking()` tries to write a document to `notifications`. `firestore.rules:109` requires `allow create: if isAdmin() || isOwner();`. As a result, standard user cancellations throw a Firestore `permission-denied` exception during transaction execution, rolling back the cancellation!

#### C. Join Match Mutator (`src/hooks/useMatches.ts:30-35`)
```typescript
const bookingRef = doc(db, 'bookings', bookingId);
await updateDoc(bookingRef, {
  joinedPlayers: arrayUnion(userId),
});
```
- `useJoinMatch` passes `userId` as a raw string to `arrayUnion(userId)`.
- However, `firestore.rules:76` checks `request.resource.data.joinedPlayers.size() <= resource.data.numPeople`.
- `joinedPlayers` in `booking.ts:134` is stored as an array of objects `[{ uid: userId, name: userName }]`, whereas `useJoinMatch` appends a raw string `userId`. This type mismatch causes structural corruption of the `joinedPlayers` array!

---

## 5. Security & Architectural Recommendations

To elevate EGFootball5 to production-grade security (Milestone 2 & Milestone 3 alignment):

### Recommendation 1: Harden Firestore Rules (`firestore.rules`)
1. **Restrict `day_schedules` writes**: Remove client write permissions for non-admin users on `day_schedules`. All slot locking should be managed via Firebase Admin SDK in API routes or Cloud Functions.
2. **Fix `notifications` creation**: Allow users to create notifications where `request.resource.data.userId == request.auth.uid` for self-triggered events (e.g. cancellation), or move notification dispatch to server-side backend triggers.
3. **Sanitize `joinedPlayers` updates**: Validate that `joinedPlayers` elements contain `request.auth.uid`.
4. **Enforce `receiptUrl` string validation**: Require `request.resource.data.receiptUrl is string && request.resource.data.receiptUrl.size() > 0`.

### Recommendation 2: Realtime Database Rules Deployment
Create `database.rules.json` and add to `firebase.json`:
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
        "messages": {
          ".read": "auth != null",
          ".write": "auth != null && newData.child('senderId').val() === auth.uid"
        }
      }
    }
  }
}
```

### Recommendation 3: Implement Backend Firebase Admin ID Token Verification
1. Introduce `@/lib/firebase/admin.ts` using `firebase-admin/app` and `firebase-admin/auth`.
2. Verify session ID tokens in API routes (`adminAuth.verifyIdToken(token)`).
3. Secure `/api/ai/tts` and create authenticated endpoints for administrative mutations (role upgrades, pitch creation).

### Recommendation 4: Add Next.js Server-Side Middleware (`src/middleware.ts`)
Implement Next.js middleware to inspect session cookies for protected routes (`/admin/*`, `/owner/*`) to prevent unauthorized initial page renders before client-side hydration.

---

## 6. Audit Verification Matrix

| Target Component | Finding / Risk | Status | Action Item |
|------------------|----------------|--------|-------------|
| `firestore.rules:day_schedules` | Unauthenticated / player slot overwrite | **High Risk** | Restrict writes to Admin/Backend |
| `firestore.rules:notifications` | User cancellation fails on notification write | **Medium Bug** | Update rule or server trigger |
| `firestore.rules:bookings` | Missing payload check on `receiptUrl` | **Low Risk** | Add `is string` & length check |
| `src/app/api/ai/tts/route.ts` | Unverified `Bearer` header check | **High Risk** | Implement `verifyIdToken()` |
| `src/hooks/useMatches.ts` | Type mismatch in `joinedPlayers` (`string` vs `object`) | **Medium Bug** | Standardize `joinedPlayers` schema |
| `Realtime Database` | Missing `database.rules.json` file | **High Risk** | Add RTDB rules to repo |

---
*Report compiled by `teamwork_preview_explorer_m1_1`.*
