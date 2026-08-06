'use client';

import * as React from 'react';
import { usePathname } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from '@/lib/animations';

import { DesktopSidebar } from './SideMenu';

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const loading = useAuthStore((s) => s.loading);

  const hasSidebar = !loading && !!firebaseUser;

  // Always scroll to top instantly when navigating to any page
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="flex min-h-screen pt-16 w-full max-w-full overflow-x-hidden">
      <DesktopSidebar />
      <main className={`flex-1 min-w-0 flex flex-col overflow-x-hidden ${hasSidebar ? 'xl:ps-56 sm:xl:ps-60' : ''}`}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
