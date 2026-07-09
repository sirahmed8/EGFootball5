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
  Menu, X, Settings, Moon, Sun, Languages, LogOut,
  LayoutDashboard, Users, Trophy, Home, CalendarDays, UserCircle,
} from 'lucide-react';

export function SideMenu() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Settings');
  const tNav = useTranslations('Navbar');
  const appUser = useAuthStore(s => s.appUser);
  const firebaseUser = useAuthStore(s => s.firebaseUser);

  React.useEffect(() => { setMounted(true); }, []);

  const open = () => { setIsOpen(true); setIsClosing(false); };
  const close = () => { setIsClosing(true); };

  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsOpen(false);
      setIsClosing(false);
    }
  };

  const handleNav = (href: string) => {
    close();
    setTimeout(() => router.push(href as '/'), 220);
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    localStorage.setItem('preferredLocale', nextLocale);
    router.replace(pathname, { locale: nextLocale });
    close();
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      close();
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const isDark = mounted && resolvedTheme === 'dark';

  const navLinks = [
    ...(appUser?.role !== 'owner' ? [{ href: '/home', label: tNav('bookPitch'), icon: <Home size={18} /> }] : []),
    ...(appUser?.role !== 'owner' ? [{ href: '/matches', label: tNav('publicMatches'), icon: <Trophy size={18} /> }] : []),
    ...(appUser?.role === 'admin' ? [{ href: '/admin/dashboard', label: tNav('adminDashboard'), icon: <LayoutDashboard size={18} /> }] : []),
    ...(appUser?.role === 'owner' ? [{ href: '/owner', label: tNav('ownerDashboard'), icon: <LayoutDashboard size={18} /> }] : []),
    ...(appUser?.role === 'owner' ? [{ href: '/owner/users', label: t('users'), icon: <Users size={18} /> }] : []),
    ...(firebaseUser && appUser?.role !== 'owner' ? [{ href: '/profile', label: 'Profile', icon: <UserCircle size={18} /> }] : []),
    ...(appUser?.role !== 'owner' ? [{ href: '/book', label: tNav('bookPitch'), icon: <CalendarDays size={18} /> }] : []),
  ];

  // Deduplicate by href
  const uniqueLinks = navLinks.filter((link, idx, arr) => arr.findIndex(l => l.href === link.href) === idx);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={isOpen ? close : open}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-foreground"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${isClosing ? 'animate-out fade-out duration-200 fill-forwards' : 'animate-in fade-in duration-200'}`}
          onClick={close}
          onAnimationEnd={handleAnimationEnd}
        />
      )}

      {/* Side Panel */}
      {isOpen && (
        <div
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          className={`fixed top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} z-[60] h-full w-80 max-w-[85vw] flex flex-col rounded-${locale === 'ar' ? 'l' : 'r'}-2xl shadow-2xl
            bg-background border-${locale === 'ar' ? 'l' : 'r'} border-border overflow-hidden
            ${isClosing
              ? `animate-out ${locale === 'ar' ? 'slide-out-to-right' : 'slide-out-to-left'} duration-200 fill-forwards`
              : `animate-in ${locale === 'ar' ? 'slide-in-from-right' : 'slide-in-from-left'} duration-200`
            }`}
          onAnimationEnd={handleAnimationEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <span className="font-black text-lg tracking-tight">
              EG<span className="text-primary drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]">Football5</span>
            </span>
            <button onClick={close} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* User info */}
          {firebaseUser && appUser && (
            <div className="px-5 py-4 border-b border-border flex-shrink-0">
              <p className="font-semibold text-foreground">{appUser.name}</p>
              <p className="text-xs text-muted-foreground">{appUser.email}</p>
            </div>
          )}

          {/* Nav Links — scrollable */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            {uniqueLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-start"
              >
                <span className="text-primary">{link.icon}</span>
                {link.label}
              </button>
            ))}
          </nav>

          {/* Settings section — fixed at bottom */}
          <div className="flex-shrink-0 border-t border-border px-3 py-3 space-y-1">
            <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Settings size={12} className="inline me-1" />{t('title')}
            </p>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-start"
            >
              <Languages size={18} className="text-primary" />
              {locale === 'ar' ? t('english') : t('arabic')}
            </button>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-start"
              >
                {isDark
                  ? <Sun size={18} className="text-primary" />
                  : <Moon size={18} className="text-primary" />}
                {isDark ? t('lightMode') : t('darkMode')}
              </button>
            )}

            {/* Logout */}
            {firebaseUser && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-start"
              >
                <LogOut size={18} />
                {tNav('logout')}
              </button>
            )}

            {/* Sign In */}
            {!firebaseUser && (
              <button
                onClick={() => handleNav('/login')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-all text-start"
              >
                {tNav('signIn')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
