## 2026-07-26T13:10:03Z
You are teamwork_preview_worker_m4_2 working in d:\football\kickoff\.agents\teamwork_preview_worker_m4_2.

Your task is to implement Milestone 4: UI/UX & Frontend Polish (100x Improvement) for EGFootball5 (`kickoff`).

Context & Inputs:
- Project root: d:\football\kickoff
- Scope document: d:\football\kickoff\PROJECT.md
- Requirements document: d:\football\kickoff\.agents\orchestrator\ORIGINAL_REQUEST.md
- Baseline Audit Analysis (UI/UX): d:\football\kickoff\.agents\teamwork_preview_explorer_m1_2\analysis.md

Detailed Work Items for Milestone 4:
1. i18n & Translation Completeness (100% Arabic & English):
   - Upgrade `src/locales/en.json` and `src/locales/ar.json` dictionaries to cover all UI strings across Player, Pitch Admin, Owner dashboards, landing pages, booking workflows, checkout, matches, profile, navigation, and notifications.
   - Eliminate all hardcoded text and inline `isArabic ? '...' : '...'` ternaries in components (`SideMenu.tsx`, `NotificationBell.tsx`, `page.tsx`, `home/page.tsx`, `matches/page.tsx`, `book/page.tsx`, `checkout/page.tsx`, `profile/page.tsx`, `owner/dashboard/page.tsx`, `admin/dashboard/page.tsx`).
   - Ensure 100% dictionary key sync between AR and EN locales.
2. RTL/LTR Layout & Directional Alignment:
   - Convert physical CSS classes (`mr-`, `ml-`, `pl-`, `pr-`, `left-`, `right-`, `file:mr-`) to logical classes or flex/grid gap / start/end utilities to ensure icons, text, and inputs align without overlap in Arabic (RTL) and English (LTR).
   - Fix mobile drawer direction in `SideMenu.tsx` for proper RTL sliding.
3. Theme & Typography Polish:
   - Remove inline hardcoded `style={{ backgroundColor: '#090d16', color: '#ffffff' }}` on `html`/`body` in `layout.tsx` so `next-themes` light/dark mode toggling works dynamically.
   - Ensure clean Arabic font rendering (`Cairo`/`Tajawal` or system fallback) when `lang="ar"`.
4. Dashboards & Component Enhancements:
   - Polish Player Dashboard, Pitch Admin Dashboard, Platform Owner Dashboard, Landing Page, Booking, Checkout, and Match Lobby.
   - Add Framer Motion subtle micro-animations, loading skeletons, dark/light theme consistency, and interactive feedback states.
   - Fix component bugs: replace invalid `DialogTrigger render` prop in `MatchesPage` with valid Radix/Shadcn trigger pattern.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification Steps for Worker:
- Execute `npx tsc --noEmit` and `npm run build` to verify 0 TypeScript and build errors.
- Document all modified files, test outputs, and verification results in your handoff.

Deliverables:
1. Implement all code & configuration changes directly in `d:\football\kickoff`.
2. Write `changes.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m4_2\changes.md`.
3. Write `handoff.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m4_2\handoff.md`.
4. Send a message to parent (orchestrator ID: 9fe80c85-7a5c-4164-86c9-38da95e81def) reporting completion and build/test results.
