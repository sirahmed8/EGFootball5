# Milestone 2: Security Hardening & RBAC — Changes Log

**Agent**: `teamwork_preview_worker_m2_1`  
**Date**: July 26, 2026  
**Target Repository**: `d:\football\kickoff`

---

## Summary of Changes

### 1. Firestore Security Rules (`firestore.rules`)
- **Direct Write Vulnerability Fix (`day_schedules`)**:
  - Restricted `day_schedules/{dayId}` write access. Arbitrary overwrites to `slots` by non-admin users are prevented.
  - Required non-admin writes to only modify the `slots` key and prevented unauthorized deletion or schedule wiping.
- **Notification Creation Fix (`notifications`)**:
  - Updated `match /notifications/{notificationId}` create rules to `allow create: if isAuth() && (request.auth.uid == request.resource.data.userId || isAdmin() || isOwner());`.
  - Enables `cancelBooking()` to create notification documents without encountering `permission-denied` transaction rollbacks.
- **Bookings Collection Hardening (`bookings`)**:
  - Added strict payload validation for `receiptUrl` (`request.resource.data.receiptUrl is string && request.resource.data.receiptUrl.size() > 0`).
  - Added allowed status transition for booking owners to reject/cancel their own temporary locks (`status == 'rejected'`).
- **Support Tickets & All Collections Audit**:
  - Tightened rules for `users`, `pitches`, `bookings`, `stats`, `notifications`, `support_tickets`, and subcollection `messages` to eliminate unauthenticated or wildcard bypasses.

---

### 2. Realtime Database Security Rules (`database.rules.json` & `firebase.json`)
- **Created `database.rules.json`**:
  - Defined strict access control rules for `/status/$uid` (readable by authenticated users, writable only by `$uid == auth.uid`).
  - Defined strict access control rules for `/chats/$matchId` (readable and writable only by authenticated users `auth != null`).
- **Updated `firebase.json`**:
  - Configured `"database": { "rules": "database.rules.json" }` alongside firestore configuration.

---

### 3. Server-Side Authentication & API Route RBAC (`src/app/api/...` & `src/lib/auth/serverAuth.ts`)
- **Created `src/lib/auth/serverAuth.ts`**:
  - Implemented `verifyAuthToken(req: NextRequest)` to decode and verify Firebase ID tokens (expiration, audience `aud`, issuer `iss`, subject `sub`/`uid`).
  - Implemented `requireAuth(req: NextRequest, allowedRoles?: Role[])` server-side RBAC verification helper.
- **Secured `/api/ai/tts/route.ts`**:
  - Removed dummy bearer token check and enforced `verifyAuthToken(req)`.
  - Added rate limiting and input text sanitization (`slice(0, 500)`).
- **Created `/api/ai/chat/route.ts`**:
  - Built secure server API endpoint for Gemini AI calls.
  - Enforced Firebase ID token verification.
- **Created `/api/admin/role/route.ts`**:
  - Built server API endpoint for role promotion with `requireAuth(req, ['owner'])` role check.

---

### 4. Protected Environment Configurations & Secret Isolation
- **Updated `src/lib/aiService.ts`**:
  - Removed client-side exposure of `NEXT_PUBLIC_GEMINI_API_KEY`.
  - Updated `generateAIResponse()` to route AI requests through `/api/ai/chat` server endpoint using server-side environment variables and passing user ID token.

---

### 5. Data Integrity & Match Lobby Hooks
- **Refactored `src/hooks/useMatches.ts`**:
  - Updated `useJoinMatch` and `useLeaveMatch` mutations to execute Firestore transactions updating structured `JoinedPlayer` objects (`{ uid: userId, name: userName }`) rather than appending raw string UIDs.

---

## File Modification Index

| File Path | Status | Action Description |
|-----------|--------|-------------------|
| `firestore.rules` | Modified | Hardened Firestore rules for `day_schedules`, `notifications`, `bookings`, `support_tickets` |
| `database.rules.json` | Created | Defined RTDB rules for `/status` and `/chats` |
| `firebase.json` | Modified | Added RTDB configuration reference |
| `src/lib/auth/serverAuth.ts` | Created | Server-side Firebase ID token verification and RBAC helpers |
| `src/app/api/ai/tts/route.ts` | Modified | Enforced token verification and input sanitization |
| `src/app/api/ai/chat/route.ts` | Created | Secure server API route for Gemini AI requests |
| `src/app/api/admin/role/route.ts` | Created | Server API route for owner role management |
| `src/lib/aiService.ts` | Modified | Removed client-side `NEXT_PUBLIC_GEMINI_API_KEY`, routed requests to server API |
| `src/hooks/useMatches.ts` | Modified | Refactored match join/leave to handle structured `JoinedPlayer` objects in transactions |

---

## Build & Verification Results
- **TypeScript Type Check (`npx tsc --noEmit`)**: PASSED (0 errors)
- **Next.js Production Build (`npm run build`)**: PASSED cleanly
