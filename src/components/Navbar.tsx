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
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          EG<span className="text-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">Football5</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/book" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            {t('bookPitch')}
          </Link>
          {appUser?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors drop-shadow-[0_0_5px_rgba(0,255,255,0.3)]">
              {t('adminDashboard')}
            </Link>
          )}
          {firebaseUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400 hidden sm:inline-block">
                {t('hi', { name: appUser?.name || 'Player' })}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
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
