## 2026-07-26T13:20:15Z
You are teamwork_preview_worker_m5_1 working in d:\football\kickoff\.agents\teamwork_preview_worker_m5_1.

Your task is to implement Milestone 5: Performance & Clean Code Refactoring for EGFootball5 (`kickoff`).

Context & Inputs:
- Project root: d:\football\kickoff
- Scope document: d:\football\kickoff\PROJECT.md
- Requirements document: d:\football\kickoff\.agents\orchestrator\ORIGINAL_REQUEST.md
- Code Quality & Build Audit Analysis: d:\football\kickoff\.agents\teamwork_preview_explorer_m1_3\analysis.md

Detailed Work Items for Milestone 5:
1. Eliminate Dead & Unused Code:
   - Audit and delete dead files, unused imports, unused variables, and redundant state handlers across `src/app`, `src/components`, `src/lib`, `src/hooks`.
2. Dynamic Imports (`next/dynamic`) & Code Splitting:
   - Implement `next/dynamic` with loading skeletons for heavy client components (e.g. `FloatingChatWidget`, `MatchChat`, heavy dashboard charts/modals) to optimize bundle size and initial page loads.
3. Next.js Image Optimization:
   - Replace any unoptimized `<img>` tags with Next.js `<Image />` (`next/image`) with proper `width`, `height`, `alt`, and responsive sizing.
4. React Component & Hooks Performance Optimization:
   - Add `useCallback` and `useMemo` for event handlers and expensive state derivations to eliminate unnecessary component re-renders.
   - Fix React 19 purity issues (e.g. `Date.now()` or side-effects during render cycles).
5. Strict Type Safety & ESLint Clean Code Fixes:
   - Replace explicit `any` types with strict TypeScript interfaces or generics across hooks, services, and API routes.
   - Fix remaining ESLint errors and warnings across the project.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification Steps for Worker:
- Execute `npx tsc --noEmit` to verify 0 TypeScript errors.
- Execute `npm run build` to verify 0 build errors and clean production compilation.
- Document all modified files, test outputs, and verification results in your handoff.

Deliverables:
1. Implement all code & configuration changes directly in `d:\football\kickoff`.
2. Write `changes.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m5_1\changes.md`.
3. Write `handoff.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m5_1\handoff.md`.
4. Send a message to parent (orchestrator ID: 9fe80c85-7a5c-4164-86c9-38da95e81def) reporting completion and build/test results.
