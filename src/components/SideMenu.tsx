'use client';

import * as React from 'react';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  Users,
  Trophy,
  Home,
  UserCircle,
  Menu,
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
} from 'lucide-react';
import Image from 'next/image';

import { createPortal } from 'react-dom';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Sidebar Content (shared between desktop & mobile) ─────────────────────────
function SidebarContent({ onClose, isMobile }: { onClose?: () => void; isMobile: boolean }) {
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
            <Image src="/favicon.jpg" alt="Logo" width={28} height={28} className="rounded-full object-cover shadow-md shrink-0" priority={true} />
            <span className="truncate">EG<span className="text-gradient-primary">Football5</span></span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-foreground transition-colors cursor-pointer shrink-0"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Categorized Nav Links — Expands to fill all remaining height */}
      <nav ref={navRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 pt-2.5 pb-3 space-y-3 bg-black scrollbar-thin scrollbar-thumb-white/20">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-3 mb-1 opacity-80">
              {section.title}
            </h4>

            {section.items.map((link) => {
              const normalize = (p: string) => p.replace(/\/$/, '') || '/';
              const isActive = normalize(pathname) === normalize(link.href);
              return (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-start cursor-pointer group ${
                    isActive
                      ? 'bg-primary text-black font-black shadow-lg scale-[1.01] hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/10 hover:translate-x-1 rtl:hover:-translate-x-1'
                  }`}
                >
                  <span className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'text-primary'}`}>{link.icon}</span>
                  <span className="truncate flex-1">{link.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer — Pinned firmly at the very bottom of the sidebar */}
      <div className="p-3 border-t border-white/10 bg-black shrink-0">
        {firebaseUser ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-xs shrink-0 shadow-inner">
              {appUser?.name?.[0]?.toUpperCase() || firebaseUser.displayName?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-foreground truncate">
                {appUser?.name || firebaseUser.displayName || (isArabic ? 'لاعب' : 'Player')}
              </div>
              <div className="text-[10px] text-muted-foreground truncate capitalize">
                {appUser?.role || 'Amateur Player'}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleNav('/login')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black bg-primary text-black hover:bg-primary/90 transition-all cursor-pointer shadow-lg"
          >
            {tNav('signIn')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Mobile Drawer ─────────────────────────────────────────────────────────────
function MobileDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fix #16: Close drawer on Escape key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const slideOffset = isRTL ? '100%' : '-100%';

  return (
    <>
      {/* Hamburger Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-foreground cursor-pointer focus:outline-none xl:hidden shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[9999998] bg-black/80 backdrop-blur-md"
                  onClick={() => setIsOpen(false)}
                />

                {/* Drawer */}
                <motion.div
                  key="drawer-content"
                  initial={{ x: slideOffset }}
                  animate={{ x: 0 }}
                  exit={{ x: slideOffset }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="fixed inset-y-0 z-[9999999] w-72 max-w-[85vw] bg-black shadow-2xl border-white/10 start-0 border-e flex flex-col overflow-hidden"
                >
                  <SidebarContent onClose={() => setIsOpen(false)} isMobile={true} />
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export function DesktopSidebar() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const loading = useAuthStore((s) => s.loading);

  // Only render sidebar for authenticated users
  if (loading || !firebaseUser) return null;

  return (
    <aside className="hidden xl:flex flex-col w-56 sm:w-60 shrink-0 fixed start-0 top-16 bottom-0 z-40 bg-black border-e border-white/10 overflow-hidden">
      <SidebarContent isMobile={false} />
    </aside>
  );
}

// ── SideMenu Export ───────────────────────────────────────────────────────────
export function SideMenu() {
  return <MobileDrawer />;
}
