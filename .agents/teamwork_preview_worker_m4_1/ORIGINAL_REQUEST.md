## 2026-07-26T12:55:43Z
You are Worker M4 for EGFootball5 100x Overhaul — Milestone 4 (UI/UX & i18n Polish).
Your working directory is `d:\football\kickoff\.agents\teamwork_preview_worker_m4_1`.
Please create your directory and write your `progress.md` liveness heartbeat and report `handoff.md` inside your working directory.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective is to implement, test, and verify all UI/UX Polish, Framer Motion Animations, Theme Engine Fixes, and 100% Arabic & English i18n / RTL / LTR Localization for Milestone 4 across `d:\football\kickoff`.

### Task Checklist:

1. **Theme Engine & Typography Fixes (`layout.tsx` & `globals.css`)**:
   - In `src/app/[locale]/layout.tsx`, remove hardcoded inline `style={{ backgroundColor: '#090d16', color: '#ffffff' }}` and forced `className="dark"`. Allow `ThemeProvider` to control theme classes cleanly. Connect `<Toaster>` to the active theme context.
   - Configure dynamic font loading: import Google `Cairo` font for Arabic (`locale === 'ar'`) and Google `Inter` / `Geist` font for English (`locale === 'en'`). Apply proper font classes dynamically to body/html.

2. **i18n Dictionaries & Translation Refactoring (`messages/en.json` & `ar.json`)**:
   - Fix empty key `Landing.title`. Add missing `MatchChat.typing` (`"is typing..."` / `"يكتب الآن..."`).
   - Expand `en.json` and `ar.json` with missing namespaces: `AiAdvice`, `QuickSearch`, `LiveMarquee`, `BookingSummary`, `Addons`, `Achievements`, `Positions`, `Landing`, `Admin`, `OwnerUsers`.
   - Refactor all components and pages using hardcoded Arabic/English strings or inline ternaries (`isArabic ? ... : ...`) to use `next-intl` `useTranslations()` / `getTranslations()`.
   - Audit and refactor: `BookingSummaryCard.tsx`, `DailyAIAdviceCard.tsx`, `QuickSearchHero.tsx`, `LiveSlotsMarquee.tsx`, `NotificationBell.tsx`, `MatchChat.tsx`, `WhatsAppSupportButton.tsx`, `LandingPage`, `HomePage`, `BookPage`, `CheckoutPage`, `MatchesPage`, `ProfilePage`, `AdminDashboard`, `OwnerUsersPage`.

3. **RTL / LTR Directional Layout & Utilities Cleanup**:
   - Replace all hardcoded `mr-*` / `ml-*` with logical margin utilities `me-*` / `ms-*`.
   - Replace all hardcoded `text-left` in tables and forms with `text-start`.
   - Fix price text alignment bug on `HomePage` (`text-right rtl:text-left` -> `text-start`).
   - Fix search bar icon & clear button positioning in `HomePage` using `start-3.5` / `end-3` and `ps-10 pe-9`.
   - Ensure forward navigation icons (`ArrowRight`, `ChevronRight`) have `rtl:rotate-180`.

4. **Skeleton Loaders, Responsiveness & Empty States**:
   - Add React Query `isLoading` skeleton rendering to `FeaturedStadiums.tsx` (3-card skeleton grid).
   - Add ticker skeleton pulse to `LiveSlotsMarquee.tsx`.
   - Add snapshot loading skeletons to `AdminDashboard.tsx`, `VerificationQueue.tsx`, `LiveSchedule.tsx`, `ExistingPitchesList.tsx`.
   - Fix mobile (<640px) responsiveness:
     - Set input font size to `text-base` (16px) for mobile inputs in `QuickSearchHero.tsx` to prevent iOS Safari auto-zoom.
     - Change receipt image container in `VerificationQueue.tsx` on mobile to `aspect-[4/3]` or `h-44` with lightbox zoom.
     - Implement responsive fallback for `LiveSchedule.tsx`: `hidden sm:table` for desktop/tablet, and a custom list of stacked card items for mobile (<640px).
   - Upgrade empty states in `ProfilePage` (Bookings and Favorites tabs) with styled graphic cards + CTA buttons ("Browse Pitches & Book Now", "Explore Stadiums").

5. **Booking Workflow & Matches Lobby Enhancements**:
   - Upgrade add-ons toggle cards in `BookPage` with interactive border highlight & subtotal indicators.
   - Replace static QR pass text placeholder in `checkout/page.tsx` with a dynamic SVG QR code pass generator.
   - On `matches/page.tsx`, replace `router.push('/home')` on "Host a Match" CTA with an inline `<CreateMatchModal />`.

6. **Framer Motion Animations**:
   - Create `src/lib/animations.ts` with reusable motion presets (`pageVariants`, `staggerContainer`, `cardItemVariant`, `modalSpring`).
   - Apply Framer Motion page transitions, card staggering, modal spring enter/exit transitions, and button micro-interactions (`whileHover`, `whileTap`) across landing, matches, dashboards, and booking workflow.

7. **Build & Type Verification**:
   - Run `npx tsc --noEmit` and ensure 0 TypeScript errors.
   - Run `npm run build` and ensure Next.js production build completes successfully.
