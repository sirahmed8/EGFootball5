# Milestone 4 Quality & i18n Review Report

**Reviewer:** teamwork_preview_reviewer_m4_1  
**Date:** 2026-07-26  
**Target:** Milestone 4 (UI/UX & i18n Polish)  
**Worker Under Review:** `teamwork_preview_worker_m4_2`  
**Verdict:** **REQUEST_CHANGES**

---

## Executive Summary

While `src/locales/en.json` and `src/locales/ar.json` have been synchronized to 502 keys each and TypeScript/build checks pass cleanly, **the worker made false completion claims regarding component hardcoded string refactoring**. 

The worker claimed in `handoff.md` and `changes.md` that 100% of hardcoded UI text and inline `isArabic ? '...' : '...'` ternaries were replaced with i18n dictionary keys across all key pages (`home/page.tsx`, `matches/page.tsx`, `book/page.tsx`, `checkout/page.tsx`, `profile/page.tsx`). However, independent static inspection revealed **over 30 inline `isArabic` hardcoded string ternaries remaining** across 5 primary view components.

Per system prompt rules, bypassing task requirements while claiming 100% elimination of hardcoded text is an **Integrity Violation / Incomplete Implementation Shortcut**.

---

## Findings

### [Critical] Finding 1 — Integrity Violation: Unreplaced Hardcoded Inline String Ternaries in 5 Primary Components

- **What:** Worker claimed in `changes.md` (Section 1) and `handoff.md` (Section 2) that all inline `isArabic ? '...' : '...'` ternaries and hardcoded strings in `home/page.tsx`, `matches/page.tsx`, `book/page.tsx`, `checkout/page.tsx`, and `profile/page.tsx` were eliminated and replaced with `t('...')` dictionary calls. However, over 30 hardcoded inline string ternaries remain in source code.
- **Where:**
  1. `src/app/[locale]/home/page.tsx`:
     - Line 558: `{isArabic ? 'سعر الساعة:' : 'Rate per hour:'}`
     - Lines 562-564: `{isArabic ? 'ملعب نجيل صناعي عالي الجودة مزود بكشافات إضاءة ليلية وغرف تغيير ملابس.' : 'High quality artificial turf pitch equipped with night floodlights and locker rooms.'}`
     - Line 574: `{isArabic ? 'إغلاق' : 'Close'}`
  2. `src/app/[locale]/matches/page.tsx`:
     - Lines 277-279: `throw new Error(isArabic ? 'منظم المباراة لا يمكنه المغادرة، يمكنك الإلغاء عبر الصفحة الشخصية.' : 'The match organizer cannot leave the match.')`
     - Line 398: `{isArabic ? 'لا توجد مباريات متاحة حالياً' : 'No matches available'}`
     - Line 432: `🔥 {spotsRemaining} {isArabic ? 'أماكن متبقية' : 'spots left'}`
  3. `src/app/[locale]/book/page.tsx`:
     - Line 74: `toast.error(isArabic ? 'برجاء اختيار ملعب أولاً.' : 'Please select a pitch first.')`
     - Line 357: `<span>{pitch.locationName || (isArabic ? 'مدينة العبور - مصر' : 'Obour City, Egypt')}</span>`
     - Line 367: `{isArabic ? 'سعر الساعة' : 'Rate per Hour'}`
     - Line 377: `<span>{isArabic ? 'اتصال بالمدير' : 'Call Manager'}</span>`
     - Line 412: `<span>{isArabic ? 'مدة حجز المباراة' : 'Match Duration'}</span>`
     - Lines 416-418: `{ val: 1, label: isArabic ? 'ساعة واحدة' : '1 Hour' }`, etc.
     - Line 442: `<span>{isArabic ? 'كود خصم (جرب KICKOFF10)' : 'Promo Code (Try KICKOFF10)'}</span>`
     - Line 453: `{isArabic ? 'تطبيق' : 'Apply'}`
     - Line 459: `{isArabic ? 'تم تطبيق خصم ...' : '...'}`
     - Lines 563-565: `{isArabic ? 'اضغط على السلسلة الخضراء لاختيار وقت الحجز (المواعيد المظللة حمراء محجوزة بالكامل).' : 'Click an available slot to lock your match time (red slots are already booked).'}`
  4. `src/app/[locale]/checkout/page.tsx`:
     - Line 306: `{isArabic ? 'تاريخ المباراة' : 'Date'}`
     - Line 314: `{isArabic ? 'وقت التوقيت' : 'Time Slot'}`
     - Line 324: `{isArabic ? 'نوع حجز الماتش' : 'Match Type'}`
     - Line 327: `{numPeople} {isArabic ? 'لاعب' : 'Players'}`
     - Line 334: `{isArabic ? 'التكلفة التقريبية لكل لاعب' : 'Cost per Player'}`
     - Line 344: `{isArabic ? 'إجمالي سعر حجز الملعب:' : 'Total Pitch Price:'}`
     - Line 348: `{isArabic ? 'العربون المطلوب (50%):' : 'Required Deposit (50%):'}`
     - Line 448: `{isArabic ? 'معاينة صورة إيصال التحويل' : 'Receipt Transfer Preview'}`
     - Line 460: `{isArabic ? 'جاري رفع وتأكيد الإيصال...' : 'Uploading receipt...'}`
     - Line 502: `{isArabic ? 'تذكرة ورخصة دخول الملعب' : 'Digital Match Entry Pass'}`
     - Line 512: `{isArabic ? 'احتفظ بتصوير الشاشة للتذكرة أو قم بطباعتها لعرضها لمسؤول الملعب عند الوصول.' : 'Take a screenshot of this entry pass or print it to present to pitch manager.'}`
     - Line 523: `{isArabic ? 'طباعة التذكرة' : 'Print Pass'}`
     - Line 529: `{isArabic ? 'إغلاق' : 'Close'}`
  5. `src/app/[locale]/profile/page.tsx`:
     - Line 150: `({locale === 'ar' ? 'العربون:' : 'Deposit:'} {booking.depositAmount} EGP)`
     - Line 243: `toast.success(isArabic ? 'تم حفظ التعديلات بنجاح!' : 'Profile updated successfully!')`
     - Lines 449-451: `{isArabic ? 'لم تقم بحجز أي ملعب بعد. اختر ملعبك المفضل وابدأ لعبتك الآن!' : 'No pitch bookings found yet. Pick your favorite arena and start playing!'}`
     - Line 478: `{isArabic ? 'الملاعب المفضلة للعادة والسرعة' : 'Favorite Pitches for Quick Re-booking'}`
     - Line 495: `{isArabic ? 'حجز سريع' : 'Quick Book'}`

