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
    <>
      {/* ── Mobile top bar ───────────────────────────────────── */}
      <nav className="md:hidden fixed top-0 start-0 end-0 z-50 bg-background border-b border-border">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter text-foreground">
            <Image src="/favicon.jpg" alt="EGFootball5 Logo" width={28} height={28} className="rounded-full object-cover" priority={true} />
            <span>EG<span className="text-primary">Football5</span></span>
          </Link>
          <div className="flex items-center gap-1">
            <PresenceIndicator />
            {firebaseUser && <NotificationBell />}
            <SideMenu />
          </div>
        </div>
      </nav>

      {/* ── Desktop top bar (right of sidebar in LTR, left of sidebar in RTL) ── */}
      <header className="hidden md:flex fixed top-0 z-40 h-16 items-center justify-end px-6 border-b border-border bg-background
        ltr:left-64 ltr:right-0
        rtl:right-64 rtl:left-0">
        <div className="flex items-center gap-2">
          <PresenceIndicator />
          {firebaseUser && <NotificationBell />}
        </div>
      </header>
    </>
  );
}
