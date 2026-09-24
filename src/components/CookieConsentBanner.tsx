'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie, Settings, Check, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initAnalyticsIfConsented } from '@/lib/firebase/config';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

const STORAGE_KEY = 'egfootball5_cookie_consent';

export function CookieConsentBanner() {
  const t = useTranslations('CookieConsent');
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: false,
  });

  useEffect(() => {
    setMounted(true);
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      setIsOpen(true);
    } else {
      try {
        const parsed = JSON.parse(existing);
        setPreferences({
          essential: true,
          functional: parsed.functional ?? true,
          analytics: parsed.analytics ?? false,
        });
      } catch {
        setIsOpen(true);
      }
    }

    const handleOpenPreferences = () => {
      setShowPreferences(true);
      setIsOpen(true);
    };

    window.addEventListener('egfootball:open-cookie-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('egfootball:open-cookie-preferences', handleOpenPreferences);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      if (prefs.analytics) {
        initAnalyticsIfConsented();
      }
    } catch (e) {
      console.error('Failed to store cookie consent:', e);
    }
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    const allApproved: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allApproved);
    saveConsent(allApproved);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {/* Floating Consent Banner */}
      {isOpen && !showPreferences && (
        <motion.div
          key="cookie-banner"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-label={t('title')}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
        >
          <div className="stadium-glass border border-emerald-500/30 bg-background/95 backdrop-blur-2xl p-5 md:p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 mt-0.5 border border-primary/20 shadow-sm">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
                  {t('title')}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {t('description')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <Button
                variant="default"
                size="sm"
                onClick={handleAcceptAll}
                className="rounded-xl font-bold bg-primary text-black hover:bg-primary/90 text-xs py-2 px-3.5 shadow-md flex-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5 inline" />
                {t('acceptAll')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectNonEssential}
                className="rounded-xl text-xs py-2 px-3 border-white/10 hover:bg-white/5 flex-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('rejectNonEssential')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="rounded-xl text-xs py-2 px-3 hover:bg-white/5 text-muted-foreground hover:text-foreground cursor-pointer transition-all"
              >
                <Settings className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5 inline" />
                {t('customize')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Modal Dialog */}
      {showPreferences && (
        <motion.div
          key="cookie-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="stadium-glass border border-white/15 bg-background/95 max-w-lg w-full rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="cookie-preferences-title" className="text-lg font-black text-foreground tracking-tight">
                    {t('title')}
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-mono">Law No. 151 of 2020 Compliance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-3.5 max-h-[55vh] overflow-y-auto ltr:pr-1 rtl:pl-1">
              {/* Essential */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {t('essentialTitle')}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-lg font-bold border border-emerald-500/30">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {t('essentialDesc')}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-muted-foreground mt-0.5" title="Required for platform functionality">
                  <Lock className="w-4 h-4 opacity-50" />
                </div>
              </div>

              {/* Functional */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-foreground">
                    {t('functionalTitle')}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {t('functionalDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.functional}
                  onClick={() =>
                    setPreferences((prev) => ({ ...prev, functional: !prev.functional }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0 mt-0.5 ${
                    preferences.functional ? 'bg-primary' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`w-5 h-5 rounded-full bg-black shadow-md ${
                      preferences.functional ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Analytics */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-foreground">
                    {t('analyticsTitle')}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {t('analyticsDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.analytics}
                  onClick={() =>
                    setPreferences((prev) => ({ ...prev, analytics: !prev.analytics }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0 mt-0.5 ${
                    preferences.analytics ? 'bg-primary' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`w-5 h-5 rounded-full bg-black shadow-md ${
                      preferences.analytics ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 border-t border-white/10 pt-4">
              <Button
                variant="default"
                size="sm"
                onClick={handleSavePreferences}
                className="rounded-xl font-bold bg-primary text-black hover:bg-primary/90 flex-1 cursor-pointer h-10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('savePreferences')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(false)}
                className="rounded-xl border-white/10 hover:bg-white/5 cursor-pointer h-10 transition-all"
              >
                {t('close')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
