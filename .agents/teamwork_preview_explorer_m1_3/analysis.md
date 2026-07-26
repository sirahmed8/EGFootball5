# Comprehensive Audit Report: EGFootball5 Code Quality, Performance & Build/TS Health

**Date:** July 26, 2026  
**Auditor:** `teamwork_preview_explorer_m1_3`  
**Target:** EGFootball5 (`kickoff`)  
**Scope:** Build & TS Health, Data Fetching & Caching, Performance Optimization  

---

## Executive Summary

A comprehensive investigation was conducted across the EGFootball5 (`kickoff`) codebase to evaluate TypeScript health, build configuration, ESLint compliance, data fetching & caching strategies (TanStack React Query, Firestore & Realtime DB), and performance optimization techniques.

### Key Metrics Summary
- **ESLint Problems:** 114 Total (41 Errors, 73 Warnings)
- **TypeScript Health:** 1 TS Error in `src/app/api/ai/tts/route.ts` prior to `.next` generation; passing after `.next` build.
- **Build Output:** Static export mode enabled (`output: 'export'`), disabling Next.js API routes and middleware in static hosting.
- **React Query Adoption:** Limited to 3 hooks (`useBookings`, `useMatches`, `usePitches`), while main pages rely on raw Firestore `onSnapshot` inside `useEffect`.
- **Dynamic Imports (`next/dynamic`):** 0 instances across the entire codebase.
- **`useCallback` Usage:** 0 instances across the entire codebase.
- **Image Optimization:** 7 locations using raw `<img>` instead of `next/image`.

---

## Section 1: Build & TypeScript Health Audit

### 1.1 Next.js Build Configuration & Export Caveat
- **Observation:** `next.config.ts` (line 8) sets `output: process.env.NODE_ENV === 'development' || process.env.VERCEL === '1' ? undefined : 'export'`.
- **Impact:** Static export mode disables Next.js API routes (`src/app/api/ai/tts/route.ts`) and Next.js middleware in non-Vercel static deployments. Furthermore, `images.unoptimized` is enabled when not on Vercel, bypassing image compression and format conversion (WebP/AVIF).
- **Recommendation:** If the application requires API routes (such as rate-limited TTS or Gemini AI proxy), standard Node.js server deployment or standalone mode (`output: 'standalone'`) should be configured rather than static export.

### 1.2 TypeScript Errors & Type Safety
- **Observation 1:** `src/app/api/ai/tts/route.ts:8` initially threw `error TS2339: Property 'ip' does not exist on type 'NextRequest'` prior to Next.js type generation.
- **Observation 2 (`@typescript-eslint/no-explicit-any`):** Over 30 instances of explicit `any` types were detected across critical modules:
  - `src/lib/firebase/booking.ts`: lines 73, 190, 225, 374
  - `src/lib/aiService.ts`: lines 118, 142
  - `src/components/FloatingChatWidget.tsx`: lines 68, 77, 112, 236, 249, 251, 256, 337, 391
  - `src/app/[locale]/home/page.tsx`: line 307
  - `src/app/[locale]/matches/page.tsx`: lines 55, 78, 296
- **Impact:** Bypasses compile-time type safety, masking runtime `undefined`/`null` errors during state transformations.
- **Recommendation:** Replace all `any` usages with strict interface contracts (`Booking`, `Pitch`, `SupportMessage`, `NextRequest`) and type guards.

### 1.3 React Compiler & Hooks Violations (41 Errors)

#### A. Calling Impure Functions During Render (`react-hooks/purity`)
- **Observation:** `Date.now()` is called directly inside component render bodies or inline object definitions:
  - `src/app/[locale]/book/page.tsx`: lines 105, 126, 147 (`createdAt: Date.now()`), line 248 (`const now = Date.now()`)
  - `src/app/[locale]/home/page.tsx`: lines 91, 112, 133 (`createdAt: Date.now()`)
  - `src/app/[locale]/matches/page.tsx`: line 58 (`createdAt: Date.now()`), line 75 (`new Date(Date.now() + 86400000)`), line 81 (`createdAt: Date.now()`)
  - `src/components/FloatingChatWidget.tsx`: lines 105, 306, 310, 328, 333 (`id: \`usr-${Date.now()}\``, `timestamp: Date.now()`)
