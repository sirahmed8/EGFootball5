'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from './ui/button';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    // Observe body for mobile side menu open state
    const checkMenu = () => {
      setIsMenuOpen(document.body.getAttribute('data-mobile-menu-open') === 'true');
    };
    checkMenu();

    const observer = new MutationObserver(checkMenu);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-mobile-menu-open'] });
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const showButton = isVisible && !isMenuOpen;

  return (
    <Button
      className={`fixed bottom-24 end-5 md:bottom-8 md:end-8 z-40 rounded-full w-12 h-12 p-0 shadow-[0_0_15px_rgba(57,255,20,0.3)] bg-primary text-black hover:bg-primary/90 hover:scale-110 transition-all duration-300 ${
        showButton ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" />
    </Button>
  );
}
