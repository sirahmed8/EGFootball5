'use client';

import * as React from 'react';
import { usePathname, Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, ArrowRight } from 'lucide-react';

export function MobileStickyCta() {
  const pathname = usePathname();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [show, setShow] = React.useState(false);

  // Avoid showing on dedicated booking, checkout, and admin pages
  const isExcludedRoute = React.useMemo(() => {
    return ['/book', '/checkout', '/admin', '/owner', '/login'].some((p) => pathname?.includes(p));
  }, [pathname]);

  React.useEffect(() => {
    if (isExcludedRoute) {
      setShow(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 320) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExcludedRoute]);

  if (isExcludedRoute) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-0 inset-x-0 z-40 p-3 bg-black/90 border-t border-white/15 backdrop-blur-xl md:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <Link
              href="/book"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-black font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{isArabic ? 'احجز ملعب الآن' : 'Book Pitch Now'}</span>
            </Link>

            <Link
              href="/matches"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-foreground font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isArabic ? 'المباريات العامة' : 'Public Matches'}</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
