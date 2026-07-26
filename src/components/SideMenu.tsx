'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';
import {
  X, Settings, Moon, Sun, Languages, LogOut,
  LayoutDashboard, Users, Trophy, Home, CalendarDays, UserCircle, Menu,
} from 'lucide-react';
import Image from 'next/image';

// ── Sidebar content (shared between desktop & mobile) ─────────────────────────
function SidebarContent({ onClose, isMobile }: { onClose?: () => void; isMobile: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Settings');
  const tNav = useTranslations('Navbar');
  const appUser = useAuthStore(s => s.appUser);
  const firebaseUser = useAuthStore(s => s.firebaseUser);
  const isDark = mounted && resolvedTheme === 'dark';

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    localStorage.setItem('preferredLocale', nextLocale);
    onClose?.();
    router.replace(pathname, { locale: nextLocale, scroll: false });
  };

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose?.();
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleNav = (href: string) => {
    onClose?.();
    router.push(href as '/');
  };

  const navLinks = [
    ...(appUser?.role !== 'owner' ? [{ href: '/home', label: tNav('bookPitch'), icon: <Home size={18} /> }] : []),
    ...(appUser?.role !== 'owner' ? [{ href: '/matches', label: tNav('publicMatches'), icon: <Trophy size={18} /> }] : []),
    ...(appUser?.role !== 'owner' ? [{ href: '/book', label: tNav('bookPitch'), icon: <CalendarDays size={18} /> }] : []),
    ...(appUser?.role === 'admin' ? [{ href: '/admin/dashboard', label: tNav('adminDashboard'), icon: <LayoutDashboard size={18} /> }] : []),
    ...(appUser?.role === 'owner' ? [{ href: '/owner', label: tNav('ownerDashboard'), icon: <LayoutDashboard size={18} /> }] : []),
    ...(appUser?.role === 'owner' ? [{ href: '/owner/dashboard', label: tNav('analytics'), icon: <Trophy size={18} /> }] : []),
    ...(appUser?.role === 'owner' ? [{ href: '/owner/users', label: tNav('managePlayers'), icon: <Users size={18} /> }] : []),
    ...(firebaseUser && appUser?.role !== 'owner' ? [{ href: '/profile', label: tNav('profile'), icon: <UserCircle size={18} /> }] : []),
  ].filter((link, idx, arr) => arr.findIndex(l => l.href === link.href) === idx);

  return (
    <div className="flex flex-col h-full">
      {/* Logo header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
        <Link href="/" onClick={() => onClose?.()} className="flex items-center gap-2">
          <Image src="/favicon.jpg" alt="Logo" width={28} height={28} className="rounded-full object-cover" priority={true} />
          <span className="font-black text-base tracking-tight">
            EG<span className="text-primary">Football5</span>
          </span>
        </Link>
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* User info */}
      {firebaseUser && appUser && (
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <p className="font-semibold text-sm text-foreground truncate">{appUser.name}</p>
          <p className="text-xs text-muted-foreground truncate">{appUser.email}</p>
        </div>
      )}

      {/* Nav links — scrollable */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navLinks.map(link => (
          <button
            key={link.href}
            onClick={() => handleNav(link.href)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-start"
          >
            <span className="text-primary flex-shrink-0">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </button>
        ))}

        {!firebaseUser && (
          <button
            onClick={() => handleNav('/login')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-all text-start"
          >
            {tNav('signIn')}
          </button>
        )}
      </nav>

      {/* Settings — pinned bottom */}
      <div className="flex-shrink-0 border-t border-border px-2 py-3 space-y-0.5">
        <p className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Settings size={11} />{t('title')}
        </p>

        {/* Language */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-start"
        >
          <Languages size={18} className="text-primary flex-shrink-0" />
          {locale === 'ar' ? t('english') : t('arabic')}
        </button>

        {/* Theme */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-start"
          >
            {isDark ? <Sun size={18} className="text-primary flex-shrink-0" /> : <Moon size={18} className="text-primary flex-shrink-0" />}
            {isDark ? t('lightMode') : t('darkMode')}
          </button>
        )}

        {/* Logout */}
        {firebaseUser && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-start"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {tNav('logout')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Mobile drawer — always mounted (CSS transform, no flicker) ────────────────
// Drawer ALWAYS opens from the RIGHT (same side as hamburger button)
function MobileDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  React.useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-mobile-menu-open', 'true');
    } else {
      document.body.removeAttribute('data-mobile-menu-open');
    }
    return () => {
      document.body.removeAttribute('data-mobile-menu-open');
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-muted transition-colors text-foreground cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer — slides from left in LTR, right in RTL */}
      <div
        className={`fixed top-0 z-[60] h-full w-72 max-w-[85vw]
          bg-background overflow-hidden shadow-2xl outline outline-1 outline-border
          transition-transform duration-200 ease-in-out
          ${isRTL ? 'end-0 border-e border-border rounded-e-2xl' : 'start-0 border-s border-border rounded-s-2xl'}`}
        style={{
          transform: isOpen
            ? 'translateX(0)'
            : isRTL
            ? 'translateX(110%)'
            : 'translateX(-110%)',
        }}
      >
        <SidebarContent onClose={() => setIsOpen(false)} isMobile={true} />
      </div>
    </>
  );
}

// ── Desktop persistent sidebar ────────────────────────────────────────────────
export function DesktopSidebar() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <aside
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`hidden md:flex flex-col fixed top-0 bottom-0 z-40 w-64
        bg-background border-border overflow-hidden
        ${isRTL
          ? 'end-0 border-e rounded-e-2xl outline outline-1 outline-border'
          : 'start-0 border-s rounded-s-2xl outline outline-1 outline-border'
        }`}
    >
      <SidebarContent isMobile={false} />
    </aside>
  );
}

// ── Mobile trigger export ─────────────────────────────────────────────────────
export function SideMenu() {
  return <MobileDrawer />;
}
