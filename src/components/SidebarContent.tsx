'use client';

import * as React from 'react';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import {
  X,
  LayoutDashboard,
  Users,
  Trophy,
  Home,
  UserCircle,
  Award,
  Medal,
  Bell,
  Sparkles,
  Megaphone,
  BookOpen,
  ShieldCheck,
  Swords,
  Tv,
  Camera,
  Shirt,
  Crown,
  Activity,
  Tag,
} from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function SidebarContent({ onClose, isMobile }: { onClose?: () => void; isMobile: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations('Navbar');
  const appUser = useAuthStore((s) => s.appUser);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const navRef = React.useRef<HTMLElement | null>(null);

  const handleNav = (href: string) => {
    onClose?.();
    if (href === '/community-chat') {
      window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { tab: 'community' } }));
      return;
    }
    if (href === '/support') {
      window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { tab: 'support' } }));
      return;
    }
    const normalize = (p: string) => p.replace(/\/$/, '') || '/';
    if (normalize(pathname) === normalize(href)) {
      return;
    }
    router.push(href as '/');
  };

  const isArabic = locale === 'ar';

  const sections: NavSection[] = [
    {
      title: isArabic ? '⚽ الملاعب والمباريات' : '⚽ Pitches & Lobbies',
      items: [
        { href: '/home', label: tNav('browsePitches'), icon: <Home size={18} /> },
        { href: '/matches', label: tNav('publicMatches'), icon: <Trophy size={18} /> },
        { href: '/var-highlights', label: tNav('varHighlights'), icon: <Camera size={18} /> },
        { href: '/live-stream', label: tNav('liveStream'), icon: <Tv size={18} /> },
      ],
    },
    {
      title: isArabic ? '🏆 المنافسات والفرق' : '🏆 Squads & League',
      items: [
        { href: '/challenges', label: tNav('challenges'), icon: <Swords size={18} /> },
        { href: '/tournaments', label: tNav('tournaments'), icon: <Trophy size={18} /> },
        { href: '/communities', label: tNav('communities'), icon: <Users size={18} /> },
        { href: '/leaderboard', label: tNav('leaderboard'), icon: <Award size={18} /> },
      ],
    },
    {
      title: isArabic ? '👕 المتاجر والاشتراكات' : '👕 Custom Store & VIP',
      items: [
        { href: '/jersey-designer', label: tNav('jerseyDesigner'), icon: <Shirt size={18} /> },
        { href: '/subscription', label: tNav('subscription'), icon: <Crown size={18} /> },
        { href: '/pricing', label: isArabic ? 'الأسعار والباقات' : 'Pricing Passes', icon: <Tag size={18} /> },
      ],
    },
    {
      title: isArabic ? '👤 حسابي وإشعاراتي' : '👤 Player Hub',
      items: [
        ...(firebaseUser ? [{ href: '/profile', label: tNav('profile'), icon: <UserCircle size={18} /> }] : []),
        ...(firebaseUser ? [{ href: '/achievements', label: tNav('achievements'), icon: <Medal size={18} /> }] : []),
        ...(firebaseUser ? [{ href: '/notifications', label: tNav('notifications'), icon: <Bell size={18} /> }] : []),
        { href: '/goal-of-the-month', label: tNav('goalOfTheMonth') || (isArabic ? 'هدف الشهر' : 'Goal of the Month'), icon: <Sparkles size={18} /> },
      ],
    },
    {
      title: isArabic ? '📣 الأخبار والدليل' : '📣 News & Charter',
      items: [
        { href: '/ceremony', label: tNav('ceremony'), icon: <Sparkles size={18} /> },
        { href: '/announcements', label: tNav('announcements'), icon: <Megaphone size={18} /> },
        { href: '/guide', label: tNav('guide'), icon: <BookOpen size={18} /> },
      ],
    },
    ...(appUser?.role === 'admin' || appUser?.role === 'owner'
      ? [
          {
            title: isArabic ? '⚙️ الإدارة والتحكم' : '⚙️ Management',
            items: [
              ...(appUser?.role === 'admin' ? [{ href: '/admin/dashboard', label: tNav('adminDashboard'), icon: <LayoutDashboard size={18} /> }] : []),
              ...(appUser?.role === 'owner' ? [{ href: '/owner', label: tNav('ownerDashboard'), icon: <LayoutDashboard size={18} /> }] : []),
              ...(appUser?.role === 'owner' ? [{ href: '/owner/analytics', label: isArabic ? 'إحصائيات وأرباح المنصة' : 'Master Analytics', icon: <Activity size={18} /> }] : []),
              ...(appUser?.role === 'admin' || appUser?.role === 'owner' ? [{ href: '/owner/users', label: isArabic ? 'إدارة اللاعبين (VIP)' : 'Manage Players', icon: <ShieldCheck size={18} /> }] : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-black text-foreground overflow-hidden">
      {/* Mobile Drawer Header */}
      {isMobile && (
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0 bg-black">
          <div className="flex items-center gap-2 font-black text-base tracking-tight text-foreground">
            <Image src="/favicon.jpg" alt="EGFootball5 platform emblem" width={28} height={28} className="rounded-xl object-cover shadow-md shrink-0" priority={true} />
            <span className="truncate">EG<span className="text-gradient-primary">Football5</span></span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm custom-scrollbar overscroll-contain">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground/60 select-none">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNav(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer text-start ${
                      isActive
                        ? 'bg-primary text-black shadow-md glow-primary-sm font-black'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-[0.98]'
                    }`}
                  >
                    <span className={`shrink-0 ${isActive ? 'text-black' : 'text-primary/70'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div className="p-3 border-t border-white/10 shrink-0 bg-black">
        <Link
          href="/guide"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/5 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{isArabic ? 'ميثاق وقواعد المنصة' : 'Platform Rules'}</span>
        </Link>
      </div>
    </div>
  );
}
