# EGFootball5 / Kickoff — System Architecture & Feature Overview

## 📌 Executive Summary
**Kickoff (EGFootball5)** is a modern, full-stack, multi-tenant football pitch booking, match lobby, and stadium management platform built for players, pitch administrators, and platform owners.

Recently, the platform underwent a **1000x comprehensive transformation & feature expansion**, introducing stadium-inspired glassmorphism (`stadium-glass`), OKLCH mesh gradients, tactile card lifts (`card-lift`), neon glow indicators, dynamic QR pass lightboxes, 5-a-side tactical board visualizer (`PitchTacticalBoard`), stadium weather tracker (`StadiumWeatherCard`), and **10 brand-new feature modules** while strictly preserving all underlying Firestore queries, Firebase Auth rules, and state management logic.

---

## 🛠️ Technology Stack
- **Web Framework**: Next.js 16.2 (App Router with Turbopack & localized `[locale]` routes)
- **UI & React**: React 19, TypeScript
- **Styling & Design System**: Tailwind CSS v4 (`@import "tailwindcss";`), OKLCH theme tokens (`globals.css`), Lucide Icons, Shadcn UI primitives, custom glassmorphism backdrops (`stadium-glass`), card hover lift dynamics (`card-lift`)
- **Animations**: Framer Motion 12+
- **Backend & Database**:
  - **Firebase Auth**: Email/Password, Google OAuth, Role-based tokens
  - **Firestore**: Core relational documents (`users`, `pitches`, `bookings`, `day_schedules`, `stats`, `notifications`, `support_tickets`, `settings`, `communities`, `community_chat`, `announcements`, `leaderboard`)
  - **Realtime Database**: Live online presence (`/status/{uid}`)
  - **Cloud Storage**: Payment receipt image uploads & stadium media
- **State Management & Caching**: TanStack React Query v5 (`@tanstack/react-query`) with custom cache keys (`queryKeys.ts`) and Zustand (`useAuthStore.ts`)
- **Localization (i18n)**: `next-intl` supporting Arabic (`ar`) with full RTL layout, and English (`en`) with LTR layout.

---

## 🌐 Application Architecture & User Roles

### 1. Player Role (`role: 'player'`)
- **Landing & Discovery (`/[locale]/`)**: Browse featured stadiums with hover lift, check real-time available slots marquee, view dynamic stats counters, interact with AI Football Assistant.
- **Player Setup & Onboarding (`/[locale]/onboarding`)**: Interactive 4-step wizard (Position GK/DEF/MID/STR, Skill Level, Favorite Team, Preferred City & Pitch Size) saving to Firestore user profile.
- **Pitch Search & Weather (`/[locale]/home`)**: Stadium exploration, live weather & pitch condition tracker (`StadiumWeatherCard`), amenity filters, price sliders.
- **Booking Flow (`/[locale]/book`)**: Select city, stadium, field size (5v5, 7v7, etc.), date, and time slot with stadium-glass calendar. Temporary lock on time slot (`status: 'locked_temporary'`) with countdown timer.
- **Checkout & Payment (`/[locale]/checkout`)**: Upload payment proof receipt (`receiptUrl`) for InstaPay/Vodafone Cash deposits. View dynamic SVG QR Pass modal for match admission.
- **Match Lobbies & Tactics (`/[locale]/matches`)**: Browse open public matches, position selector (GK, DEF, MID, STR), interactive 5-a-Side Lineup & Tactics Board (`PitchTacticalBoard`), WhatsApp match inviter.
- **Leaderboard & Monthly Awards (`/[locale]/leaderboard`)**: Animated 3D Podium for Top 3 Players, rankings for Top Scorers, Golden Glove Keepers, and Season MVPs.
- **Football Communities (`/[locale]/communities`)**: Squad creation, neighborhood clubs, join requests, community stats.
- **Community Chat (`/[locale]/community-chat`)**: Real-time regional chatrooms (`#general`, `#need-gk`, `#match-invites`, `#pitch-reviews`).
- **Player Profile & History (`/[locale]/profile`)**: View booking history with status filters (Confirmed, Pending, Cancelled), manage user profile, receipt re-upload flow, dynamic QR match pass.
- **Achievements & Loyalty (`/[locale]/achievements`)**: Trophy cabinet, XP level progress bar, unlockable milestone badges.
- **Notifications Inbox (`/[locale]/notifications`)**: Activity center with category filters and "Mark All as Read" batch action.
- **Season Ceremony Gala (`/[locale]/ceremony`)**: Ceremony countdown timer, Golden Boot/Glove awards, Team of the Season (TOTS) interactive pitch formation.
- **Platform Announcements (`/[locale]/announcements`)**: Official news feed, tournament alerts, maintenance notices.
- **Support Inbox (`/[locale]/support`)**: Customer support ticket system, ticket creation modal, FAQ accordion.
- **Guide & Rules (`/[locale]/guide`)**: Platform charter, 15-minute slot hold rules, deposit verification guidelines, fair play policy.

