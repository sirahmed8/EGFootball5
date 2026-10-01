'use client';

import * as React from 'react';
import { usePathname } from '@/i18n/routing';

export function ReadingProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = React.useState(0);

  // Show reading progress bar primarily on documentation, legal, guide, and long-form pages
  const isDocumentPage = React.useMemo(() => {
    return ['/privacy', '/terms', '/refund', '/cookies', '/guide', '/announcements'].some(
      (path) => pathname?.includes(path)
    );
  }, [pathname]);

  React.useEffect(() => {
    if (!isDocumentPage) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const percentage = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));
        setProgress(percentage);
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, [isDocumentPage, pathname]);

  if (!isDocumentPage || progress <= 0) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-[1001] h-[2.5px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary/80 via-primary to-emerald-400 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(57,255,20,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
