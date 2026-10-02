/**
 * Currency Formatting & Conversion Utilities
 * Handles Egyptian Pound (EGP / ج.م) and USD ($) formatting with native Intl APIs.
 */

export type SupportedCurrency = 'EGP' | 'USD';

// Approximate conversion rate: 1 USD ~ 50 EGP
export const USD_TO_EGP_RATE = 50;

/**
 * Formats a given monetary amount according to active currency and locale.
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'EGP',
  locale: string = 'ar'
): string {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const isArabic = locale.startsWith('ar');

  try {
    if (currency === 'EGP') {
      return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0,
      }).format(safeAmount);
    }

    return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
    }).format(safeAmount);
  } catch {
    // Fallback if Intl fails
    if (currency === 'EGP') {
      return isArabic ? `${safeAmount} ج.م` : `${safeAmount} EGP`;
    }
    return `$${safeAmount}`;
  }
}

/**
 * Converts EGP amount to USD for international visitors.
 */
export function egpToUsd(egpAmount: number): number {
  if (!egpAmount || egpAmount <= 0) return 0;
  return Math.round((egpAmount / USD_TO_EGP_RATE) * 100) / 100;
}

/**
 * Formats price with billing cycle annotation.
 */
export function formatSubscriptionPrice(
  amountEgp: number,
  currency: SupportedCurrency,
  cycle: 'monthly' | 'annual' | 'quarterly',
  locale: string
): { formatted: string; periodLabel: string; savingsLabel?: string } {
  const isArabic = locale.startsWith('ar');
  const amount = currency === 'USD' ? egpToUsd(amountEgp) : amountEgp;
  const formatted = formatCurrency(amount, currency, locale);

  let periodLabel = isArabic ? '/ شهر' : '/ month';
  if (cycle === 'annual') {
    periodLabel = isArabic ? '/ سنة' : '/ year';
  } else if (cycle === 'quarterly') {
    periodLabel = isArabic ? '/ 3 أشهر' : '/ 3 months';
  }

  let savingsLabel: string | undefined;
  if (cycle === 'annual') {
    savingsLabel = isArabic ? 'وفر شهرين مجاناً (17%)' : '2 Months Free (Save 17%)';
  } else if (cycle === 'quarterly') {
    savingsLabel = isArabic ? 'وفر 16%' : 'Save 16%';
  }

  return { formatted, periodLabel, savingsLabel };
}
