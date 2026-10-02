'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Calendar,
  Trophy,
  Users,
  Award,
  Crown,
  Shirt,
  Shield,
  FileText,
  HelpCircle,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommandItem {
  id: string;
  labelEn: string;
  labelAr: string;
  categoryEn: string;
  categoryAr: string;
  href: string;
  icon: React.ReactNode;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: 'home', labelEn: 'Browse Pitches & Venues', labelAr: 'استعراض الملاعب والاستادات', categoryEn: 'Pitches', categoryAr: 'الملاعب', href: '/home', icon: <Home className="w-4 h-4 text-primary" /> },
  { id: 'book', labelEn: 'Book a Pitch Slot', labelAr: 'حجز موعد ملعب', categoryEn: 'Pitches', categoryAr: 'الملاعب', href: '/book', icon: <Calendar className="w-4 h-4 text-emerald-400" /> },
  { id: 'matches', labelEn: 'Public Match Lobbies', labelAr: 'المباريات العامة واللعب المفتوح', categoryEn: 'Matches', categoryAr: 'المباريات', href: '/matches', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
  { id: 'tournaments', labelEn: 'Tournaments & Leagues', labelAr: 'الدوريات والبطولات', categoryEn: 'Competition', categoryAr: 'المنافسات', href: '/tournaments', icon: <Trophy className="w-4 h-4 text-purple-400" /> },
  { id: 'challenges', labelEn: 'Squad Challenges', labelAr: 'تحديات الفرق والخماسي', categoryEn: 'Competition', categoryAr: 'المنافسات', href: '/challenges', icon: <Sparkles className="w-4 h-4 text-yellow-400" /> },
  { id: 'communities', labelEn: 'Football Communities & Clubs', labelAr: 'مجتمعات وفرق كرة القدم', categoryEn: 'Social', categoryAr: 'المجتمع', href: '/communities', icon: <Users className="w-4 h-4 text-cyan-400" /> },
  { id: 'leaderboard', labelEn: 'Leaderboard & Top Scorers', labelAr: 'لوحة الصدارة والهدافين', categoryEn: 'Social', categoryAr: 'المجتمع', href: '/leaderboard', icon: <Award className="w-4 h-4 text-amber-400" /> },
  { id: 'subscription', labelEn: 'Pitch Pass VIP Memberships', labelAr: 'اشتراكات وعضويات Pitch Pass', categoryEn: 'Store', categoryAr: 'المتجر', href: '/subscription', icon: <Crown className="w-4 h-4 text-amber-300" /> },
  { id: 'pricing', labelEn: 'Pricing & Pass Comparison', labelAr: 'الأسعار ومقارنة الباقات', categoryEn: 'Store', categoryAr: 'المتجر', href: '/pricing', icon: <Crown className="w-4 h-4 text-emerald-400" /> },
  { id: 'jersey', labelEn: 'Custom Jersey Designer', labelAr: 'مصمم القمصان والأطقم', categoryEn: 'Store', categoryAr: 'المتجر', href: '/jersey-designer', icon: <Shirt className="w-4 h-4 text-blue-400" /> },
  { id: 'privacy', labelEn: 'Privacy Policy (Law 151 / GDPR)', labelAr: 'سياسة الخصوصية وقانون 151', categoryEn: 'Legal', categoryAr: 'القانونية', href: '/privacy', icon: <Shield className="w-4 h-4 text-muted-foreground" /> },
  { id: 'terms', labelEn: 'Terms of Service', labelAr: 'شروط الخدمة والاستخدام', categoryEn: 'Legal', categoryAr: 'القانونية', href: '/terms', icon: <FileText className="w-4 h-4 text-muted-foreground" /> },
  { id: 'refund', labelEn: 'Refund & Cancellation Policy', labelAr: 'سياسة الاسترجاع والإلغاء', categoryEn: 'Legal', categoryAr: 'القانونية', href: '/refund', icon: <FileText className="w-4 h-4 text-muted-foreground" /> },
  { id: 'guide', labelEn: 'Platform Rules & Charter', labelAr: 'دليل وقواعد حجز الملاعب', categoryEn: 'Help', categoryAr: 'المساعدة', href: '/guide', icon: <HelpCircle className="w-4 h-4 text-emerald-400" /> },
];

export function GlobalCommandMenu() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations('Navbar');

  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredItems = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return COMMAND_ITEMS;
    return COMMAND_ITEMS.filter((item) => {
      const title = isArabic ? item.labelAr : item.labelEn;
      const category = isArabic ? item.categoryAr : item.categoryEn;
      return (
        title.toLowerCase().includes(trimmed) ||
        category.toLowerCase().includes(trimmed) ||
        item.href.toLowerCase().includes(trimmed)
      );
    });
  }, [query, isArabic]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href as '/');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-card/95 border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 text-foreground"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder={t('searchPlaceholder') || 'Search pitches, matches, or navigate...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  {isArabic ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching pages or features found'}
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-start text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary/15 text-primary font-bold border border-primary/30'
                          : 'text-foreground/90 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-1.5 rounded-lg bg-white/5">{item.icon}</span>
                        <div>
                          <span className="block">{isArabic ? item.labelAr : item.labelEn}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {isArabic ? item.categoryAr : item.categoryEn}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-40 shrink-0 rtl:rotate-180" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-muted-foreground bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-foreground font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-foreground font-mono">↓</kbd>
                <span>{isArabic ? 'للتنقل' : 'to navigate'}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-foreground font-mono ms-2">↵</kbd>
                <span>{isArabic ? 'للاختيار' : 'to select'}</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-foreground">ESC</kbd>
                <span>{isArabic ? 'للإغلاق' : 'to close'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
