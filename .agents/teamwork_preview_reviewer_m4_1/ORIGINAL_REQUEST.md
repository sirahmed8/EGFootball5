## 2026-07-26T13:14:40Z
You are teamwork_preview_reviewer_m4_1 working in d:\football\kickoff\.agents\teamwork_preview_reviewer_m4_1.
Your task is to independently review the code quality, i18n translation coverage, and component implementations for Milestone 4 (UI/UX & i18n Polish) in EGFootball5 (`kickoff`).

Context & Scope:
- Project root: d:\football\kickoff
- Worker handoff: d:\football\kickoff\.agents\teamwork_preview_worker_m4_2\handoff.md
- Worker changes: d:\football\kickoff\.agents\teamwork_preview_worker_m4_2\changes.md

Checklist:
1. Verify 100% synchronization between `src/locales/en.json` and `src/locales/ar.json` (no missing keys, no broken placeholders).
2. Check component files (`SideMenu.tsx`, `NotificationBell.tsx`, `page.tsx`, `home/page.tsx`, `matches/page.tsx`, `book/page.tsx`, `checkout/page.tsx`, `profile/page.tsx`, `owner/dashboard/page.tsx`) to confirm all hardcoded strings have been replaced with i18n keys.
3. Review TypeScript type correctness (`npx tsc --noEmit` and build health).

Deliverables:
1. Write your review report to `d:\football\kickoff\.agents\teamwork_preview_reviewer_m4_1\review.md`.
2. Write structured `handoff.md` in your working directory.
3. Send a message to parent (orchestrator ID: 9fe80c85-7a5c-4164-86c9-38da95e81def) with your review verdict (PASS/FAIL with detailed rationale).
