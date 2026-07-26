# Original User Request

## 2026-07-26T09:30:46Z

# Teamwork Project Prompt — EGFootball5 100x Overhaul

Full 100x overhaul, feature expansion, performance optimization, security hardening, UI/UX polish, and clean code refactoring for EGFootball5 (`kickoff`).

Working directory: d:\football\kickoff
Integrity mode: development

## Requirements

### R1. UI/UX & Frontend Polish (100x Improvement)
- Upgrade all player, admin, owner dashboards, landing pages, booking workflows, and navigation.
- Implement responsive design, subtle animations (Framer Motion), dark/light theme consistency, loading skeletons, and interactive state feedback.
- Ensure 100% i18n support (Arabic / English) without missing keys or alignment issues in RTL/LTR.

### R2. Backend, Realtime & Firestore Architecture
- Audit and strengthen Firestore rules (`firestore.rules`), indexes (`firestore.indexes.json`), and Realtime Database structure.
- Refactor data fetching and mutations to use optimized TanStack React Query patterns, proper caching, and optimistic UI updates.
- Enhance match lobby chats, notifications, presence tracking, and booking status transitions.

### R3. Security Hardening & Data Integrity
- Secure API routes (`src/app/api/...`), enforce strict role-based access control (Player / Pitch Admin / Platform Owner).
- Prevent unauthorized mutations, sanitize user inputs, and protect sensitive environment configurations.
- Verify security rule coverage and eliminate any implicit `allow read, write: if true;` or unauthenticated bypasses.

### R4. Performance & Code Quality Clean Code Overhaul
- Eliminate unused code, dead imports, and redundant state handlers.
- Optimize image loads, dynamic imports, bundle size, and component renders.
- Verify zero TypeScript or linting errors, ensuring clean production builds.

## Acceptance Criteria

### Verification & Health
- [ ] Clean compilation with zero TypeScript errors or warnings during `npm run build`.
- [ ] All pages (Landing, Home, Matches, Book, Checkout, Admin, Owner, Profile) render error-free across English and Arabic locales.
- [ ] Firebase Auth, Firestore permissions, and Realtime DB presence operate securely with strict RBAC rules.
- [ ] Responsive UI functions smoothly on mobile, tablet, and desktop viewports.
