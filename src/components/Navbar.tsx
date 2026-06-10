'use client';

import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, buttonVariants } from './ui/button';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import { SettingsDropdown } from './SettingsDropdown';

export function Navbar() {
  const { firebaseUser, appUser } = useAuthStore();
  const t = useTranslations('Navbar');

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-foreground hover:scale-105 active:scale-95 transition-all duration-200">
          EG<span className="text-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">Football5</span>
        </Link>
        <div className="flex items-center gap-6">
          {(appUser?.role === 'admin' || appUser?.role === 'owner') && (
            <Link href="/admin" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">
              {t('adminDashboard')}
            </Link>
          )}
          {appUser?.role === 'owner' && (
            <Link href="/owner" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">
              Owner Dashboard
            </Link>
          )}
          {firebaseUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {t('hi', { name: appUser?.name || 'Player' })}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                {t('logout')}
              </Button>
            </div>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: 'default', size: 'sm', className: "bg-primary text-black hover:bg-primary/90 font-bold" })}>
              {t('signIn')}
            </Link>
          )}
          <SettingsDropdown />
        </div>
      </div>
    </nav>
  );
}
