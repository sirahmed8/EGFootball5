# Milestone 3 (Explorer 2) Analysis Report: Realtime Database, Chats, Notifications & Presence Architecture

**Date**: 2026-07-26  
**Target Area**: Kickoff Realtime Architecture (`d:\football\kickoff`)  
**Investigator**: Explorer 2 (Milestone 3 - Backend, Realtime & Firestore Architecture)  
**Status**: Investigation Complete  

---

## Executive Summary

This report provides a comprehensive, read-only architectural evaluation of Kickoff's Realtime Database (RTDB), match lobby chat, user notifications, presence tracking, and associated security rules (`database.rules.json` and `firestore.rules`).

Key critical findings include:
1. **Presence Rules & Path Disconnect**: `database.rules.json` only grants permissions for `/status` and `/chats`, whereas `PresenceIndicator.tsx` reads and writes to `/presence` (and attempts anonymous tracking under `presence/anon_*`). This causes presence writes to silently fail or return zero online users in production. Furthermore, `useOnlinePresence.ts` (which targets `/status`) is an orphaned, unused hook.
2. **Match Chat Security & RTDB Indexing Gaps**: `database.rules.json` allows ANY authenticated user to read and write to any `chats/$matchId`, without verifying whether the user has joined the match. In addition, RTDB lacks `.indexOn: ["timestamp"]` under `chats/$matchId/messages`, leading to client-side data filtering overhead and performance degradation.
3. **Missing `useChat.ts` Abstraction**: `useChat.ts` does not exist; all RTDB chat logic is embedded directly inside `MatchChat.tsx`.
4. **Notification Query Order & Coverage Gaps**: `NotificationBell.tsx` queries Firestore `notifications` for `userId == appUser.uid` with `limit(50)` *without* ordering by `createdAt` in the Firestore query itself, risking omitting the newest notifications. Notification triggers exist only for admin booking actions (confirm, reject, cancel), omitting match host/player join alerts, support ticket replies, and admin booking creation alerts.

---

## 1. Presence Tracking Analysis

### 1.1 Codebase Inspection

Presence tracking is split across two conflicting implementations:

#### Component 1: `src/components/PresenceIndicator.tsx` (Rendered in `Navbar.tsx`)
- **RTDB Node**: `presence/${firebaseUser.uid}` or `presence/anon_${sessionId}`.
- **Connection Listener**: Subscribes to `.info/connected`. When `connected === true`, executes `onDisconnect(userPresenceRef).remove()`, then `set(userPresenceRef, { status: 'online', lastChanged: serverTimestamp(), role, name })`.
- **Global Listener**: Subscribes to `ref(rtdb, 'presence')` and sets `onlineCount = Object.keys(data).length`.
- **Unmount Cleanup**: Attempts `set(userPresenceRef, null).catch(() => {})`.

#### Component 2: `src/hooks/useOnlinePresence.ts` (Orphaned / Unused)
- **RTDB Node**: `status/${firebaseUser.uid}`.
- **Connection Listener**: Sets `onDisconnect(userStatusRef).set({ state: 'offline', lastChanged: serverTimestamp() })`, then `set(userStatusRef, { state: 'online', name, lastChanged })`.
- **Global Listener**: Subscribes to `ref(rtdb, '/status')` and counts entries where `u.state === 'online'`.
- **Usage Status**: Unused across the codebase (0 imports).

### 1.2 RTDB Security Rules Evaluation (`database.rules.json`)

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

#### Deficiencies Identified:
1. **Missing `presence` Path Rule**: `database.rules.json` contains no rules for `presence/`. Under default RTDB security rules, reading/writing to unlisted root paths is **denied**. Therefore, `PresenceIndicator.tsx` fails permission checks, triggering its silent catch block `() => setOnlineCount(0)`.
2. **Anonymous Presence Impossibility**: `PresenceIndicator.tsx` generates `anon_${sessionId}` for unauthenticated users, but RTDB rules require `auth != null`. Unauthenticated users can neither write presence nor read global presence count.
3. **Reference Closure Bug**: In `PresenceIndicator.tsx`, `let userPresenceRef: DatabaseReference | null = null;` is declared inside `useEffect`. On auth or connection state changes, `userPresenceRef` can be reassigned, causing unmount cleanup to target an outdated or null reference.