- **Impact:** Violates React 19 component purity rules. Calling `Date.now()` during render produces unstable results on component re-renders, causing SSR/CSR hydration mismatches.
- **Recommendation:** Move dynamic timestamp creation into initial state lazy initializers (`useState(() => Date.now())`), `useEffect`, or event handler callbacks.

#### B. Synchronous `setState` Inside `useEffect` (`react-hooks/set-state-in-effect`)
- **Observation:** Synchronous state setters executed directly in effect bodies:
  - `src/app/[locale]/book/page.tsx:90:5`: `useEffect(() => { setDate(new Date()); }, []);`
  - `src/app/[locale]/home/page.tsx:59:32`: `useEffect(() => { if (searchParams.get('q')) setSearchQuery(...); }, [searchParams]);`
  - `src/components/DailyAIAdviceCard.tsx:31:9`: `setUsedCount(isNaN(parsed) ? 0 : parsed)`
  - `src/components/FloatingChatWidget.tsx:178:7`: `setSelectedTicketId(userTicketId)`
- **Impact:** Causes cascading re-renders and unnecessary layout passes immediately after initial mount.
- **Recommendation:** Initialize state directly from props/URL params using lazy initializers or derive state during render without `setState`.

#### C. Missing Hook Dependencies (`react-hooks/exhaustive-deps`)
- **Observation:** Missing array dependencies in `useMemo` and `useEffect`:
  - `src/app/[locale]/book/page.tsx:181:6`: missing `SAMPLE_PITCHES`
  - `src/app/[locale]/home/page.tsx:159:6`: missing `DEFAULT_PITCHES`
  - `src/app/[locale]/login/page.tsx:117:6`: missing `processUserSignIn`
  - `src/app/[locale]/matches/page.tsx:124:6`: missing `SAMPLE_PUBLIC_MATCHES`

