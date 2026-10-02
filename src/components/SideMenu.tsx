'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SidebarContent } from './SidebarContent';


// ── Mobile Drawer ─────────────────────────────────────────────────────────────
function MobileDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fix #16: Close drawer on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const slideOffset = isRTL ? '100%' : '-100%';

  return (
    <>
      {/* Hamburger Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-foreground cursor-pointer focus:outline-none xl:hidden shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[9999998] bg-black/80 backdrop-blur-md"
                  onClick={() => setIsOpen(false)}
                />

                {/* Drawer */}
                <motion.div
                  key="drawer-content"
                  initial={{ x: slideOffset }}
                  animate={{ x: 0 }}
                  exit={{ x: slideOffset }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="fixed inset-y-0 z-[9999999] w-72 max-w-[85vw] bg-black shadow-2xl border-white/10 start-0 border-e flex flex-col overflow-hidden"
                >
                  <SidebarContent onClose={() => setIsOpen(false)} isMobile={true} />
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export function DesktopSidebar() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const loading = useAuthStore((s) => s.loading);

  // Only render sidebar for authenticated users
  if (loading || !firebaseUser) return null;

  return (
    <aside className="hidden xl:flex flex-col w-56 sm:w-60 shrink-0 fixed start-0 top-16 bottom-0 z-40 bg-black border-e border-white/10 overflow-hidden">
      <SidebarContent isMobile={false} />
    </aside>
  );
}

// ── SideMenu Export ───────────────────────────────────────────────────────────
export function SideMenu() {
  return <MobileDrawer />;
}
