# EGFootball5 — Security & Compliance Architecture

This document outlines the security controls, legal compliance posture, and secret isolation architecture implemented in EGFootball5.

---

## 1. Legal Compliance Posture

### Egyptian Personal Data Protection Law (Law No. 151 of 2020)
- **Consent-First Telemetry**: Firebase Analytics tracking is completely disabled on client initialization until the player grants explicit consent via the `CookieConsentBanner`.
- **Data Minimization**: The platform collects only essential identifiers (Phone number, Full name, Booking history, Payment confirmation receipts). No tracking identifiers, device fingerprints, or advertising trackers are installed.
- **Granular Cookie Preferences**: Players can inspect and toggle Functional and Analytics cookies at any time via the persistent "Cookie Preferences" link in the footer (`egfootball:open-cookie-preferences` event).
- **Official Corporate Representation**: All corporate registrations are clearly displayed in platform footers and legal policies:
  - **Entity**: EGFootball Sports Tech LLC (شركة إيجي فوتبول لخدمات تكنولوجيا الرياضة وحجز الملاعب ش.م.م)
  - **Commercial Register (CR)**: 194820
  - **Tax ID**: 712-492-301
  - **Jurisdiction**: Obour City & Cairo Competent Courts, Arab Republic of Egypt

### Egyptian Consumer Protection Law (Law No. 181 of 2018)
- **Refund & Cancellation Policy (`/[locale]/refund`)**:
  - Cancellations > 24 hours prior: 100% full deposit refund or free rescheduling voucher.
  - Cancellations 12–24 hours prior: 50% deposit refund.
  - Adverse weather / Turf Force Majeure: 100% full deposit refund.
  - Pitch operator cancellations: 100% instant refund plus priority re-booking credit.
  - Refunds disbursed within 24–48 business hours via the original transaction method (Vodafone Cash or InstaPay).
- **Truth in Advertising**: Removed all unsupported superlative claims (e.g. "Egypt #1") and hardcoded mock review metrics.

---

## 2. API Key & Secret Isolation Architecture

- **Zero Client-Side AI Keys**:
  - `GEMINI_API_KEY` and `OPENROUTER_API_KEY` are kept strictly in server-side environment variables.
  - `src/lib/aiService.ts` executes HTTP POST requests only to the authenticated internal server route `/api/ai/chat`.
  - Direct third-party AI endpoints and client authorization headers were removed.
- **Git Scrubbing**:
  - Removed `build.log`, `build_output.log`, `google-services.json`, and `GoogleService-Info.plist` from Git tracking.
  - Enforced exclusions in `.gitignore` for `.env*` (except `.env.example`), `*.log`, and mobile credential bundles.
- **Production Debug Mode Gating**:
  - React Query Devtools (`@tanstack/react-query-devtools`) are conditionally rendered only when `process.env.NODE_ENV === 'development'`.

---

## 3. Route & API Armor

### Defense-in-Depth for Admin & Owner Routes
- In addition to Firebase Firestore security rules and client authentication listeners, `admin/dashboard`, `owner/analytics`, and `owner/page` contain immediate synchronous render guards returning `<DashboardPageSkeleton />` if unauthorized or loading, completely blocking SSR and client hydration leaks.

### API Security Pipeline (`src/lib/security/apiSecurity.ts`)
- **Sliding-Window Rate Limiting**:
  - IP-based rate limiting (60 requests per minute).
  - User-ID-based rate limiting for authenticated operations (30 requests per minute for AI, 10 requests per minute for role modifications).
- **Origin & CORS Validation**:
  - Strict origin validation against `APP_URL` and trusted domains.
  - Strict preflight options handling (`handleCorsPreflight`).
- **Input Sanitization (`src/lib/security/sanitize.ts`)**:
  - HTML tag stripping and control character filtering (`sanitizeText`).
  - Regex-based email and phone normalization (`sanitizeEmail`, `sanitizePhone`).
  - Safe identifier enforcement (`sanitizeIdentifier`).

---

## 4. Privacy & Third-Party Embed Protection

- **Local QR Code Generation**:
  - Eliminated third-party QR generation (`api.qrserver.com`), which leaked booking tokens.
  - Replaced with in-app client-side SVG/Canvas QR generation powered by `qrcode`, keeping match tokens private.

---

## 5. Security Headers (`firebase.json`)

Strict HTTP response headers deployed on all hosting routes:
- `Content-Security-Policy`: Restricts scripts, styles, connects, frames, and objects to trusted origins.
- `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options`: `DENY`
- `X-Content-Type-Options`: `nosniff`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `X-XSS-Protection`: `1; mode=block`
