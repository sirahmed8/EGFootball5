# Original User Request

## 2026-07-26T12:31:00Z

# Teamwork Project Prompt — EGFootball5 100x Overhaul

Full 100x overhaul, feature expansion, performance optimization, security hardening, UI/UX polish, and clean code refactoring for EGFootball5 (`kickoff`).

Working directory: d:\football\kickoff
Integrity mode: development

## Requirements

### R1. UI/UX & Frontend Polish (100x Improvement)
- Upgrade all player, admin, owner dashboards, landing pages, booking workflows, and navigation.
- Implement responsive design, subtle animations (Framer Motion), dark/light theme consistency, loading skeletons, and interactive state feedback.
- Ensure 100% i18n support (Arabic / English) without missing keys or alignment issues in RTL/LTR.

### R2. Backend, Realtime & Firestore Architecture
- Audit and strengthen Firestore rules (`firestore.rules`), indexes (`firestore.indexes.json`), and Realtime Database structure.
- Refactor data fetching and mutations to use optimized TanStack React Query patterns, proper caching, and optimistic UI updates.
- Enhance match lobby chats, notifications, presence tracking, and booking status transitions.

### R3. Security Hardening & Data Integrity
- Secure API routes (`src/app/api/...`), enforce strict role-based access control (Player / Pitch Admin / Platform Owner).
- Prevent unauthorized mutations, sanitize user inputs, and protect sensitive environment configurations.
- Verify security rule coverage and eliminate any implicit `allow read, write: if true;` or unauthenticated bypasses.

### R4. Performance & Code Quality Clean Code Overhaul
- Eliminate unused code, dead imports, and redundant state handlers.
- Optimize image loads, dynamic imports, bundle size, and component renders.
- Verify zero TypeScript or linting errors, ensuring clean production builds.

## Acceptance Criteria

### Verification & Health
- [ ] Clean compilation with zero TypeScript errors or warnings during `npm run build`.
- [ ] All pages (Landing, Home, Matches, Book, Checkout, Admin, Owner, Profile) render error-free across English and Arabic locales.
- [ ] Firebase Auth, Firestore permissions, and Realtime DB presence operate securely with strict RBAC rules.
- [ ] Responsive UI functions smoothly on mobile, tablet, and desktop viewports.

## 2026-07-26T16:08:14Z

You are the replacement Project Orchestrator for EGFootball5 100x Overhaul.
Your working directory is d:\football\kickoff\.agents\orchestrator.
The project root directory is d:\football\kickoff.
Please read d:\football\kickoff\.agents\ORIGINAL_REQUEST.md for full requirements.
Current status:
- M1 (Baseline Exploration & Audit), M2 (Security Hardening & RBAC), and M3 (Backend, Realtime & Firestore Architecture) are fully COMPLETED and verified.
- M4 (UI/UX & i18n Polish) was in progress. Worker `teamwork_preview_worker_m4_1` was dispatched.
Please resume orchestrating from Milestone 4 through Milestone 5 (Performance & Clean Code Refactoring) and Milestone 6 (E2E Verification & Final Audit). Once all acceptance criteria are verified with clean build (`npm run build`), report victory / completion.

## 2026-07-26T16:15:46Z

You are the gen2 Project Orchestrator for EGFootball5 100x Overhaul.
Resume work at d:\football\kickoff\.agents\orchestrator.
Read handoff.md, BRIEFING.md, ORIGINAL_REQUEST.md, progress.md, and d:\football\kickoff\PROJECT.md for current state.
Your parent is 25360653-2f84-4e20-ab3e-48701a9f73f3 — use this ID for all escalation and status reporting via send_message.

Immediate tasks for gen2 Orchestrator:
1. Remediate M4 Gate Failure:
   - Dispatch Worker M4 (remediation pass) to fix `src/app/[locale]/matches/page.tsx` (remove `asChild` from `@base-ui/react` `<DialogTrigger>` at lines 45 & 504, ensure `t` is declared), clean remaining physical directional classes (`text-right`, `ml-1`, `right-3`) in `PlayersList.tsx`, `profile/page.tsx`, `CountdownTimer.tsx`, `FeaturedStadiums.tsx`, and refactor remaining hardcoded strings in `AdminOverviewCards.tsx`, `PlayersList.tsx`.
   - Require worker to verify `npx tsc --noEmit` and `npm run build` pass with 0 errors.
   - Run gate verification (2 Reviewers, 2 Challengers, 1 Forensic Auditor). Confirm all pass cleanly before marking M4 DONE.
2. Execute Milestone 5 (Performance & Clean Code Refactoring):
   - Dispatch Worker M5 to eliminate unused code, dead imports, redundant state handlers, optimize bundle size and dynamic imports.
   - Verify `npx tsc --noEmit` and `npm run build`.
   - Run gate verification.
3. Execute Milestone 6 (E2E Verification & Final Audit):
   - Perform full E2E verification across all 33 routes in English and Arabic locales.
   - Ensure clean compilation (`npm run build`).
   - Obtain Forensic Auditor CLEAN verdict and report victory / completion.


