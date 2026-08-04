'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';
import {
  Settings,
  User,
  Languages,
  Sun,
  Moon,
  LogOut,
  X,
  ShieldCheck,
  ChevronDown,
  Crown,
} from 'lucide-react';
import { isUserVip } from '@/lib/vip';
import Image from 'next/image';

export function NavbarSettingsMenu() {
  const { appUser, firebaseUser } = useAuthStore();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Settings');
  const tNav = useTranslations('Navbar');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    localStorage.setItem('preferredLocale', nextLocale);
    setIsOpen(false);

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.replace(pathname, { locale: nextLocale, scroll: false });
      });
    } else {
      router.replace(pathname, { locale: nextLocale, scroll: false });
    }
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-transitioning');
      setTheme(nextTheme);
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 500);
    } else {
      setTheme(nextTheme);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      router.push('/');
      toast.success(locale === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    } catch {
      toast.error(locale === 'ar' ? 'فشل تسجيل الخروج' : 'Failed to logout');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-muted/80 border border-border/60 transition-all cursor-pointer text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="User Settings"
      >
        {firebaseUser?.photoURL ? (
          <img
            src={firebaseUser.photoURL}
            alt={appUser?.name || 'User'}
            className="w-7 h-7 rounded-full object-cover border border-primary/40 shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/40">
            {appUser?.name ? appUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-primary" />}
          </div>
        )}

        <span className="hidden lg:flex items-center gap-1.5 text-xs font-bold">
          <span className="truncate max-w-[150px]">
            {appUser?.name || firebaseUser?.displayName || (locale === 'ar' ? 'حسابي' : 'Account')}
          </span>
          {isUserVip(appUser) && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
        </span>
        <Settings className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors shrink-0" />
      </button>

      {/* Animated Settings Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="settings-window"
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 end-0 w-80 bg-[#0B0F19] border-2 border-emerald-500/30 rounded-3xl shadow-2xl z-[9999] overflow-hidden p-5 space-y-4 text-foreground global-outline-glow"
          >
            {/* Header / User Info Card */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={appUser?.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0 border-2 border-primary/40">
                    {appUser?.name ? appUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-sm text-foreground truncate max-w-[140px]">
                      {appUser?.name || firebaseUser?.displayName || (locale === 'ar' ? 'لاعب كريم' : 'Player')}
                    </span>
                    {isUserVip(appUser) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black inline-flex items-center gap-0.5 shrink-0">
                        <Crown className="w-3 h-3 text-amber-400" /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {firebaseUser?.email || (locale === 'ar' ? 'مسجل كزائر' : 'Guest Player')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <p className="text-[11px] font-black text-muted-foreground/70 uppercase tracking-wider px-1">
                {t('title')}
              </p>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-between px-3.5 py-3 global-list-item bg-white/5 border border-white/10 text-sm font-bold text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'ar' ? 'اللغة العربية' : 'English'}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono bg-neutral-900 px-2.5 py-1 rounded-lg border border-white/10 font-bold">
                  {locale === 'ar' ? 'English' : 'العربية'}
                </span>
              </button>

              {/* Theme Switcher */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3.5 py-3 global-list-item bg-white/5 border border-white/10 text-sm font-bold text-foreground"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? (
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{isDark ? t('lightMode') : t('darkMode')}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono bg-neutral-900 px-2.5 py-1 rounded-lg border border-white/10 font-bold">
                    {isDark ? (locale === 'ar' ? 'نهار' : 'Light') : (locale === 'ar' ? 'ليل' : 'Dark')}
                  </span>
                </button>
              )}
            </div>

            {/* Logout Button */}
            {firebaseUser && (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-black transition-all cursor-pointer text-sm shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{tNav('logout')}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
