# Project: EGFootball5 100x Overhaul

## Architecture
- Next.js 15 App Router (`src/app`)
- React 19 / TypeScript / Tailwind CSS / Framer Motion
- Firebase (Auth, Firestore, Realtime Database)
- TanStack React Query for data fetching, caching, and state management
- Lucide React icons / Radix UI / Shadcn components
- i18n localization (Arabic / English, RTL / LTR support)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Baseline Technical Exploration | Exploration across UI, Backend, Security, Perf | None | DONE |
| 2 | Security Hardening & RBAC | API routes, firestore.rules, RBAC roles, input validation | M1 | DONE |
| 3 | Backend & Firestore Architecture | Firestore indexes, React Query patterns, realtime presence, match lobby | M1, M2 | DONE |
| 4 | UI/UX & i18n Polish | Player/Admin/Owner dashboards, landing, Framer Motion, AR/EN i18n | M1, M3 | DONE |
| 5 | Performance & Clean Code Refactoring | Dead code cleanup, bundle optimization, TS/lint fixes | M1, M4 | DONE |
| 6 | E2E Verification & Final Audit | Full E2E verification, adversarial testing, forensic audit | M1-M5 | DONE |

## Interface Contracts
### Client ↔ Firestore / Realtime DB
- Role-based security rules enforce access to `users`, `pitches`, `bookings`, `matches`, `chats`, `notifications`.
- Realtime DB manages online presence: `/status/{uid}`.

### Client ↔ Next.js API Routes
- Auth header / Firebase ID Token validation on all protected endpoints (`/api/admin/...`, `/api/bookings/...`, `/api/matches/...`).

## Code Layout
- `src/app`: Next.js App Router pages and API endpoints.
- `src/components`: Dashboards (Player, Pitch Admin, Owner), landing, booking workflow, match lobby, modals, shared UI.
- `src/lib`: Firebase setup, query client, i18n locales, helper utilities.
- `src/hooks`: Auth hooks, Firestore hooks, Realtime DB hooks.
- `firestore.rules`: Security rules for Firestore.
- `firestore.indexes.json`: Custom Firestore composite indexes.
