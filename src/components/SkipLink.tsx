'use client';

import { useTranslations } from 'next-intl';

export function SkipLink() {
  const t = useTranslations('Navbar');
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[9999999] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-primary focus:text-black focus:font-black focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-black"
    >
      {t('skipToContent') || 'Skip to main content'}
    </a>
  );
}