---

## 2. Match Lobby Chat Analysis

### 2.1 Codebase Inspection (`src/components/MatchChat.tsx`)

- **Data Flow**: `MatchChat.tsx` receives `matchId: string` and queries RTDB:
  ```typescript
  const messagesRef = query(
    ref(rtdb, `chats/${matchId}/messages`),
    orderByChild('timestamp'),
    limitToLast(50)
  );
  ```
- **Send Message**: Pushes a new document to `chats/${matchId}/messages`:
  ```typescript
  await push(messagesRef, {
    text: textToSend.trim(),
    senderId: firebaseUser.uid,
    senderName: appUser.name || 'Player',
    timestamp: serverTimestamp(),
  });
  ```

### 2.2 Missing Modules & Feature Gaps

1. **Missing `useChat.ts` Hook**: The codebase lacks a dedicated `useChat` custom hook. Chat logic (subscription, message send, state management) is tightly coupled within `MatchChat.tsx`.
2. **Missing Typing Indicators**: There is no implementation or RTDB node (e.g., `chats/${matchId}/typing/${uid}`) to track when match participants are typing.
3. **No Pagination / Load More**: The limit is hardcoded to `limitToLast(50)`. Historical messages prior to the last 50 cannot be loaded by users.
4. **No Delivery/Read Receipt States**: Messages do not track delivery (`sent`, `delivered`, `read`) or timestamps per participant.
5. **Optimistic UI Clearing Risk**: `handleSendMessage` clears input state (`setNewMessage('')`) immediately. If `push()` fails, `toast.error` is shown, but the typed text is lost and not restored to the input box.

### 2.3 RTDB Security & Performance Analysis

1. **Authorization Deficit**: `chats/$matchId` rules permit any authenticated user (`auth != null`) to read or write messages to any match ID. Users who have not joined the match can arbitrarily post messages.
2. **Missing Indexing Rule**: `database.rules.json` lacks `.indexOn: ["timestamp"]` for `chats/$matchId/messages`. RTDB emits client console warnings and performs un-indexed client-side evaluation.

---

## 3. Notifications Architecture Analysis

### 3.1 Codebase Inspection (`src/components/NotificationBell.tsx` & `src/lib/firebase/booking.ts`)

- **Firestore Collection**: `notifications`
- **Document Schema**:
  ```typescript
  type Notification = {
    id: string;
    userId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: number;
    type: string;
  };
  ```

### 3.2 Subscription & Query Evaluation

In `NotificationBell.tsx`:
```typescript
const q = query(
  collection(db, 'notifications'),
  where('userId', '==', appUser.uid),
  limit(50)
);
```

#### Deficiencies Identified:
1. **Un-ordered Query Window**: The query omits `orderBy('createdAt', 'desc')`. Firestore returns an unordered batch of 50 documents matching `userId`, which are then sorted client-side:
   ```typescript
   notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
   ```
   If a user has more than 50 total notifications, the newest notification may be excluded from the initial 50-document slice returned by Firestore.
2. **Missing Composite Index**: `firestore.indexes.json` does not specify an index for `notifications` with fields `userId` (ASC) and `createdAt` (DESC).

### 3.3 Notification Trigger Coverage

Current triggers in `src/lib/firebase/booking.ts`:
- `confirmBooking()` -> creates `booking_confirmed` notification.
- `rejectBooking()` -> creates `booking_rejected` notification.
- `cancelBooking()` -> creates `booking_cancelled` notification.

#### Trigger Gaps:
- **Match Join/Leave Alerts**: No notification sent to match host or joined players when someone joins or leaves a public match.
- **Support Ticket Replies**: `FloatingChatWidget.tsx` updates `support_tickets`, but does not create a user notification when staff responds.
- **Admin Inbound Alerts**: No notification created for admin when a user uploads a payment receipt (`submitReceipt`) or locks a temporary slot.

