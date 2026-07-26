# Milestone 4 Remediation — Code Changes Log

## Modified Files and Rationale

### 1. `next.config.ts`
- **Change**: Removed `output: process.env.NODE_ENV === 'development' || process.env.VERCEL === '1' ? undefined : 'export'` setting.
- **Rationale**: Next.js static export (`output: 'export'`) prevents API routes (`src/app/api/...`) from building cleanly during production `npm run build`. Removing static export enables full Next.js server/API functionality.

### 2. `src/app/[locale]/matches/page.tsx`
- **Change**: Replaced hardcoded `isArabic` string ternaries with i18n translation keys (`t('organizerCannotLeave')`, `t('noMatchesAvailable')`, `t('spotsLeft')`). Verified `<DialogTrigger>` uses `@base-ui/react` `render={...}` syntax without invalid `asChild` prop.
- **Rationale**: Ensures complete internationalization and prevents Base UI JSX prop type errors.

### 3. `src/app/[locale]/home/page.tsx`
- **Change**: Refactored hardcoded string ternaries on lines 558, 562-564, 574 to `t('ratePerHour')`, `t('pitchPreviewDesc')`, and `t('close')`.
- **Rationale**: Ensures home page modal strings are properly localized via `next-intl`.

### 4. `src/app/[locale]/book/page.tsx`
- **Change**: Refactored all hardcoded string ternaries on lines 74, 357, 367, 377, 412, 416-418, 442, 453, 459, 563-565 to use `t()` translation keys (`t('selectPitchFirst')`, `t('defaultLocation')`, `t('ratePerHour')`, `t('callManager')`, `t('matchDuration')`, `t('oneHour')`, `t('oneHalfHours')`, `t('twoHours')`, `t('promoCodeTitle')`, `t('apply')`, `t('discountAppliedTag')`, `t('slotInstruction')`).
- **Rationale**: Removes hardcoded inline strings in pitch booking flow.

### 5. `src/app/[locale]/checkout/page.tsx`
- **Change**: Refactored all hardcoded string ternaries on lines 306, 314, 324, 327, 334, 344, 348, 448, 460, 502, 512, 523, 529 to use `t()` translation keys (`t('dateLabel')`, `t('timeSlotLabel')`, `t('matchTypeLabel')`, `t('players')`, `t('costPerPlayerLabel')`, `t('totalPitchPriceLabel')`, `t('requiredDepositLabel')`, `t('receiptPreview')`, `t('uploadingReceipt')`, `t('digitalPassTitle')`, `t('printPassInstructions')`, `t('printPass')`, `t('close')`).
- **Rationale**: Removes hardcoded inline strings in checkout & digital entry pass modal.

### 6. `src/app/[locale]/profile/page.tsx`
- **Change**: Refactored hardcoded string ternaries on lines 150, 243, 449-451, 478, 495 to use `t()` translation keys (`t('depositLabel')`, `t('profileSaved')`, `t('noBookingsDesc')`, `t('favPitchesTitle')`, `t('quickBook')`).
- **Rationale**: Full localization of user profile page.

### 7. Translation Dictionaries (`src/messages/en.json`, `src/messages/ar.json`, `src/locales/en.json`, `src/locales/ar.json`)
- **Change**: Added missing translation keys for `Matches`, `Book`, `Checkout`, and `Profile` namespaces in both English and Arabic dictionaries.
- **Rationale**: Complete locale parity across all UI pages.

### 8. Physical CSS Utility Cleanup (`src/components/NotificationBell.tsx`, `src/components/FloatingChatWidget.tsx`)
- **Change**: Converted physical directional utilities (`right-1`, `-right-1`, `pr-1`, `-right-1.5`, `left-2.5`, `pl-8 pr-2`, `text-left`) to logical direction utilities (`end-1`, `-end-1`, `pe-1`, `-end-1.5`, `start-2.5`, `ps-8 pe-2`, `text-start`).
- **Rationale**: Guarantees bi-directional RTL/LTR design system compliance.
