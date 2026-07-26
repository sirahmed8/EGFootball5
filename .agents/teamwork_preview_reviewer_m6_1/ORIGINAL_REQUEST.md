## 2026-07-26T13:34:34Z
You are teamwork_preview_reviewer_m6_1 working in d:\football\kickoff\.agents\teamwork_preview_reviewer_m6_1.

Your task is to independently review and audit all project requirements (R1: UI/UX & i18n, R2: Backend & Firestore/RTDB, R3: Security & RBAC, R4: Performance & Clean Code) for Milestone 6 of EGFootball5 (`kickoff`).

Context & Scope:
- Project root: d:\football\kickoff
- Scope document: d:\football\kickoff\PROJECT.md
- Requirements document: d:\football\kickoff\.agents\orchestrator\ORIGINAL_REQUEST.md

Review Checklist:
1. R1: Verify 100% Arabic & English i18n coverage, 500+ synchronized keys in `en.json` & `ar.json`, RTL/LTR logical classes (`ms-`, `me-`, `ps-`, `pe-`), `next-themes` dynamic toggling, `Cairo` Arabic font, Framer Motion animations, and dashboard polish.
2. R2: Verify Firestore indexes (`firestore.indexes.json`), React Query caching & optimistic UI, Realtime DB `/status/$uid` presence, and live match chat.
3. R3: Verify `firestore.rules`, `database.rules.json`, server ID token verification in `src/lib/auth/serverAuth.ts`, secured API routes (`/api/ai/tts`, `/api/ai/chat`, `/api/admin/role`), and no client-side secret exposure.
4. R4: Verify zero dead code, dynamic imports (`next/dynamic`), Next.js `<Image />` optimization, React 19 purity, zero explicit `any` types, and 0 TS/ESLint errors.

Deliverables:
1. Write your review report to `d:\football\kickoff\.agents\teamwork_preview_reviewer_m6_1\review.md`.
2. Write structured `handoff.md` in your working directory.
3. Send a message to parent (orchestrator ID: 9fe80c85-7a5c-4164-86c9-38da95e81def) with your verdict (PASS/FAIL).