### 2. Pitch Admin Role (`role: 'admin'`)
- **Admin Dashboard (`/[locale]/admin/dashboard`)**:
  - Manage live stadium schedule & slot locks with interactive tabbed matrix.
  - Review & verify player deposit receipts (`pending_review` -> `confirmed` or `rejected`) with image lightbox modal.
  - View player registry and attendance history with blacklist toggle controls.
  - Modify pitch pricing, operational hours, and maintenance slots.

### 3. Platform Owner Role (`role: 'owner'`)
- **Owner Dashboard (`/[locale]/owner/dashboard`)**:
  - Platform-wide telemetry (Total bookings, Revenue, System health).
  - Manage platform cities (`settings/cities`).
  - Register new stadiums and assign Pitch Admin emails.
- **User Role Management (`/[locale]/owner/users`)**: Manage user roles (`player` <-> `admin` <-> `owner`), privilege auditor, and blacklist controls.

---

## 💾 Database Collections & Firestore Schema

| Collection | Description | Access Rules |
|------------|-------------|--------------|
| `users` | User profiles, role (`player`, `admin`, `owner`), `position`, `skillLevel`, `isBlacklisted` status | Self-read/write, Admin full access |
| `pitches` | Stadium details, city, field sizes, hourly price, `adminEmail`, location | Public read, Owner write, Admin write (assigned pitch) |
| `bookings` | Booking records, deposit status (`locked_temporary`, `pending_review`, `confirmed`, `rejected`, `cancelled`), `receiptUrl`, `joinedPlayers` | Authenticated users (own bookings), Public matches read, Admin write |
| `day_schedules` | Real-time slot locking per stadium per day | Public read, Authenticated write (slot locking) |
| `stats` | Public platform metrics (Total pitches, Bookings count, Active players) | Public read, Admin write |
| `notifications` | In-app user notifications | User self-read/write, Admin create |
| `support_tickets` | User support inquiries & chat messages | Ticket creator & Admin read/write |
| `settings` | System-wide configuration (e.g., active cities array) | Public read, Owner write |
| `communities` | Football clubs & neighborhood squads | Public read, Authenticated create/captain update |
| `community_chat` | Real-time chat messages by channel | Public read, Authenticated create |
| `announcements` | Official platform news & updates | Public read, Admin write |
| `leaderboard` | Top scorers, goalkeepers & MVP rankings | Public read, Admin write |
| `subscriptions` | Tiered player subscription orders (Pro Pass, Pitch Pass VIP) in EGP with payment receipts | Authenticated user create & own read, Admin approve/reject/delete |

---

## 📡 API Endpoints & Security Pipeline

All endpoints are protected by `src/lib/security/apiSecurity.ts` and `src/lib/security/sanitize.ts`:
- `POST /api/admin/role`: Super-admin endpoint to upgrade/change user roles. Enforces UID/IP rate limits, origin validation, and sanitized inputs.
- `POST /api/ai/chat`: AI Assistant conversational engine. Internal server proxy isolating AI keys from client bundles; rate-limited and sanitized.
- `POST /api/ai/tts`: AI Assistant text-to-speech audio synthesis with origin checks and payload sanitization.

---

## 🛡️ Security & Legal Compliance Architecture

