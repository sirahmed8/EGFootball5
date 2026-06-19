'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from './ui/button';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const toggleVisibility = () => {
      if (timeoutId) return;

      timeoutId = setTimeout(() => {
        setIsVisible(window.scrollY > 300);
        timeoutId = null;
      }, 100); // 100ms throttle
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      className={`fixed bottom-8 end-8 z-50 rounded-full w-12 h-12 p-0 shadow-[0_0_15px_rgba(57,255,20,0.3)] bg-primary text-black hover:bg-primary/90 hover:scale-110 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" />
    </Button>
  );
}
