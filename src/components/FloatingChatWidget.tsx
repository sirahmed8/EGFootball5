'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { generateAIResponse } from '@/lib/aiService';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Bot } from 'lucide-react';

import { AIMessage, SupportTicket } from './chat-widget/types';
import { ChatWidgetHeader } from './chat-widget/ChatWidgetHeader';
import { AIChatSection } from './chat-widget/AIChatSection';
import { CommunityChatSection } from './chat-widget/CommunityChatSection';
import { StaffSupportSection } from './chat-widget/StaffSupportSection';

export function FloatingChatWidget() {
  const { appUser, firebaseUser } = useAuthStore();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const isAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'community' | 'support'>('ai');
  const [modalHeight, setModalHeight] = useState<number>(560);
  const isResizing = useRef(false);

  // Unread badge indicator check
  const [hasUnreadSupport, setHasUnreadSupport] = useState(false);

  // AI Messages State
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [initialAiLoading, setInitialAiLoading] = useState<boolean>(true);

  // Custom Event Listener to open chat from external buttons (e.g. navbar or hero)
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ tab?: 'ai' | 'community' | 'support' }>;
      setIsOpen(true);
      if (customEv.detail?.tab) {
        setActiveTab(customEv.detail.tab);
      }
    };
    window.addEventListener('open-ai-chat', handleOpenEvent);
    return () => window.removeEventListener('open-ai-chat', handleOpenEvent);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Support unread listener for floating button badge
  useEffect(() => {
    if (!firebaseUser) {
      setHasUnreadSupport(false);
      return;
    }

    if (isAdmin) {
      const qTickets = query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc'));
      const unsub = onSnapshot(qTickets, (snap) => {
        const tix = snap.docs.map((d) => d.data() as SupportTicket);
        setHasUnreadSupport(tix.some((t) => t.unreadByStaff));
      });
      return () => unsub();
    } else {
      const unsub = onSnapshot(
        collection(db, 'support_tickets', firebaseUser.uid, 'messages'),
        (snap) => {
          // If staff message exists and user hasn't opened yet
          const hasStaffReply = snap.docs.some((d) => d.data().senderRole === 'staff');
          setHasUnreadSupport(hasStaffReply && !isOpen);
        }
      );
      return () => unsub();
    }
  }, [firebaseUser, isAdmin, isOpen]);

  // Dynamic AI greeting loader
  const loadInitialAiGreeting = useCallback(async () => {
    setInitialAiLoading(true);
    try {
      const userName = appUser?.name || (isArabic ? 'لاعبنا المميز' : 'Player');
      const prompt = isArabic
        ? `أنشئ رسالة ترحيبية قصيرة وجذابة للاعب ${userName} في منصة EGFootball5 لحجز ملاعب الخماسي بالعبور والقاهرة الجديدة. أضف 3 اقتراحات أسئلة سريعة.`
        : `Welcome user ${userName} to EGFootball5 pitch booking platform. Generate a friendly greeting and 3 quick prompt chips.`;

      const res = await generateAIResponse(prompt, { locale });

      const welcomeMsg: AIMessage = {
        id: 'welcome',
        sender: 'ai',
        text: res.text,
        chips:
          res.chips.length >= 3
            ? res.chips
            : isArabic
            ? ['💡 نصيحة تكتيكية (تتجدد كل ساعة)', '⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة']
            : ['💡 Hourly AI Tactical Insight', '⚽ How to book a pitch?', '🏆 Available matches'],
        timestamp: Date.now(),
      };

      setAiMessages([welcomeMsg]);
    } catch {
      const fallbackText = isArabic
        ? 'أهلاً بك! أنا منسق منصة EGFootball5 ⚽ كيف يمكنني مساعدتك اليوم في حجز الملاعب أو تنظيم المباريات؟'
        : 'Welcome! I am your EGFootball5 coordinator ⚽ How can I help you today with pitches, bookings, or matches?';
      const fallbackChips = isArabic
        ? ['⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة', '📍 أماكن الملاعب']
        : ['⚽ How to book a pitch?', '🏆 Available matches', '📍 Find pitch locations'];

      setAiMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: fallbackText,
          chips: fallbackChips,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setInitialAiLoading(false);
    }
  }, [appUser, locale, isArabic]);

  useEffect(() => {
    if (isOpen && aiMessages.length === 0) {
      loadInitialAiGreeting();
    }
  }, [isOpen, aiMessages.length, loadInitialAiGreeting]);

  // Modal Resize Handle
  const startResizing = (e: React.MouseEvent | React.TouchEvent) => {
    isResizing.current = true;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startHeight = modalHeight;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isResizing.current) return;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const maxViewportHeight =
        typeof window !== 'undefined' ? Math.max(380, window.innerHeight - 80) : 700;
      const calculatedMax = Math.min(800, maxViewportHeight);
      const newHeight = Math.min(Math.max(startHeight + (startY - currentY), 380), calculatedMax);
      setModalHeight(newHeight);
    };

    const onEnd = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div className="fixed bottom-4 end-4 sm:bottom-6 sm:end-6 md:bottom-8 md:end-8 z-[999999]">
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            key="chat-toggle-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="relative p-3 sm:p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-2xl glow-primary flex items-center justify-center cursor-pointer group border border-emerald-400/50"
            aria-label="Open Floating Chatbot"
          >
            <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-black stroke-[2.5]" />
            {hasUnreadSupport && (
              <span className="absolute -top-1 -end-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
              </span>
            )}
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{ height: `${modalHeight}px` }}
            className="w-[calc(100vw-1.5rem)] sm:w-[420px] max-h-[85vh] stadium-glass border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative backdrop-blur-2xl"
          >
            <ChatWidgetHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onClose={() => setIsOpen(false)}
              onStartResizing={startResizing}
            />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'ai' && (
                <AIChatSection
                  firebaseUser={firebaseUser}
                  appUser={appUser}
                  locale={locale}
                  isArabic={isArabic}
                  onClose={() => setIsOpen(false)}
                  aiMessages={aiMessages}
                  setAiMessages={setAiMessages}
                  initialAiLoading={initialAiLoading}
                  scrollToBottom={() => {}}
                />
              )}

              {activeTab === 'community' && (
                <CommunityChatSection
                  firebaseUser={firebaseUser}
                  appUser={appUser}
                  isAdmin={isAdmin}
                  isArabic={isArabic}
                  isOpen={isOpen}
                />
              )}

              {activeTab === 'support' && (
                <StaffSupportSection
                  firebaseUser={firebaseUser}
                  appUser={appUser}
                  isAdmin={isAdmin}
                  isArabic={isArabic}
                  isOpen={isOpen}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
