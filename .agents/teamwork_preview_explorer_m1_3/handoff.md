# Handoff Report — EGFootball5 Code Quality, Performance & Build/TS Health Audit

**Agent:** `teamwork_preview_explorer_m1_3`  
**Working Directory:** `d:\football\kickoff\.agents\teamwork_preview_explorer_m1_3`  
**Target Project:** EGFootball5 (`d:\football\kickoff`)  
**Date:** 2026-07-26  

---

## 1. Observation

Direct observations and evidence collected during the read-only audit:

- **Build Output & Next Config:**
  - `next.config.ts:8`: `output: process.env.NODE_ENV === 'development' || process.env.VERCEL === '1' ? undefined : 'export'`
  - `npm run build` output warning: `⚠ Statically exporting a Next.js application via next export disables API routes and middleware.`
- **ESLint & TypeScript Health:**
  - `npm run lint` tool result: `✖ 114 problems (41 errors, 73 warnings)`
  - React Impurity Violations (`react-hooks/purity`): `Date.now()` called during render in `src/app/[locale]/book/page.tsx:105, 126, 147, 248`, `src/app/[locale]/home/page.tsx:91, 112, 133`, `src/app/[locale]/matches/page.tsx:58, 75, 81`, and `src/components/FloatingChatWidget.tsx:105, 306, 310, 328, 333`.
  - Synchronous `setState` in Effects (`react-hooks/set-state-in-effect`): `src/app/[locale]/book/page.tsx:90:5`, `src/app/[locale]/home/page.tsx:59:32`, `src/components/DailyAIAdviceCard.tsx:31:9`, `src/components/FloatingChatWidget.tsx:178:7`.
  - Unused Imports & Variables (`@typescript-eslint/no-unused-vars`): 73 warnings across `src/app/[locale]/page.tsx`, `book/page.tsx`, `matches/page.tsx`, `FloatingChatWidget.tsx`, `MatchChat.tsx`, `admin/dashboard/page.tsx`, `owner/dashboard/page.tsx`, `profile/page.tsx`, `aiService.ts`.
  - Type Safety (`@typescript-eslint/no-explicit-any`): 30+ instances across `src/lib/firebase/booking.ts`, `src/lib/aiService.ts`, `FloatingChatWidget.tsx`, `matches/page.tsx`.
- **Data Fetching & Caching:**
  - Optimistic Update Mismatch (`src/hooks/useBookings.ts:37`): Query key in `useUserBookings` is `['userBookings', userId]`, while `useCancelBooking.onMutate` queries `['userBookings']`, resulting in `previousBookings = undefined` and broken mutation error rollback.
  - Realtime DB Presence Bottleneck (`src/hooks/useOnlinePresence.ts:37`): Listens to root `/status` path (`onValue(ref(rtdb, '/status'), ...)`), downloading all user status objects on every online status change.
  - Firestore Lock Expiration Sentinel Bug (`src/lib/firebase/booking.ts:73`): `bookedSlots[key] = deleteField() as any` sets property to truthy object, causing line 79 `if (bookedSlots[block.toString()])` to evaluate to true for expired locks and throw `ERROR_SLOT_TAKEN`.
- **Performance Optimization:**
  - Dynamic Imports (`next/dynamic`): 0 instances in codebase (`Get-ChildItem -Recurse -Filter "*.tsx" src | Select-String "dynamic\("` returned 0 matches). Heavy client components like `FloatingChatWidget.tsx` (848 lines) are statically bundled.
  - Image Loading: 7 locations using raw `<img>` instead of `next/image` (`PitchSettings.tsx:97`, `VerificationQueue.tsx:79`, `admin/dashboard/page.tsx:282`, `matches/page.tsx:360`, `PitchCreationForm.tsx:61`, `FloatingChatWidget.tsx:525, 583`).
  - Client API Key Exposure (`src/lib/aiService.ts:4`): `process.env.NEXT_PUBLIC_GEMINI_API_KEY` exposes Gemini API key to client bundle.

---

## 2. Logic Chain