---

## 4. Comprehensive Identification of Edge Cases & Vulnerabilities

| Category | Finding / Vulnerability | Root Cause | Impact |
| :--- | :--- | :--- | :--- |
| **Presence** | Permission Denied on `/presence` | `database.rules.json` missing `presence` rules | `PresenceIndicator` fails; online counter returns 0 |
| **Presence** | Dead Code & Duplicate Path | `useOnlinePresence.ts` targets `/status`, unused | Code duplication & confusion |
| **Presence** | Reference Leak on Reconnect | `userPresenceRef` in `useEffect` closure | Orphaned `onDisconnect` handlers on RTDB |
| **Match Chat** | Unrestricted Access | `database.rules.json` allows any `auth != null` user to read/write any match chat | Security leak & spam vulnerability |
| **Match Chat** | Missing RTDB Index | No `.indexOn: ["timestamp"]` in `database.rules.json` | RTDB console warnings & excess data download |
| **Match Chat** | Hardcoded Message Cap | `limitToLast(50)` without pagination | Inability to read older match chat history |
| **Match Chat** | Data Loss on Network Error | `setNewMessage('')` called before `push` promise settles | Input text lost if push fails |
| **Notifications** | Stale Notification Window | Query missing `orderBy('createdAt', 'desc')` before `limit(50)` | Newest notifications dropped when total count > 50 |
| **Notifications** | Batch Write Overflow Risk | `handleMarkAllAsRead` uses single batch without chunking | Failure if unread notifications exceed 500 |

---

## 5. Detailed Implementation Recommendations

### Recommendation 1: Consolidate Presence System & Update RTDB Security Rules

1. Standardize on `/status/${uid}` in RTDB across both hooks and components.
2. Update `database.rules.json` to cover presence status cleanly:

```json
{
  "rules": {
    "status": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && (auth.uid === $uid || $uid.startsWith('anon_'))"
      }
    },
    "chats": {
      "$matchId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "messages": {
          ".indexOn": ["timestamp"]
        }
      }
    }
  }
}
```

3. Refactor `PresenceIndicator.tsx` to utilize `useOnlinePresence.ts` or refactor `useOnlinePresence.ts` to manage cleanup robustly.

### Recommendation 2: Extract `useChat` Hook & Enhance `MatchChat.tsx`

1. Create `src/hooks/useChat.ts` to encapsulate RTDB chat subscriptions, pagination state, and typing indicator state.
2. Implement optimistic error handling in `MatchChat.tsx`:
   ```typescript
   const handleSendMessage = async (e: React.FormEvent) => {
     e.preventDefault();
     const text = newMessage.trim();
     if (!text) return;
     setNewMessage('');
     try {
       await sendDirectMessage(text);
     } catch (err) {
       setNewMessage(text); // Restore text on failure
     }
   };
   ```

### Recommendation 3: Optimize Notification Queries & Expand Triggers

1. Update query in `NotificationBell.tsx`:
   ```typescript
   const q = query(
     collection(db, 'notifications'),
     where('userId', '==', appUser.uid),
     orderBy('createdAt', 'desc'),
     limit(50)
   );
   ```
2. Add missing composite index to `firestore.indexes.json`:
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "notifications",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "userId", "order": "ASCENDING" },
           { "fieldPath": "createdAt", "order": "DESCENDING" }
         ]
       }
     ]
   }
   ```
3. Expand notification creation in `src/lib/firebase/booking.ts` (e.g., in `useJoinMatch`, dispatch notification to match host).

---

## 6. Verification Method

To verify these findings and subsequent implementations:
1. **Security Rules Verification**: Validate `database.rules.json` using Firebase Emulator Suite (`firebase emulators:start --only database,firestore`).
2. **Presence Verification**: Open two browser sessions (authenticated player vs guest), check RTDB console for `/status` node updates on disconnect and reconnect.
3. **Notification Query Verification**: Trigger >50 test notifications for a single user and verify `NotificationBell` renders the most recent notification (`createdAt` timestamp).