### 1.4 Unused Imports & Dead Code (73 Warnings)
- **Observation:** 73 warnings are generated for unused imports, primarily Lucide icons and UI components:
  - `src/app/[locale]/page.tsx`: 10+ unused imports (`Image`, `ArrowRight`, `ShieldCheck`, `Zap`, `Users`, `Search`, `Calendar`, `MapPin`, `Clock`, `Flame`)
  - `src/app/[locale]/book/page.tsx`: 14+ unused imports (`Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `Sun`, `ShieldAlert`, `Calculator`, `CheckCircle2`, `Zap`, `Car`, `Lightbulb`, `Info`, `Layers`)
  - `src/app/[locale]/matches/page.tsx`: 6 unused icon imports (`Users`, `Shield`, `UserCheck`, `Zap`, `Sparkles`, `Flame`)
  - `src/components/FloatingChatWidget.tsx`: 13 unused imports (`limit`, `deleteDoc`, `where`, `getDocs`, `MessageSquare`, `Users`, `Smile`, `Reply`, `Trash2`, `ChevronDown`, `CheckCheck`, `Clock`, `ImageIcon`)
  - `src/components/MatchChat.tsx`: Unused `DataSnapshot`, `Smile`
  - `src/app/[locale]/admin/dashboard/page.tsx`: Unused `Card` UI components
  - `src/app/[locale]/owner/dashboard/page.tsx`: Unused `useState`, `useTranslations`, `TrendingUp`
- **Recommendation:** Automated cleanup of unused imports to streamline AST parsing and maintain clean file headers.

---

## Section 2: Data Fetching & Caching Audit

### 2.1 TanStack React Query Configuration & Adoption
- **Setup:** `ReactQueryProvider.tsx` properly instantiates `QueryClient` via lazy `useState` (`staleTime: 5m`, `gcTime: 10m`, `refetchOnWindowFocus: false`).
- **Adoption Scope:** React Query is used in only 3 hooks:
  1. `src/hooks/useBookings.ts` (`useUserBookings`, `useCancelBooking`)
  2. `src/hooks/useMatches.ts` (`usePublicMatches`, `useJoinMatch`, `useLeaveMatch`)
  3. `src/hooks/usePitches.ts` (`usePitches`)

### 2.2 Critical Bug in Optimistic Update Rollback (`useBookings.ts`)
- **Observation:** In `useCancelBooking` (`src/hooks/useBookings.ts`):
  ```ts
  // line 10: queryKey is ['userBookings', userId]
  // line 37: previousBookings = queryClient.getQueryData(['userBookings']);
  ```
  `useUserBookings` uses the query key `['userBookings', userId]`. However, in `useCancelBooking.onMutate`, `queryClient.getQueryData(['userBookings'])` queries the exact key `['userBookings']` (without `userId`).
- **Impact:** `previousBookings` evaluates to `undefined`. If the cancellation mutation fails, `onError` attempts to restore `context.previousBookings` (which is `undefined`), wiping out user booking data in the React Query cache!
- **Fix:** Update `useCancelBooking` to accept `userId` and use `queryKey: ['userBookings', userId]` for `cancelQueries`, `getQueryData`, `setQueryData`, and rollback.

### 2.3 Realtime DB Presence Bandwidth Bottleneck (`useOnlinePresence.ts`)
- **Observation:** `src/hooks/useOnlinePresence.ts:37` attaches an `onValue` listener to the root RTDB path `/status`:
  ```ts
  const allStatusRef = ref(rtdb, '/status');
  const unsubscribeAll = onValue(allStatusRef, (snap) => {
    const data = snap.val();
    if (data) {
      const count = Object.values(data).filter((u: any) => u.state === 'online').length;
      setOnlineCount(Math.max(1, count));
    }
  });
  ```
- **Impact:** Whenever ANY single user's online state updates, the entire `/status` dictionary containing all users is downloaded across the network to every active client. At 1,000+ active users, this causes exponential network ingress charges and client JS freeze.
- **Fix:** Implement an aggregated presence counter path in RTDB (e.g., `/stats/onlineCount`) updated via Cloud Functions or RTDB security rules/triggers, or use an aggregated query instead of downloading the entire node.

### 2.4 Architecture Split & Raw Listener Inconsistency
- **Observation:** Major pages (`book/page.tsx`, `matches/page.tsx`, `profile/page.tsx`, `admin/dashboard/page.tsx`, `owner/page.tsx`, `FloatingChatWidget.tsx`) bypass TanStack React Query completely, invoking raw Firestore `onSnapshot` listeners directly inside `useEffect` and updating local component `useState`.
- **Impact:** Duplicate network subscriptions, fragmented caching, state desynchronization between pages, and risk of unhandled listener leaks if unmount functions are interrupted.
- **Recommendation:** Standardize all Firestore document/collection queries into dedicated custom hooks (`useSupportTickets`, `useDaySchedule`, `useAdminDashboard`) wrapped in React Query or centralized subscription managers.

### 2.5 Critical Logic Bug in Firestore Lock Expiration (`src/lib/firebase/booking.ts`)
- **Observation:** In `lockSlot` transaction (`src/lib/firebase/booking.ts:73-79`):
  ```ts
  for (const key in bookedSlots) {
    const slot = bookedSlots[key];
    if (slot.status === BookingStatus.LOCKED_TEMPORARY && slot.lockedUntil && slot.lockedUntil < now) {
      bookedSlots[key] = deleteField() as any;
    }
  }
  for (const block of blocks) {
    if (bookedSlots[block.toString()]) {
      throw new Error('ERROR_SLOT_TAKEN');
    }
  }
  ```
- **Impact:** `deleteField()` is a Firestore sentinel object. Assigning `bookedSlots[key] = deleteField()` sets the property value to a truthy object. During the availability check on line 79, `if (bookedSlots[block.toString()])` checks truthiness. Because `deleteField()` is truthy, expired locks trigger `ERROR_SLOT_TAKEN`!
- **Fix:** Delete the property from the local JavaScript object using `delete bookedSlots[key]` for availability validation, and accumulate `deleteField()` operations in a separate transaction update object.

---

## Section 3: Performance Optimization Audit

### 3.1 Unoptimized Image Loading (`next/image` vs `<img>`)
- **Observation:** Raw `<img>` elements are used across 7 critical locations:
  1. `src/app/[locale]/admin/components/PitchSettings.tsx:97`
  2. `src/app/[locale]/admin/components/VerificationQueue.tsx:79`
  3. `src/app/[locale]/admin/dashboard/page.tsx:282`
  4. `src/app/[locale]/matches/page.tsx:360`
  5. `src/app/[locale]/owner/components/PitchCreationForm.tsx:61`
  6. `src/components/FloatingChatWidget.tsx:525`
  7. `src/components/FloatingChatWidget.tsx:583`
- **Impact:** Raw `<img>` tags skip Next.js image optimization, leading to layout shift (CLS), higher bandwidth consumption, and uncompressed image delivery on mobile networks.
- **Recommendation:** Replace all `<img>` instances with `<Image />` from `next/image` with explicit `width`, `height`, `alt`, and `sizes` attributes.

### 3.2 Dynamic Imports & Bundle Splitting (0 Dynamic Imports)
- **Observation:** Zero components use `next/dynamic` or `React.lazy`.
- **Heavy Components Loaded Synchronously:**
  - `FloatingChatWidget.tsx`: 848-line client component featuring speech synthesis, speech recognition, image compression, and support ticketing.
  - `MatchChat.tsx`: Realtime match chat.
  - `VerificationQueue.tsx`, `PitchSettings.tsx`, `PitchCreationForm.tsx`: Admin/Owner dashboard modules.
- **Impact:** Initial JavaScript bundle loaded by landing and home pages includes code for heavy features (AI chat, speech, admin queues) that the user may never interact with.
- **Recommendation:** Lazily load `FloatingChatWidget`, `MatchChat`, and admin/owner sub-views using `next/dynamic` with skeleton fallbacks:
  ```tsx
  const FloatingChatWidget = dynamic(() => import('@/components/FloatingChatWidget'), { ssr: false });
  ```

### 3.3 Component Re-renders & Memoization Gaps
- **Observation 1:** `useCallback` is used **0 times** across the codebase. Event callbacks (e.g., slot selection, filter updates, modal toggles) are re-instantiated on every render.
- **Observation 2:** `React.memo` is applied to only 2 components (`PlayersList`, `VerificationQueue`). Core UI list components (`FeaturedStadiums`, `BookingSummaryCard`, `LiveSlotsMarquee`) re-render unconditionally on any parent state change.
- **Observation 3:** Hardcoded fallback datasets (`SAMPLE_PITCHES` in `book/page.tsx`, `DEFAULT_PITCHES` in `home/page.tsx`, `SAMPLE_PUBLIC_MATCHES` in `matches/page.tsx`) are declared *inside* component render functions, re-allocating object memory on every render frame.
- **Recommendation:** Extract static mock data to external constants outside component bodies, memoize list item components with `React.memo`, and wrap event handlers passed down component trees in `useCallback`.

### 3.4 Client-Side Security Risk: Gemini API Key Exposure
- **Observation:** `src/lib/aiService.ts:4` imports Gemini API key as `process.env.NEXT_PUBLIC_GEMINI_API_KEY`.
- **Impact:** Any client inspecting Network tab or JavaScript bundle can steal the Gemini API key and make unauthorized API calls billed to the GCP project.
- **Recommendation:** Proxy Gemini AI requests through a rate-limited Next.js Server Route (`/api/ai/chat`) using server-only environment variable `GEMINI_API_KEY`.

---

## Actionable Remediation Roadmap

| Step | Scope | Action Items | Estimated Effort |
|------|-------|--------------|------------------|
| **1** | Build & TS | Fix `lockSlot` lock expiration bug in `booking.ts`. Fix queryKey mismatch in `useCancelBooking` optimistic rollback. | Low |
| **2** | Security | Move Gemini API key from `NEXT_PUBLIC_` to server API route proxy. | Low |
| **3** | Hooks & Impurity | Fix 41 ESLint errors (`Date.now()` impurity, synchronous `setState` in `useEffect`). Clean 73 unused imports. | Medium |
| **4** | Realtime DB | Replace `/status` root listener in `useOnlinePresence.ts` with aggregated counter. | Medium |
| **5** | Performance | Replace raw `<img>` tags with `next/image`. Implement `next/dynamic` code splitting for `FloatingChatWidget` and dashboard modals. | Medium |
| **6** | Architecture | Standardize raw Firestore `onSnapshot` page logic into unified TanStack React Query hooks. | High |
