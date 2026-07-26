## 2026-07-26T09:36:32Z
You are teamwork_preview_worker_m2_1 working in d:\football\kickoff\.agents\teamwork_preview_worker_m2_1.

Your task is to implement Milestone 2: Security Hardening & RBAC for EGFootball5 (`kickoff`).

Context & Inputs:
- Project root: d:\football\kickoff
- Scope document: d:\football\kickoff\PROJECT.md
- Requirements document: d:\football\kickoff\.agents\orchestrator\ORIGINAL_REQUEST.md
- Security Audit Analysis: d:\football\kickoff\.agents\teamwork_preview_explorer_m1_1\analysis.md

Detailed Work Items for Milestone 2:
1. Firestore Security Rules (`firestore.rules`):
   - Fix direct write vulnerability in `match /day_schedules/{dayId}`: prevent arbitrary user writes to `slots`. Require admin/owner authorization or validated status transitions.
   - Fix notification creation restriction in `match /notifications/{notifId}`: update rule so `cancelBooking()` can write notifications when `request.auth.uid == request.resource.data.userId` or created by pitch admins/owners.
   - Audit and tighten all collections (`users`, `pitches`, `bookings`, `matches`, `chats`, `notifications`) ensuring no unauthenticated or wildcard bypasses exist.
2. Realtime Database Security Rules (`database.rules.json`):
   - Create `database.rules.json` at project root with strict security rules:
     - `/status/$uid`: readable by authenticated users, writable only by `auth != null && auth.uid === $uid`.
     - `/chats/$matchId`: readable and writable only by authenticated users (`auth != null`).
3. Secure API Routes & Role-Based Access Control (`src/app/api/...`):
   - Audit and secure `/api/ai/tts/route.ts` and all API endpoints in `src/app/api/...`. Enforce proper token signature verification and role checks (Player / Pitch Admin / Platform Owner).
   - Sanitize inputs and enforce RBAC on server side.
4. Protect Environment Configurations & API Keys:
   - Remove client-side exposure of `NEXT_PUBLIC_GEMINI_API_KEY` in `src/lib/aiService.ts` or update AI calls to execute through server API routes with server-side environment variables.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification Steps for Worker:
- Run compilation/lint check or build command (`npm run build` or `npx tsc --noEmit`) to ensure no build/type errors were introduced.
- Document all modified files, test outputs, and verification results in your handoff.

Deliverables:
1. Implement all code & configuration changes directly in `d:\football\kickoff`.
2. Write `changes.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m2_1\changes.md`.
3. Write `handoff.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m2_1\handoff.md`.
4. Send a message to parent (orchestrator ID: 9fe80c85-7a5c-4164-86c9-38da95e81def) reporting completion and build/test results.
