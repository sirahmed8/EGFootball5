'use client';

import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationBell } from './NotificationBell';
import { SideMenu } from './SideMenu';
import PresenceIndicator from './PresenceIndicator';
import Image from 'next/image';

// This navbar only shows on mobile (md:hidden).
// On desktop the DesktopSidebar handles everything.
export function Navbar() {
  const firebaseUser = useAuthStore(s => s.firebaseUser);

  return (
    <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter text-foreground">
          <Image src="/favicon.jpg" alt="EGFootball5 Logo" width={28} height={28} className="rounded-full object-cover" />
          <span>EG<span className="text-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">Football5</span></span>
        </Link>
        <div className="flex items-center gap-1">
          <PresenceIndicator />
          {firebaseUser && <NotificationBell />}
          <SideMenu />
        </div>
      </div>
    </nav>
  );
}
