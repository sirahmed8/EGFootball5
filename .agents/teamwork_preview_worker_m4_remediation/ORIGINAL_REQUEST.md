## 2026-07-26T13:16:12Z
<USER_REQUEST>
You are Worker M4 (Remediation Pass) for EGFootball5 (kickoff).
Your working directory is `d:\football\kickoff\.agents\teamwork_preview_worker_m4_remediation`. Create your directory if needed and write `progress.md` and `handoff.md` there.

PROJECT ROOT: `d:\football\kickoff`

OBJECTIVE:
Remediate the M4 Gate Failures by fixing all TypeScript compilation errors and remaining physical directional / hardcoded string issues.

TASKS:
1. `src/app/[locale]/matches/page.tsx`:
   - Fix compilation error: `@base-ui/react` `<DialogTrigger>` does NOT accept `asChild`. Remove `asChild` (use `render={...}` or direct child trigger) at lines 45, 504, and any other occurrences.
   - Ensure translation function `t` (e.g. `const t = useTranslations('matches')` or appropriate namespace) is properly declared and in scope wherever `t(...)` is called.

2. Clean remaining physical directional classes:
   - Inspect and refactor physical classes (`text-right`, `ml-1`, `right-3`, `mr-`, `ml-`, `pl-`, `pr-`, `text-left`, `text-right`, `left-`, `right-`) to RTL-friendly logical utilities (`text-end`, `ms-1`, `end-3`, `me-`, `ms-`, `ps-`, `pe-`, `text-start`, `start-`) in:
     - `src/components/players/PlayersList.tsx`
     - `src/app/[locale]/profile/page.tsx`
     - `src/components/home/CountdownTimer.tsx`
     - `src/components/home/FeaturedStadiums.tsx`

3. Refactor remaining hardcoded strings:
   - In `src/components/admin/AdminOverviewCards.tsx` and `src/components/players/PlayersList.tsx`:
   - Replace any remaining hardcoded English text strings with `useTranslations()` keys. Update translation json files (`messages/en.json`, `messages/ar.json` or equivalent locale files) as required so no missing translation keys exist.

4. MANDATORY VERIFICATION:
   - Execute `npx tsc --noEmit` in `d:\football\kickoff` and confirm 0 TypeScript errors.
   - Execute `npm run build` in `d:\football\kickoff` and confirm clean production build with 0 errors.

5. HANDOFF REPORT:
   - Write `handoff.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m4_remediation\handoff.md` documenting:
     - All files modified and rationale
     - Commands run and verbatim stdout/stderr output of `npx tsc --noEmit` and `npm run build`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
</USER_REQUEST>

## 2026-07-26T13:16:13Z
**Context**: Additional M4 Remediation Requirements from Reviewer 1 & Challenger 2

**Content**: 
Please expand your M4 remediation scope to include the following specific fixes:

1. **Next.js Build & API Config Fix**:
   - In `next.config.ts`, remove `output: 'export'` to allow Next.js API routes (`src/app/api/...`) to compile cleanly during `npm run build`.

2. **DialogTrigger & Component Fixes**:
   - In `src/app/[locale]/matches/page.tsx`, remove invalid `asChild` prop from `<DialogTrigger>` (lines 45 & 504) and ensure `t` is declared and in scope.

3. **Complete Elimination of Remaining Hardcoded String Ternaries**:
   - Replace all remaining hardcoded `isArabic ? '...' : '...'` ternaries with proper `t('...')` i18n translation keys in `en.json` and `ar.json` across:
     - `src/app/[locale]/home/page.tsx` (Lines 558, 562-564, 574)
     - `src/app/[locale]/matches/page.tsx` (Lines 277-279, 398, 432)
     - `src/app/[locale]/book/page.tsx` (Lines 74, 357, 367, 377, 412, 416-418, 442, 453, 459, 563-565)
     - `src/app/[locale]/checkout/page.tsx` (Lines 306, 314, 324, 327, 334, 344, 348, 448, 460, 502, 512, 523, 529)
     - `src/app/[locale]/profile/page.tsx` (Lines 150, 243, 449-451, 478, 495)
     - `src/components/admin/AdminOverviewCards.tsx` & `src/components/players/PlayersList.tsx`

4. **Clean Remaining Physical CSS Classes**:
   - Convert remaining physical directional classes (`text-right`, `ml-1`, `right-3`, etc.) to logical utilities (`text-end`, `ms-1`, `end-3`, etc.) in `PlayersList.tsx`, `profile/page.tsx`, `CountdownTimer.tsx`, and `FeaturedStadiums.tsx`.

5. **Verification**:
   - Verify `npx tsc --noEmit` passes with 0 errors.
   - Verify `npm run build` succeeds cleanly with 0 errors.

**Action**: Implement all fixes and report back when verified.
