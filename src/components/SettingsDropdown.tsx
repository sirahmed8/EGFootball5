'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from '@/i18n/routing';
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
import { Settings, Moon, Sun, Languages } from 'lucide-react';

export function SettingsDropdown() {
  const { setTheme, theme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Settings');

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    localStorage.setItem('preferredLocale', nextLocale);
    const search = window.location.search;
    window.location.href = `/${nextLocale}${pathname === '/' ? '' : pathname}${search}`;
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground rounded-full p-2 hover:bg-muted/50 transition-all active:scale-90 focus:outline-none">
        <Settings className="h-5 w-5" />
        <span className="sr-only">{t('title')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('title')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer">
            <Languages className="mr-2 h-4 w-4" />
            <span>{locale === 'ar' ? t('english') : t('arabic')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
