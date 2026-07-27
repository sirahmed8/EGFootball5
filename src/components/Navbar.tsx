'use client';

import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationBell } from './NotificationBell';
import { SideMenu } from './SideMenu';
import { NavbarSettingsMenu } from './NavbarSettingsMenu';
import Image from 'next/image';

export function Navbar() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const loading = useAuthStore((s) => s.loading);

  const isLoggedIn = Boolean(firebaseUser && !loading);

  return (
    <>
      {/* ── Mobile top bar ───────────────────────────────────── */}
      <nav className="md:hidden fixed top-0 start-0 end-0 z-50 stadium-glass border-b border-white/10 backdrop-blur-xl">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter text-foreground">
            <Image src="/favicon.jpg" alt="EGFootball5 Logo" width={28} height={28} className="rounded-full object-cover shadow-md" priority={true} />
            <span>EG<span className="text-gradient-primary">Football5</span></span>
          </Link>
          <div className="flex items-center gap-2">
            {firebaseUser && <NotificationBell />}
            <NavbarSettingsMenu />
            <SideMenu />
          </div>
        </div>
      </nav>

      {/* ── Desktop top bar ── */}
      <header
        className={`hidden md:flex fixed top-0 z-40 h-16 items-center justify-between px-6 border-b border-white/10 stadium-glass backdrop-blur-xl transition-all duration-300 ${
          isLoggedIn ? 'ltr:left-64 ltr:right-0 rtl:right-64 rtl:left-0' : 'inset-x-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl tracking-tighter text-foreground hover:opacity-90 transition-opacity">
            <Image src="/favicon.jpg" alt="EGFootball5 Logo" width={32} height={32} className="rounded-full object-cover shadow-md" priority={true} />
            <span>EG<span className="text-gradient-primary">Football5</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {firebaseUser && <NotificationBell />}
          <NavbarSettingsMenu />
        </div>
      </header>
    </>
  );
}