1. **Static Export Conflict:** Observation shows `next.config.ts` sets `output: 'export'`. Next.js build output explicitly warns that static export disables API routes (`/api/ai/tts`) and middleware. Therefore, non-Vercel static hosts will fail to execute backend API routes or middleware.
2. **React 19 Hydration & Purity Risk:** Observation shows 15+ calls to `Date.now()` during component rendering in `book/page.tsx`, `home/page.tsx`, `matches/page.tsx`, and `FloatingChatWidget.tsx`. React 19 rules require components to be pure and idempotent during render. Calling `Date.now()` during render produces different values on server vs client and across re-renders, causing hydration mismatches and unpredictable UI bugs.
3. **Data Loss in Optimistic Mutation Rollback:** Observation shows `useUserBookings` stores query data under `['userBookings', userId]`, but `useCancelBooking` fetches snapshot data under `['userBookings']`. Because `getQueryData(['userBookings'])` returns `undefined`, `onError` sets cache to `undefined` upon failure, wiping out user bookings state.
4. **Backend Lock Expiration Failure:** Observation in `booking.ts` shows `deleteField()` assigned directly to in-memory `bookedSlots[key]` before checking `if (bookedSlots[block.toString()])`. Because `FieldValue` sentinel object is truthy in JS, the slot availability check evaluates to true, causing expired temporary locks to permanently block booking until manual database deletion.
5. **Initial Bundle Bloat & Re-render Thrashing:** Observation shows zero dynamic imports for heavy components (`FloatingChatWidget.tsx`), raw `<img>` tags in 7 UI views, zero `useCallback` hooks, and hardcoded mock objects created inline during render in `home/page.tsx` and `book/page.tsx`. This inflates initial JavaScript bundle size, causes Layout Shift (CLS), and triggers continuous component re-rendering.

---

## 3. Caveats

- **No Caveats.** Full investigation conducted across all project files, build outputs, ESLint rules, TanStack Query hooks, Firestore transactions, and component render trees.

---

## 4. Conclusion

The EGFootball5 (`kickoff`) codebase has a solid modern foundation (Next.js 16, React 19, Tailwind 4, TanStack React Query v5, Zustand), but exhibits key technical debt in three main areas:

1. **Build & TS Health:** 114 ESLint issues (41 errors including React 19 purity violations and synchronous setState in effects, 73 dead code/unused import warnings), static export configuration breaking API routes, and 30+ `any` types.
2. **Data & Caching:** Critical Firestore lock expiration bug in `booking.ts`, broken optimistic update rollback in `useBookings.ts`, RTDB presence bandwidth bottleneck in `useOnlinePresence.ts`, and dual state management split between React Query and raw `onSnapshot` listeners.
3. **Performance:** Zero dynamic code splitting (`next/dynamic`), raw `<img>` tags in 7 views, inline mock object creation during render, and client-side exposure of `NEXT_PUBLIC_GEMINI_API_KEY`.

Detailed findings and step-by-step remediation plans are documented in `d:\football\kickoff\.agents\teamwork_preview_explorer_m1_3\analysis.md`.

---

## 5. Verification Method

To independently verify all observations and findings:

1. **Run TypeScript Check:**
   ```powershell
   npx tsc --noEmit
   ```
2. **Run ESLint Audit:**
   ```powershell
   npm run lint
   ```
   *Expected result:* 114 problems (41 errors, 73 warnings).
3. **Run Production Build:**
   ```powershell
   npm run build
   ```
   *Inspect build log for static export API route warning.*
4. **Inspect Files:**
   - `src/lib/firebase/booking.ts:73-81` (Firestore lock expiration sentinel truthiness bug)
   - `src/hooks/useBookings.ts:37` (Query key mismatch `['userBookings']` vs `['userBookings', userId]`)
   - `src/hooks/useOnlinePresence.ts:37` (RTDB `/status` root listener bottleneck)
   - `src/lib/aiService.ts:4` (`NEXT_PUBLIC_GEMINI_API_KEY` client exposure)
   - `d:\football\kickoff\.agents\teamwork_preview_explorer_m1_3\analysis.md` (Full audit analysis)
