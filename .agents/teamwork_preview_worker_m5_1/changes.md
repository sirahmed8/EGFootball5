# Milestone 5: Performance & Clean Code Refactoring Changes

## Summary of Refactoring & Optimizations

### 1. Core Logic & Critical Firebase Fixes
- **`src/lib/firebase/booking.ts`**:
  - Fixed Firestore lock expiration bug in `lockSlot` transaction: assigning sentinel object `bookedSlots[key] = deleteField()` before checking slot availability evaluated to a truthy sentinel object and triggered `ERROR_SLOT_TAKEN` on expired locks. Updated to `delete bookedSlots[key]` on the JS dictionary during availability check.
  - Replaced explicit `any` types with strict interfaces (`Booking`, `SlotData`) and `catch (err: unknown)`.

### 2. Code Splitting & Dynamic Imports (`next/dynamic`)
- **`src/app/[locale]/layout.tsx`**:
  - Dynamically imported `FloatingChatWidget` with `{ ssr: false }` to eliminate SSR weight for heavy AI, speech recognition, audio TTS, and realtime support modules.
- **`src/app/[locale]/matches/page.tsx`**:
  - Dynamically imported `MatchChat` with `{ ssr: false }` for realtime RTDB match discussion.
- **`src/app/[locale]/admin/dashboard/page.tsx`**:
  - Dynamically imported dashboard subcomponents (`VerificationQueue`, `LiveSchedule`, `PitchSettings`, `PlayersList`) with `{ ssr: false }`.

### 3. Next.js Image Optimization (`next/image`)
- Replaced unoptimized raw `<img>` tags with Next.js `<Image />` featuring proper dimensions, responsive layout, and lazy loading in:
  - `src/components/FloatingChatWidget.tsx` (user uploads, AI screenshots, community images, thumbnail previews)
  - `src/app/[locale]/admin/components/PitchSettings.tsx`
  - `src/app/[locale]/admin/components/VerificationQueue.tsx`
  - `src/app/[locale]/admin/dashboard/page.tsx` (Receipt lightbox modal)
  - `src/app/[locale]/owner/components/PitchCreationForm.tsx`
  - `src/app/[locale]/matches/page.tsx` (Stadium hero cards)

### 4. React 19 Purity & Hook Performance
- **React 19 Purity (`Date.now()`)**:
  - Extracted static sample data objects (`SAMPLE_PITCHES`, `DEFAULT_PITCHES`, `SAMPLE_PUBLIC_MATCHES`) outside component render bodies to module scope in `book/page.tsx`, `home/page.tsx`, and `matches/page.tsx`.
  - Replaced render-body `Date.now()` calls with lazy initializers (`useState(() => Date.now())`) or event-triggered timestamps in `book/page.tsx` and `FloatingChatWidget.tsx`.
- **Rules of Hooks**:
  - Fixed React hook rules error in `src/app/[locale]/admin/dashboard/page.tsx` by moving `useToggleBlacklist()` hook call above early returns.
- **Synchronous `setState` in `useEffect`**:
  - Replaced synchronous `setState` in effect bodies with lazy state initializers or derived state in `home/page.tsx`, `DailyAIAdviceCard.tsx`, `usePresence.ts`, `useOnlinePresence.ts`, `useChat.ts`, and `FloatingChatWidget.tsx`.

### 5. Dead & Unused Code Elimination
- Cleaned unused imports, unused variable declarations (`_isArabic`, `isArabic`, `locale`, `CheckCircle2`, `ArrowRight`, `Percent`, `useEffect`), and unused catch error parameters across:
  - `src/app/[locale]/page.tsx`
  - `src/app/[locale]/book/page.tsx`
  - `src/app/[locale]/home/page.tsx`
  - `src/app/[locale]/matches/page.tsx`
  - `src/app/[locale]/profile/page.tsx`
  - `src/app/[locale]/owner/dashboard/page.tsx`
  - `src/app/[locale]/admin/components/AdminOverviewCards.tsx`
  - `src/app/[locale]/admin/components/PlayersList.tsx`
  - `src/components/DailyAIAdviceCard.tsx`
  - `src/components/LiveSlotsMarquee.tsx`
  - `src/components/QuickSearchHero.tsx`
  - `src/components/WhatsAppSupportButton.tsx`
  - `src/hooks/useNotifications.ts`
  - `src/hooks/usePresence.ts`
  - `src/hooks/useChat.ts`

### 6. Strict Type Safety & ESLint Clean Code
- Replaced explicit `any` types with strong TypeScript interfaces, generics, or `unknown` in:
  - `src/hooks/useMatches.ts` (`PlayerItem` union type)
  - `src/hooks/useChat.ts`
  - `src/lib/firebase/booking.ts`
  - `src/app/api/admin/role/route.ts`
  - `src/app/api/ai/chat/route.ts`
  - `src/app/api/ai/tts/route.ts`
  - `src/app/[locale]/admin/components/LiveSchedule.tsx`
  - `src/app/[locale]/admin/components/VerificationQueue.tsx`
  - `src/components/FloatingChatWidget.tsx`
- Automated Verification:
  - `npx tsc --noEmit`: 0 errors
  - `npx eslint src`: 0 errors, 0 warnings
  - `npm run build`: 100% successful Next.js production build
