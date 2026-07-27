# 🛡️ Security Policy & Rules Hardening

## Overview
Kickoff (EGFootball5) enforces strict multi-tenant role-based access control (RBAC) across Firebase Auth, Firestore Security Rules, and Realtime Database rules.

---

## 🔒 User Roles & Privileges

1. **Player (`role: 'player'`)**:
   - Can read public stadium listings and public match lobbies.
   - Can lock a slot for 15 minutes, upload payment receipts, and manage personal bookings.
   - Can create support tickets and participate in community chat.
   - Cannot modify pitch pricing, lock operational schedules, or upgrade user roles.

2. **Pitch Admin (`role: 'admin'`)**:
   - Assigned to specific pitch IDs via `adminEmail`.
   - Can approve/reject pending deposit receipts for assigned pitches.
   - Can toggle schedule locks and blacklist non-attending players.
   - Cannot alter global platform settings or delete other pitch admins.

3. **Platform Owner (`role: 'owner'`)**:
   - Super-admin privileges.
   - Can add/remove platform cities (`settings/cities`).
   - Can register new stadiums and assign Pitch Admin emails.
   - Can upgrade/downgrade user roles (`player` <-> `admin` <-> `owner`).

---

## 🛡️ Firestore Rule Coverage

The `firestore.rules` file secures the following collections:
- `users`: Self-read/write for profile fields; role & blacklist updates restricted to Admins/Owners.
- `pitches`: Public read; create/update restricted to assigned pitch admins and platform owners.
- `bookings`: Read restricted to booking owner, public match joiners, and pitch admins. Lock creation enforces valid duration and deposit amounts.
- `day_schedules`: Slot modifications strictly guarded to prevent schedule wiping.
- `communities`: Public read; creation authenticated; updates restricted to squad captains.
- `community_chat`: Public read; message creation verified by `request.auth.uid == senderId`.
- `announcements` & `leaderboard`: Public read; write access restricted to Admins.
- `support_tickets`: Restricted to ticket creator and platform admins.
