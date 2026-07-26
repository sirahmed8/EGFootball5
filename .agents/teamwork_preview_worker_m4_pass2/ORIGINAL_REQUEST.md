## 2026-07-26T13:22:05Z

<USER_REQUEST>
You are Worker M4 (Pass 2 — RTL & i18n Polish) for EGFootball5 (`d:\football\kickoff`).
Your working directory is `d:\football\kickoff\.agents\teamwork_preview_worker_m4_pass2`. Create your directory and write `handoff.md`.

PROJECT ROOT: `d:\football\kickoff`

OBJECTIVE:
Fix missing Arabic translation keys and replace all lingering physical directional CSS classes with Tailwind logical utilities.

TASKS:
1. i18n Translation Parity:
   - In `src/messages/ar.json` and `src/locales/ar.json`:
     - Under `Profile` object, add:
       - `"profileUpdatedSuccess": "تم تحديث الملف الشخصي بنجاح!"`
       - `"favoritePitchesTitle": "الملاعب المفضلة لإعادة الحجز السريع"`
       - `"depositLabel": "العربون"`
   - Confirm key count and keys match `en.json` (522 keys).

2. Refactor Physical Directional Utilities to RTL Logical Utilities:
   - `src/components/ui/select.tsx`: Replace `text-left` with `text-start`, `pl-` with `ps-`, `pr-` with `pe-`, `right-` with `end-`.
   - `src/components/ui/table.tsx`: Replace `text-left` with `text-start`, `pr-0` with `pe-0`.
   - `src/components/DailyAIAdviceCard.tsx`: Replace `right-0` with `end-0`.
   - `src/components/Navbar.tsx`: Replace `left-0 right-0` with `start-0 end-0`.
   - `src/components/SideMenu.tsx`: Replace `right-0`/`left-0` with `end-0`/`start-0`, `border-l`/`border-r` with `border-e`/`border-s`, `rounded-l`/`rounded-r` with `rounded-e`/`rounded-s`.
   - `src/components/ui/button.tsx`, `src/components/ui/calendar.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/dropdown-menu.tsx`, `src/components/ui/tabs.tsx`:
     Replace physical `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `border-l`, `border-r`, `rounded-l`, `rounded-r` with logical `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`, `border-e`, `rounded-s`, `rounded-e`.

3. MANDATORY VERIFICATION:
   - Execute `npx tsc --noEmit` and confirm 0 errors.
   - Execute `npm run build` and confirm clean compilation with 0 errors.

4. HANDOFF REPORT:
   - Write `handoff.md` in `d:\football\kickoff\.agents\teamwork_preview_worker_m4_pass2\handoff.md` with modified files list and verbatim outputs of `npx tsc --noEmit` and `npm run build`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
</USER_REQUEST>
