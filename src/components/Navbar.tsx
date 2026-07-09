'use client';

import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationBell } from './NotificationBell';
import { SideMenu } from './SideMenu';
import PresenceIndicator from './PresenceIndicator';
import Image from 'next/image';

export function Navbar() {
  const firebaseUser = useAuthStore(s => s.firebaseUser);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black tracking-tighter text-foreground hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Image src="/favicon.jpg" alt="EGFootball5 Logo" width={32} height={32} className="rounded-full object-cover" />
          <span>EG<span className="text-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">Football5</span></span>
        </Link>

        <div className="flex items-center gap-2">
          <PresenceIndicator />
          {firebaseUser && <NotificationBell />}
          <SideMenu />
        </div>
      </div>
    </nav>
  );
}
