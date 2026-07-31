'use client';

import * as React from 'react';
import { usePathname } from '@/i18n/routing';

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Always scroll to top instantly when navigating to any page
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <main className="min-h-screen flex flex-col pt-16 md:pt-16 md:ms-64 transition-all duration-300">
      {children}
    </main>
  );
}
