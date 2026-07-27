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

---

## 📡 API Endpoints

- `POST /api/admin/role`: Super-admin endpoint to upgrade/change user roles.
- `POST /api/ai/chat`: AI Assistant conversational engine supporting streaming responses.
- `POST /api/ai/tts`: AI Assistant text-to-speech audio synthesis.

---

## 🗺️ Complete 18-Step Page & Route Map

1. `/[locale]/` — Landing Page (Hero, Stats, Featured Stadiums, Live Slots Marquee, AI Chat Widget)
2. `/[locale]/login` — Authentication Portal (Google SSO / Email / Password)
3. `/[locale]/onboarding` — Interactive 4-Step Player Setup Wizard
4. `/[locale]/communities` — Football Squads & Local Clubs Hub
5. `/[locale]/home` — Pitch Discovery & Stadium Weather Tracker
6. `/[locale]/book` — Slot Selection Matrix & Hold Timer
7. `/[locale]/checkout` — Payment Receipt Upload, Deposit Verification & QR Pass
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
