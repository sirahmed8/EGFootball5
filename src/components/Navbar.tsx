'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, buttonVariants } from './ui/button';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { SettingsDropdown } from './SettingsDropdown';
import { NotificationBell } from './NotificationBell';
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import PresenceIndicator from './PresenceIndicator';
import Image from 'next/image';

export function Navbar() {
  const firebaseUser = useAuthStore(s => s.firebaseUser);
  const appUser = useAuthStore(s => s.appUser);
  const t = useTranslations('Navbar');
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
      setIsMobileMenuOpen(false);
    } catch {
      toast.error('Failed to logout');
    }
  };

  const closeMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuClosing(true);
    }
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMenu();
    } else {
      setIsMobileMenuOpen(true);
      setIsMobileMenuClosing(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2 text-2xl font-black tracking-tighter text-foreground hover:scale-105 active:scale-95 transition-all duration-200">
          <Image src="/favicon.jpg" alt="EGFootball5 Logo" width={32} height={32} className="rounded-full object-cover" />
          <span>EG<span className="text-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">Football5</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <PresenceIndicator />
          {appUser?.role !== 'owner' && (
            <Link href="/matches" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('publicMatches')}
            </Link>
          )}
          {appUser?.role === 'admin' && (
            <Link href="/admin/dashboard" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">
              {t('adminDashboard')}
            </Link>
          )}
          {firebaseUser && appUser?.role !== 'owner' ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {t('hi', { name: appUser?.name || 'Player' })}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                {t('logout')}
              </Button>
            </div>
          ) : !firebaseUser ? (
            <Link href="/login" className={buttonVariants({ variant: 'default', size: 'sm', className: "bg-primary text-black hover:bg-primary/90 font-bold" })}>
              {t('signIn')}
            </Link>
          ) : null}
          {firebaseUser && <NotificationBell />}
          <SettingsDropdown />
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <PresenceIndicator />
          {firebaseUser && <NotificationBell />}
          <SettingsDropdown />
          {appUser?.role !== 'owner' && (
            <button 
              onClick={toggleMobileMenu} 
              className="text-foreground p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div 
          className={`md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg ${
            isMobileMenuClosing ? 'animate-out slide-out-to-top-2 fade-out duration-200 fill-forwards' : 'animate-in slide-in-from-top-2 fade-in duration-200'
          }`}
          onAnimationEnd={() => {
            if (isMobileMenuClosing) {
              setIsMobileMenuOpen(false);
              setIsMobileMenuClosing(false);
            }
          }}
        >
          {firebaseUser && appUser?.role !== 'owner' && (
            <div className="text-sm text-muted-foreground pb-2 border-b border-border/50">
              {t('hi', { name: appUser?.name || 'Player' })}
            </div>
          )}
          {appUser?.role !== 'owner' && (
            <Link href="/matches" onClick={closeMenu} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('publicMatches')}
            </Link>
          )}
          {appUser?.role === 'admin' && (
            <Link href="/admin/dashboard" onClick={closeMenu} className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors">
              {t('adminDashboard')}
            </Link>
          )}
          {firebaseUser && appUser?.role !== 'owner' ? (
            <Button variant="outline" className="w-full justify-center mt-2 border-border" onClick={handleLogout}>
              {t('logout')}
            </Button>
          ) : !firebaseUser ? (
            <Link href="/login" onClick={closeMenu} className={buttonVariants({ variant: 'default', className: "w-full bg-primary text-black hover:bg-primary/90 font-bold mt-2" })}>
              {t('signIn')}
            </Link>
          ) : null}
        </div>
      )}
    </nav>
  );
}