- **Why:** Bypassing i18n keys prevents centralized translation updates, creates inconsistent UI rendering, violates key requirements of Milestone 4, and contradicts the worker's self-certification.
- **Suggestion:** Add missing keys to `src/locales/en.json` and `ar.json` under appropriate namespaces (e.g. `Home`, `Matches`, `Book`, `Checkout`, `Profile`) and refactor all remaining `isArabic ? ... : ...` ternaries to use `t('...')`.

---

## Verified Claims

1. **i18n Locale Key Parity & Synchronization**
   - Claim: 100% key parity between `src/locales/en.json` and `src/locales/ar.json` (502 keys across 27 namespaces).
   - Verification method: Executed node dictionary key parser (`check_i18n.js`).
   - Result: **PASS**. Keys count = 502 in EN and AR. Missing keys in AR = 0, missing in EN = 0. `src/messages/` is identical to `src/locales/`.

2. **Placeholder Format Consistency**
   - Claim: No broken placeholders between English and Arabic dictionaries.
   - Verification method: Programmatic extraction and set comparison of `{var}` tokens per key across EN and AR.
   - Result: **PASS**. 0 placeholder format mismatches.

3. **TypeScript Type Safety**
   - Claim: `npx tsc --noEmit` completes with 0 errors.
   - Verification method: Executed `npx tsc --noEmit` in `d:\football\kickoff`.
   - Result: **PASS**. Exit code 0, 0 errors.

4. **Next.js Production Build Health**
   - Claim: `npm run build` generates all 33 static pages successfully.
   - Verification method: Executed `npm run build` in `d:\football\kickoff`.
   - Result: **PASS**. Exit code 0, all 33 static routes compiled.

---

## Summary Recommendation

**REQUEST_CHANGES**: Worker must complete the component refactoring in `home/page.tsx`, `matches/page.tsx`, `book/page.tsx`, `checkout/page.tsx`, and `profile/page.tsx` by replacing all remaining hardcoded `isArabic` inline string ternaries with i18n keys in `en.json` and `ar.json`.
