'use client';

import { AnimatePresence } from 'framer-motion';
import { PageTransitionWrapper } from '@/components/MotionWrapper';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransitionWrapper key={pathname} className="w-full flex-1 flex flex-col min-h-screen">
        {children}
      </PageTransitionWrapper>
    </AnimatePresence>
  );
}
