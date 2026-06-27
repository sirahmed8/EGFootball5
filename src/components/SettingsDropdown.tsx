'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Moon, Sun, Languages, LogOut, LayoutDashboard, Users, Trophy } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from '@/i18n/routing';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';

export function SettingsDropdown() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Settings');
  const tNav = useTranslations('Navbar');
  const appUser = useAuthStore(s => s.appUser);
  const firebaseUser = useAuthStore(s => s.firebaseUser);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    localStorage.setItem('preferredLocale', nextLocale);
    router.replace(pathname, { locale: nextLocale });
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (!mounted) {
    return (
      <div className="text-muted-foreground rounded-full p-2">
        <Settings className="h-5 w-5 opacity-50" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground rounded-full p-2 hover:bg-muted/50 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Settings className="h-5 w-5" />
        <span className="sr-only">{t('title')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {firebaseUser && appUser?.role === 'owner' && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{appUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {appUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/matches" className="flex items-center w-full px-1.5 py-1">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>{tNav('publicMatches')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/owner" className="flex items-center w-full px-1.5 py-1">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>{tNav('ownerDashboard')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/owner/users" className="flex items-center w-full px-1.5 py-1">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{t('users')}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('title')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer">
            <Languages className="mr-2 h-4 w-4" />
            <span>{locale === 'ar' ? t('english') : t('arabic')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
            {resolvedTheme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{resolvedTheme === 'dark' ? t('lightMode') : t('darkMode')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {firebaseUser && appUser?.role === 'owner' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{tNav('logout')}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
