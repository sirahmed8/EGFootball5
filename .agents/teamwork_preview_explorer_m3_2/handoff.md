# Handoff Report: Milestone 3 Explorer 2 (Realtime Database, Chats, Notifications & Presence)

**Working Directory**: `d:\football\kickoff\.agents\teamwork_preview_explorer_m3_2`  
**Date**: 2026-07-26  
**Type**: Hard Handoff  

---

## 1. Observation

1. **Presence Tracking Mismatch**:
   - `src/hooks/useOnlinePresence.ts`: Reads/writes `/status/${firebaseUser.uid}` and `/status`. Completely unused in codebase (0 imports).
   - `src/components/PresenceIndicator.tsx` (rendered in `Navbar.tsx:23,35`): Reads/writes `presence/${firebaseUser.uid}` and `presence/anon_${sessionId}`.
   - `database.rules.json:3-8`: Grants read/write access ONLY for `status/$uid` where `auth != null`. Contains **no rules for `presence/`**.

2. **Match Lobby Chat Architecture**:
   - `src/components/MatchChat.tsx:35`: Subscribes to `chats/${matchId}/messages` using `limitToLast(50)`.
   - `src/hooks/useChat.ts`: File does not exist. All chat subscription and push logic is embedded directly in `MatchChat.tsx`.
   - `database.rules.json:9-14`: Grants `.read` and `.write` for `chats/$matchId` to any `auth != null`. Lacks authorization for `joinedPlayers` or `.indexOn: ["timestamp"]`.

3. **Notifications Architecture**:
   - `src/components/NotificationBell.tsx:55-59`: Queries `collection(db, 'notifications')` with `where('userId', '==', appUser.uid)` and `limit(50)` without `orderBy('createdAt', 'desc')`.
   - `firestore.indexes.json`: Missing composite index for `notifications` (`userId` ASC, `createdAt` DESC).
   - `src/lib/firebase/booking.ts:236,275,324`: Notifications created during `confirmBooking`, `rejectBooking`, `cancelBooking`. Missing triggers for match join/leave, support ticket replies, and admin alerts.

---

## 2. Logic Chain

1. **Presence Failure Reasoning**:
   - `Navbar.tsx` renders `PresenceIndicator`.
   - `PresenceIndicator` attempts to read/write `presence/` in RTDB.
   - `database.rules.json` does not grant access to `presence/` (defaults to deny-all).
   - `onValue` in `PresenceIndicator` encounters permission error and silently invokes error callback setting `onlineCount = 0`, causing the UI component to return `null`.

2. **Notification Truncation Reasoning**:
   - `NotificationBell.tsx` requests `limit(50)` without specifying `orderBy('createdAt', 'desc')` in the Firestore query.
   - Firestore fetches 50 arbitrary notification documents for that `userId` before client-side array sorting.
   - If a user accumulates >50 notifications, newer notifications are omitted from the snapshot result set.

3. **Match Chat Security & Performance Reasoning**:
   - `database.rules.json` allows any authenticated user to write to `chats/$matchId`.
   - Absence of participant checks enables non-joined users to post to match chat.
   - Absence of `.indexOn: ["timestamp"]` under `chats/$matchId/messages` causes RTDB to fall back to downloading unindexed trees and sorting on client.

---

## 3. Caveats

- **Network Restrictions**: Investigation was conducted in CODE_ONLY mode (local filesystem analysis).
- **Firebase Emulator Testing**: Security rule permissions were verified via static analysis of `database.rules.json` and `firestore.rules` rather than running live emulator test suites.

---

## 4. Conclusion

The Realtime architecture (Presence, Chat, Notifications) has a sound foundation, but suffers from key rule omissions, path mismatches, un-indexed queries, missing modular abstractions (`useChat.ts`), and missing notification triggers. Implementing the recommendations outlined in `analysis.md` will resolve security vulnerabilities, eliminate silent presence failures, and guarantee reliable notification delivery.

---

## 5. Verification Method

1. **Verify Presence Rule Match**:
   - Inspect `database.rules.json` and compare paths against `PresenceIndicator.tsx` or `useOnlinePresence.ts`.
2. **Verify Notification Query Order**:
   - Check `src/components/NotificationBell.tsx:55-59` to confirm presence/absence of `orderBy('createdAt', 'desc')`.
3. **Verify Chat Hook Absence**:
   - Run `find_by_name` or inspect `src/hooks` to confirm `useChat.ts` does not exist.