- **Egyptian Personal Data Protection Law (Law No. 151 of 2020)**: Analytics tracking gated strictly behind prior user consent; zero advertising or cross-site tracking; interactive `CookieConsentBanner` and persistent preferences modal.
- **Egyptian Consumer Protection Law (Law No. 181 of 2018)**: Clear, legally binding Refund & Cancellation Policy; elimination of unverified superlative claims and mock reviews; explicit checkbox consent before account creation and booking submissions.
- **Private In-App QR Generation**: Match admission passes generated purely client-side via `qrcode`, eliminating third-party QR server token leakage.
- **Corporate Entity**: EGFootball Sports Tech LLC (CR: 194820, Tax ID: 712-492-301, Obour City, Egypt).

---

## 🗺️ Complete 18-Step Page & Route Map

1. `/[locale]/` — Landing Page (Hero, Stats, Featured Stadiums, Live Slots Marquee, AI Chat Widget)
2. `/[locale]/login` — Authentication Portal (Google SSO / Email / Password) with explicit Terms/Privacy/Refund consent
3. `/[locale]/onboarding` — Interactive 4-Step Player Setup Wizard
4. `/[locale]/communities` — Football Squads & Local Clubs Hub
5. `/[locale]/home` — Pitch Discovery & Stadium Weather Tracker
6. `/[locale]/book` — Slot Selection Matrix & Hold Timer
7. `/[locale]/checkout` — Payment Receipt Upload, In-App Private QR Pass & Slot Hold Consent
8. `/[locale]/matches` — Public Match Lobbies & 5-a-Side Tactical Board
9. `/[locale]/leaderboard` — 3D Podium Hall of Fame & Monthly Awards
10. `/[locale]/community-chat` — Live Real-time Regional Chatroom Channels
11. `/[locale]/profile` — FIFA-style Player Card, Booking History & QR Pass
12. `/[locale]/achievements` — Unlockable Milestone Badges & Level XP Progress
13. `/[locale]/notifications` — Central Activity & Alert Inbox
14. `/[locale]/admin/dashboard` — Pitch Admin Operation Center & Schedule Controls
15. `/[locale]/ceremony` — End-of-Season Ceremony Gala & TOTS Formation
16. `/[locale]/announcements` — Official Platform News & Updates Feed
17. `/[locale]/support` — Support Ticket Help Desk & FAQ Accordion
18. `/[locale]/owner/users` — Super Admin User Privileges & Role Manager
19. `/[locale]/owner/dashboard` — Platform Owner Telemetry & Stadium Configuration
20. `/[locale]/guide` — Platform Charter & Fair Play Rules
21. `/[locale]/terms` — Terms of Service
22. `/[locale]/privacy` — Privacy Policy
23. `/[locale]/cookies` — Cookie Policy
24. `/[locale]/refund` — Refund & Cancellation Policy (Law No. 181 of 2018)
25. `/[locale]/not-found` & `/not-found` — Bespoke branded 404 Out-of-Bounds page with recovery navigation
26. `/[locale]/error` — Runtime Error Boundary with inline retry trigger and support desk routing
27. `/api/health` — Static health monitoring and environment verification telemetry
28. `/robots.txt` & `/sitemap.xml` — Technical SEO crawling directives and bilingual hreflang index
29. `/[locale]/subscription` — Tiered Subscription Plans (Free, Pro Pass @ 99 EGP, Pitch Pass VIP @ 199 EGP) with mobile wallet / InstaPay verification and ROI benefits calculator
30. `/[locale]/thank-you` — Dedicated confirmation route with 2-hour response time guarantee and next-step action cards
31. `/llms.txt` — Standard machine-readable AI context file for LLM search engines (Perplexity, SearchGPT, Claude, Gemini)
32. **Commercial UX Utilities**: SkipLink, GlobalCommandMenu (Ctrl+K), ReadingProgressBar, MobileStickyCta, and ScrollToTop.

---

