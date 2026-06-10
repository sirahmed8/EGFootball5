'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
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
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Navbar'); // We will add settings translations later or hardcode

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    window.location.href = `/${nextLocale}${pathname === '/' ? '' : pathname}`;
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground rounded-full p-2 hover:bg-muted/50 transition-all active:scale-90 focus:outline-none">
        <Settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleLanguage} className="cursor-pointer">
            <Languages className="mr-2 h-4 w-4" />
            <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
