'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, BarChart3, Users, LayoutDashboard, ChevronUp, ChevronDown, Sparkles, Activity, Tag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

const OWNER_EMAIL = 'a7medorabe7@gmail.com';

export function OwnerOpToolbar() {
  const appUser = useAuthStore((s) => s.appUser);
  const locale = useLocale();
  const pathname = usePathname();
  const isArabic = locale === 'ar';
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [latency, setLatency] = React.useState<number | null>(null);

  const isOwner =
    appUser?.role === 'owner' ||
    appUser?.email === OWNER_EMAIL ||
    appUser?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

  // Measure heartbeat ping on expand
  React.useEffect(() => {
    if (!isOwner || !isExpanded) return;
    const start = performance.now();
    fetch('/api/ai/tts', { method: 'OPTIONS' })
      .then(() => {
        setLatency(Math.round(performance.now() - start));
      })
      .catch(() => {
        setLatency(null);
      });
  }, [isOwner, isExpanded]);

  if (!isOwner) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 start-4 z-40 font-sans print:hidden"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="relative">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-2 p-4 rounded-3xl bg-black/90 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl text-foreground w-80 space-y-3.5 shadow-emerald-950/40"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    OP Mode: Active
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {latency ? `${latency}ms` : 'Online'}
                </span>
              </div>

              {/* Status privileges */}
              <div className="text-[11px] space-y-1 text-muted-foreground bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'الصلاحية:' : 'Role:'}</span>
                  <span className="text-foreground font-black uppercase text-amber-400">SUPER OWNER</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'تخطي الدفع:' : 'Paywall Bypass:'}</span>
                  <span className="text-emerald-400 font-bold">{isArabic ? 'مفعل (VIP دائم)' : 'Permanent VIP'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'ذكاء اصطناعي:' : 'AI Quota:'}</span>
                  <span className="text-emerald-400 font-bold">{isArabic ? 'بلا حدود (Unmetered)' : 'Unmetered'}</span>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground px-1">
                  {isArabic ? 'لوحات التحكم' : 'Command Portals'}
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Link
                    href="/owner"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isArabic ? 'التحكم العام' : 'Owner Hub'}</span>
                  </Link>
                  <Link
                    href="/owner/analytics"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isArabic ? 'التحليلات' : 'Analytics'}</span>
                  </Link>
                  <Link
                    href="/owner/users"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isArabic ? 'اللاعبين' : 'Users'}</span>
                  </Link>
                  <Link
                    href="/pricing"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Tag className="w-3.5 h-3.5 text-purple-400" />
                    <span>{isArabic ? 'الباقات' : 'Pricing'}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Pill Button */}
        <motion.button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3.5 py-2 rounded-full bg-black/90 border border-emerald-500/50 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-black shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer backdrop-blur-xl transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>OP BAR</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </motion.button>
      </div>
    </div>
  );
}