## 💎 Production Subscription & Monetization Engine (Egyptian Pound)
- **Monetization Model**:
  - **Free Tier (0 EGP)**: Essential 5v5 pitch bookings, 15-min lock buffer, public match lobbies, 1 AI advice tip per 2 hours.
  - **Pro Pass (99 EGP / mo or 249 EGP / 3 mo)**: 5% automatic booking discount, 20-min lock buffer, Blue Pro profile badge, private match lobbies, unlimited AI coach tips, priority support.
  - **Pitch Pass VIP (199 EGP / mo or 499 EGP / 3 mo)**: 10% automatic booking discount, 25-min lock buffer, Golden VIP Crown badge everywhere, 100% free monthly tournament voucher, private match lobbies, unlimited AI coach insights, dedicated VIP line.
- **Payment Architecture**:
  - Direct Egyptian mobile wallet (**Vodafone Cash: 01012345678**) and **InstaPay (egfootball5@instapay)** with one-click copy and transfer verification.
  - Disabled Credit Card gateway button explicitly labelled with "Soon / قريباً" per business requirements.
  - Real Firestore persistence in `subscriptions` with strict Zod validation, idempotency keys, and atomic batch admin approval/rejection.

---

## 🖥️ Desktop Development & Web App Shortcuts
- **`EGFootball5.lnk` / `launch_egfootball.vbs`**: One-click silent Windows launcher on the Desktop with the platform icon. Checks if dev server is active; if not, starts `npm run dev` invisibly and opens the default browser immediately upon readiness.
- **`Stop EGFootball5.lnk` / `stop_egfootball.vbs`**: Graceful dev server shutdown utility terminating processes on ports 3000-3002 with an auto-closing status notification.
- **`public/app-icon.ico`**: 6-layer high-resolution Windows icon derived from `public/favicon.jpg`.

---

