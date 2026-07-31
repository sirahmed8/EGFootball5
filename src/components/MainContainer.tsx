'use client';

import * as React from 'react';
import { usePathname } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const loading = useAuthStore((s) => s.loading);

  // Always scroll to top instantly when navigating to any page
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  const hasSidebar = !loading && !!firebaseUser;

  return (
    <main className={`min-h-screen flex flex-col pt-16 md:pt-16 transition-all duration-300 ${hasSidebar ? 'md:ms-64' : ''}`}>
      {children}
    </main>
  );
}
