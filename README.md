# EGFootball5 / Kickoff ⚽

**Kickoff (EGFootball5)** is a modern 5-a-side football pitch booking, matchmaking, and stadium management web application built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, and Firebase.

---

## 🌟 Key Features

- 🏟️ **Stadium Booking Engine**: Interactive calendar slot selection grid with 15-minute temporary slot lock.
- 💳 **Deposit Verification**: Mobile transfer payment proof (Vodafone Cash / InstaPay) upload with pitch admin verification queue & dynamic SVG QR match admission pass.
- ⚽ **Public Match Lobbies ("Hagaz")**: Position-based matchmaking (GK, DEF, MID, STR) with WhatsApp match invitation link generator.
- 📋 **5-a-Side Lineup & Tactics Board (`PitchTacticalBoard`)**: Interactive formation selector (1-2-1, 2-1-1, 2-2) with player positioning and WhatsApp share.
- ☀️ **Stadium Weather Tracker (`StadiumWeatherCard`)**: Live weather, temperature, humidity, and pitch surface condition status.
- 🏆 **Leaderboard & 3D Podium**: Hall of fame for Top Scorers, Golden Glove Keepers, and Season MVPs.
- 👥 **Football Communities**: Squad creation, neighborhood clubs, member badges, and join requests.
- 💬 **Live Community Chat**: Real-time regional chatrooms (`#general`, `#need-gk`, `#match-invites`, `#pitch-reviews`).
- 🎖️ **Achievements & XP Levels**: Milestone trophies, loyalty levels, and XP progress bars.
- 🔔 **Notifications Inbox**: Activity center with category filters and batch read actions.
- 🎉 **Season Ceremony Gala**: Season gala countdown, Golden Boot/Glove awards, and interactive Team of the Season (TOTS) formation.
- 🎧 **Support Help Desk**: Support ticket system, live thread view, and FAQ accordion.
- 📖 **Guide & Rules**: Platform charter, deposit hold rules, and fair play policy.
- 🛡️ **Multi-Tenant Administration**: Dedicated dashboards for Pitch Admins (slot control, receipt review, blacklisting) and Platform Owners (city manager, stadium creator, user role privileges).
- 🌐 **Full Internationalization (i18n)**: Arabic (`ar`) with full RTL layout, and English (`en`) with LTR layout.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/kickoff.git
cd kickoff

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build & Verification

```bash
# Run TypeScript compilation and production build
npm run build
```

---

## 📄 License
MIT License © 2026 EGFootball5. All rights reserved.
