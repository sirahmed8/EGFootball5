## 2026-07-26T13:37:04Z

<USER_REQUEST>
You are teamwork_preview_worker_m6_remediation working in d:\football\kickoff\.agents\teamwork_preview_worker_m6_remediation.

Your task is to implement the M6 Remediation Fixes for EGFootball5 (`kickoff`).

Context & Inputs:
- Project root: d:\football\kickoff
- Scope document: d:\football\kickoff\PROJECT.md
- Requirements document: d:\football\kickoff\.agents\orchestrator\ORIGINAL_REQUEST.md
- Final Reviewer Report: d:\football\kickoff\.agents\teamwork_preview_reviewer_m6_1\review.md

Work Items to Complete:
1. Fix `src/components/FloatingChatWidget.tsx`:
   - Replace all explicit `any` types (lines 279, 280, 287, 293, 294, 295) with proper TypeScript types (`SpeechRecognitionEvent`, `SpeechRecognitionErrorEvent`, or safe typed interfaces).
   - Convert physical CSS classes (`pr-1`, `pl-8`, `pr-2`, `text-left`) to logical Tailwind classes (`pe-1`, `ps-8`, `pe-2`, `text-start`).
   - Replace hardcoded inline string ternaries (`isArabic ? '...' : '...'`) with proper i18n keys using `t('...')` from `useTranslations()`.
2. Fix ESLint Configuration & Ignored Paths:
   - In `eslint.config.mjs`, ensure `.agents/**` is added to `ignores` array so eslint does not scan temporary metadata files inside `.agents/`.
3. Verification:
   - Run `npx tsc --noEmit` (0 errors required).
   - Run `npm run lint` or `npx eslint src` (0 errors required).
   - Run `npm run build` (0 build errors required).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliverables:
1. Implement all code & configuration changes directly in `d:\football\kickoff`.
2. Write `changes.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m6_remediation\changes.md`.
3. Write `handoff.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m6_remediation\handoff.md`.
4. Send a message to parent (orchestrator ID: 9fe80c85-7a5c-4164-86c9-38da95e81def) reporting completion and build/lint results.
</USER_REQUEST>