## 🏛️ Senior Modular Architecture & Anti-Monolith Decomposition (<300 lines/file)
Every oversized file across the application has been decomposed into domain-specific, maintainable units adhering strictly to the <300 lines rule while preserving 100% of business logic:
- **`book/page.tsx`** (formerly 670 lines): Decomposed into `BookingPitchHeader`, `BookingCalendarPicker`, `BookingPromoCode`, `BookingSlotGrid`, `BookingAddons`, and `useBookingPitchSchedule` hook.
- **`matches/page.tsx`** (formerly 722 lines): Decomposed into `CreateMatchModal`, `MatchFilters`, `EmptyMatchesState`, `MatchCard`, `PastMatchesSection`, and `useMatchActions` hook.
- **`FloatingChatWidget.tsx`** (formerly 1,332 lines): Decomposed into `AIChatSection`, `AIChatInputBar`, `AIChatMessageItem`, `CommunityChatSection`, `CommunityInputBar`, `CommunityMessageItem`, `StaffSupportSection`, `AdminTicketList`, and `SupportThreadView`.
- **`PageSkeletons.tsx`** (formerly 679 lines): Decomposed into 4 focused modules (`CorePageSkeletons`, `SocialCommunitySkeletons`, `FeatureGameSkeletons`, `DashboardSkeletons`).
- **`ceremony/page.tsx`** (formerly 634 lines): Decomposed into `CeremonyCountdown`, `CeremonyAwardsGrid`, `CeremonyTotsPitch`, and `CeremonyAdminModal`.
- **`checkout/page.tsx`** (formerly 579 lines): Decomposed into `DynamicMatchQrCode`, `CheckoutQrModal`, `CheckoutTicketCard`, `PaymentMethodsCard`, and `ReceiptUploadForm`.
- **`profile/page.tsx`** (formerly 572 lines): Decomposed into `BookingCard`, `ProfileStatsHeader`, `ProfileForm`, and `ProfileFavoritesTab`.
- **`home/page.tsx`** (formerly 560 lines): Decomposed into `HomeFilterBar`, `PitchGridCard`, `PitchListCard`, and `PitchPreviewModal`.
- **`owner/analytics/page.tsx`** (formerly 542 lines): Decomposed into `AnalyticsOverviewTab`, `SubscriptionsTab`, `VipGiftsTab`, `PitchesAnalyticsTab`, and `AiUsageTab`.
- **`jersey-designer/page.tsx`** (formerly 541 lines): Decomposed into `JerseyPreview3D` and `JerseyCustomizerControls`.
- **`SideMenu.tsx`** (formerly 310 lines): Modularized into `SideMenu.tsx` (111 lines) and `SidebarContent.tsx` (195 lines).
- **`tournaments/page.tsx`** (formerly 308 lines): Modularized into `tournaments/page.tsx` (220 lines) and `TournamentBracketModal.tsx` (147 lines).
- **`leaderboard/page.tsx`** (formerly 309 lines): Modularized into `leaderboard/page.tsx` (229 lines) and `LeaderboardPodium.tsx` (98 lines).
- **`goal-of-the-month/page.tsx`** (formerly 312 lines): Modularized into `goal-of-the-month/page.tsx` (263 lines) and `GoalSubmissionModal.tsx` (143 lines).
- **`admin/dashboard/page.tsx`** (formerly 325 lines): Modularized into `admin/dashboard/page.tsx` (289 lines), `ReceiptLightboxModal.tsx` (47 lines), and `adminHelpers.ts` (31 lines).
- **`achievements/page.tsx`** (formerly 350 lines): Modularized into `achievements/page.tsx` (192 lines) and `achievementsData.ts` (178 lines).
- **`challenges/page.tsx`** (formerly 397 lines): Modularized into `challenges/page.tsx` (296 lines) and `PostChallengeModal.tsx` (167 lines).
- **`announcements/page.tsx`** (formerly 385 lines): Modularized into `announcements/page.tsx` (211 lines), `AnnouncementDetailsModal.tsx` (82 lines), and `PublishAnnouncementModal.tsx` (198 lines).
- **`var-highlights/page.tsx`** (formerly 353 lines): Modularized into `var-highlights/page.tsx` (184 lines) and `UploadVarClipModal.tsx` (198 lines).
- **`owner/users/page.tsx`** (formerly 365 lines): Modularized into `owner/users/page.tsx` (299 lines) and `UserMobileCard.tsx` (128 lines).
- **`CustomDarkDatePicker.tsx`** (formerly 326 lines): Modularized into `CustomDarkDatePicker.tsx` (260 lines) and `CustomTimeDropdown.tsx` (86 lines).
- **`JerseyPreview3D.tsx`** (formerly 343 lines): Modularized into `JerseyPreview3D.tsx` (208 lines), `JerseySvgDefs.tsx` (80 lines), and `JerseyBadgeIcon.tsx` (60 lines).
- **`onboarding/page.tsx`** (formerly 415 lines): Modularized into `onboarding/page.tsx` (172 lines), `OnboardingPositionStep.tsx`, `OnboardingSkillStep.tsx`, `OnboardingClubStep.tsx`, and `OnboardingContactStep.tsx`.

---

## ⚡ 100% Route Loading Skeleton Coverage (`loading.tsx`)
All 35 application routes feature dedicated, precision geometric skeleton loaders mirroring exact layout geometries:
- Authentication & Onboarding: `login/loading.tsx`, `onboarding/loading.tsx`
- Core & Booking: `home/loading.tsx`, `book/loading.tsx`, `checkout/loading.tsx`, `matches/loading.tsx`, `profile/loading.tsx`, `profile/[username]/loading.tsx`
- Administration & Ownership: `admin/dashboard/loading.tsx`, `owner/loading.tsx`, `owner/dashboard/loading.tsx`, `owner/analytics/loading.tsx`, `owner/users/loading.tsx`
- Subscriptions & Monetization: `pricing/loading.tsx`, `subscription/loading.tsx`
- Social & Gaming: `communities/loading.tsx`, `community-chat/loading.tsx`, `leaderboard/loading.tsx`, `tournaments/loading.tsx`, `challenges/loading.tsx`, `achievements/loading.tsx`, `ceremony/loading.tsx`, `jersey-designer/loading.tsx`, `goal-of-the-month/loading.tsx`, `var-highlights/loading.tsx`, `live-stream/loading.tsx`
- Informational & Legal: `guide/loading.tsx`, `notifications/loading.tsx`, `announcements/loading.tsx`, `support/loading.tsx`, `privacy/loading.tsx`, `terms/loading.tsx`, `refund/loading.tsx`, `cookies/loading.tsx`.


