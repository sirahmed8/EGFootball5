'use client';

import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationBell } from './NotificationBell';
import PresenceIndicator from './PresenceIndicator';
import { SideMenu } from './SideMenu';
import { NavbarSettingsMenu } from './NavbarSettingsMenu';
import Image from 'next/image';

export function Navbar() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 stadium-glass border-b border-white/10 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 font-black text-xl tracking-tighter text-foreground hover:opacity-90 transition-opacity">
          <Image src="/favicon.jpg" alt="EGFootball5 Logo" width={32} height={32} className="rounded-full object-cover shadow-md" priority={true} />
          <span>EG<span className="text-gradient-primary">Football5</span></span>
        </Link>
      </div>

      {/* Controls & Menus */}
      <div className="flex items-center gap-2 md:gap-3">
        <PresenceIndicator />
        {firebaseUser && <NotificationBell />}
        <NavbarSettingsMenu />
        <SideMenu />
      </div>
    </header>
  );
}
