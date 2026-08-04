'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import { generateAIResponse } from '@/lib/aiService';
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Bot,
  Users,
  Headphones,
  X,
  Send,
  Camera,
  Mic,
  MicOff,
  Volume2,
  Smile,
  Reply,
  Trash2,
  Filter,
  Sparkles,
  GripHorizontal,
  Clock,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Types
interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  chips?: string[];
  timestamp: number;
}

interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  text: string;
  imageUrl?: string;
  replyTo?: { id: string; userName: string; text: string };
  reactions?: Record<string, string[]>;
  createdAt: unknown;
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  lastMessage: string;
  unreadByStaff: boolean;
  unreadByUser: boolean;
  updatedAt: unknown;
}

interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'staff';
  text: string;
  createdAt: unknown;
}

interface SpeechRecognitionResultAlternative {
  transcript: string;
}

interface SpeechRecognitionResultItem {
  0: SpeechRecognitionResultAlternative;
  length: number;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<SpeechRecognitionResultItem>;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((err: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const EMOJI_LIST = ['❤️', '🔥', '👏', '😂', '👍', '⚽', '🏆', '🎯', '🚀', '💯'];
const SLOW_MODE_SECONDS = 5;

// Helper: Formatted Markdown Text Component (Renders **bold**, *italics*, line breaks & lists)
function FormattedMarkdownText({ content, className = '' }: { content: string; className?: string }) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />;

        // Parse **bold**, *italics*, and `code`
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

        const renderedParts = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong key={pIdx} className="font-black text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
              <em key={pIdx} className="italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
              <code key={pIdx} className="bg-black/30 text-emerald-300 px-1 py-0.5 rounded font-mono text-[11px]">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });

        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 ms-2">
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>{renderedParts}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-relaxed">
            {renderedParts}
          </p>
        );
      })}
    </div>
  );
}

export function FloatingChatWidget() {
  const router = useRouter();
  const { appUser, firebaseUser } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations('FloatingChat');
  const isArabic = locale === 'ar';
  const isAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'community' | 'support'>('ai');
  const [modalHeight, setModalHeight] = useState<number>(560);
  const isResizing = useRef(false);

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

  // ----------------------------------------------------
  // Tab 1: AI Assistant State & Dynamic Initial Prompt Loading
  // ----------------------------------------------------
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [initialAiLoading, setInitialAiLoading] = useState<boolean>(true);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // ----------------------------------------------------
  // Tab 2: Community Channel State
  // ----------------------------------------------------
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [communityInput, setCommunityInput] = useState('');
  const [communityImage, setCommunityImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  // ----------------------------------------------------
  // Tab 3: Support Center State
  // ----------------------------------------------------
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportFilter, setSupportFilter] = useState<'all' | 'unread'>('all');
  const [supportSearch, setSupportSearch] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Fetch dynamic AI Welcome greeting on chatbot open / page refresh
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
        chips: res.chips.length >= 3 ? res.chips : (
          isArabic
            ? ['💡 نصيحة تكتيكية (تتجدد كل ساعة)', '⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة']
            : ['💡 Hourly AI Tactical Insight', '⚽ How to book a pitch?', '🏆 Available matches']
        ),
        timestamp: Date.now(),
      };

      setAiMessages([welcomeMsg]);
    } catch {
      const fallbackText = isArabic
        ? `أهلاً بك! أنا مساعد **EGFootball5** الذكي ⚽ كيف يمكنني مساعدتك اليوم في حجز الملاعب أو تنظيم المباريات؟`
        : `Welcome! I am your **EGFootball5** AI Assistant ⚽ How can I help you today with pitches, bookings, or matches?`;
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

  // Load dynamic AI greeting only once when chatbot opens for the first time
  useEffect(() => {
    if (isOpen && aiMessages.length === 0) {
      loadInitialAiGreeting();
    }
  }, [isOpen, aiMessages.length, loadInitialAiGreeting]);

  // ----------------------------------------------------
  // Resize Handle Logic
  // ----------------------------------------------------
  const startResizing = (e: React.MouseEvent | React.TouchEvent) => {
    isResizing.current = true;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startHeight = modalHeight;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isResizing.current) return;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + (startY - currentY), 380), 800);
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

  // Firestore Subscriptions
  useEffect(() => {
    if (!isOpen) return;

    const qComm = query(
      collection(db, 'community_messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    const unsubComm = onSnapshot(qComm, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityMessage));
      setCommunityMessages(msgs);
      if (activeTab === 'community') scrollToBottom();
    });

    return () => unsubComm();
  }, [isOpen, activeTab, scrollToBottom]);

  useEffect(() => {
    if (!isOpen || !firebaseUser) return;

    if (isAdmin) {
      const qTickets = query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc'));
      const unsubTickets = onSnapshot(qTickets, (snap) => {
        const tix = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
        setSupportTickets(tix);
      });
      return () => unsubTickets();
    } else {
      const userTicketId = firebaseUser.uid;
      const qUserMsgs = query(
        collection(db, 'support_tickets', userTicketId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const unsubUserMsgs = onSnapshot(qUserMsgs, (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportMessage));
        setSupportMessages(msgs);
        if (activeTab === 'support') scrollToBottom();
      });
      return () => unsubUserMsgs();
    }
  }, [isOpen, firebaseUser, isAdmin, activeTab, scrollToBottom]);

  useEffect(() => {
    if (!isAdmin || !selectedTicketId) return;
    const qStaffMsgs = query(
      collection(db, 'support_tickets', selectedTicketId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubStaffMsgs = onSnapshot(qStaffMsgs, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportMessage));
      setSupportMessages(msgs);
      scrollToBottom();
    });
    return () => unsubStaffMsgs();
  }, [isAdmin, selectedTicketId, scrollToBottom]);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  // AI Assistant Functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error(t('imageNotSupported'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleVoiceRecognition = () => {
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition ||
      windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(t('voiceNotSupported'));
      return;
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognition();
    recognition.lang = isArabic ? 'ar-EG' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result: SpeechRecognitionResultItem) => result[0].transcript)
        .join('');
      setAiInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    speechRecognitionRef.current = recognition;
    recognition.start();
  };

  const playTTSAudio = async (text: string) => {
    try {
      const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, locale }),
      });
      const data = await res.json();

      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.play();
        return;
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = isArabic ? 'ar-SA' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      if ('speechSynthesis' in window) {
        const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = isArabic ? 'ar-SA' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const sendAIMessage = useCallback(
    async (textToSend?: string) => {
      const queryText = (textToSend || aiInput).trim();
      if (!queryText && !attachedImage) return;

      // 1-Hour Cooldown Check for Tactical Advice requests
      const isAdviceReq = queryText.includes('نصيحة') || queryText.includes('Insight') || queryText.includes('Tactical');
      if (isAdviceReq) {
        const lastCooldown = localStorage.getItem('ai_tactical_cooldown');
        if (lastCooldown) {
          const cooldownTime = Number(lastCooldown);
          if (Date.now() < cooldownTime) {
            const minsLeft = Math.ceil((cooldownTime - Date.now()) / 60000);
            const cooldownMsg: AIMessage = {
              id: `ai-cooldown-${Date.now()}`,
              sender: 'ai',
              text: isArabic
                ? `⏱️ يمكنك الحصول على نصيحة تكتيكية جديدة بعد **${minsLeft} دقيقة** (تُتاح نصيحة واحدة كل 1 ساعة).`
                : `⏱️ Next AI Tactical Insight is ready in **${minsLeft} minutes** (1 insight per 1 hour).`,
              chips: [],
              timestamp: Date.now(),
            };
            setAiMessages((prev) => [...prev, { id: `usr-${Date.now()}`, sender: 'user', text: queryText, timestamp: Date.now() }, cooldownMsg]);
            setAiInput('');
            scrollToBottom();
            return;
          }
        }
        localStorage.setItem('ai_tactical_cooldown', String(Date.now() + 3600000));
      }

      const userMsg: AIMessage = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text: queryText,
        image: attachedImage || undefined,
        timestamp: Date.now(),
      };

      setAiMessages((prev) => [...prev, userMsg]);
      setAiInput('');
      const currentImg = attachedImage;
      setAttachedImage(null);
      setAiLoading(true);
      scrollToBottom();

      try {
        const res = await generateAIResponse(queryText, {
          imageBase64: currentImg || undefined,
          systemContext: `User: ${appUser?.name || 'Guest'}, Role: ${appUser?.role || 'player'}`,
          locale,
        });

        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.text,
          chips: res.chips,
          timestamp: Date.now(),
        };

        setAiMessages((prev) => [...prev, aiMsg]);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'AI Error');
      } finally {
        setAiLoading(false);
        scrollToBottom();
      }
    },
    [aiInput, attachedImage, appUser, locale, scrollToBottom]
  );

  // Community Channel Functions
  const handleCommunityImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error(t('imageNotSupported'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCommunityImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendCommunityMessage = async () => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first');
      return;
    }
    if (cooldownLeft > 0) {
      toast.warning(isArabic ? `انتظر ${cooldownLeft} ثوانٍ قبل الإرسال مجدداً` : `Please wait ${cooldownLeft}s before sending again`);
      return;
    }
    if (!communityInput.trim() && !communityImage) return;

    try {
      const payload: Omit<CommunityMessage, 'id'> = {
        userId: firebaseUser.uid,
        userName: appUser?.name || firebaseUser.email || 'Player',
        userRole: appUser?.role || 'player',
        text: communityInput.trim(),
        imageUrl: communityImage || undefined,
        replyTo: replyingTo
          ? { id: replyingTo.id, userName: replyingTo.userName, text: replyingTo.text }
          : undefined,
        reactions: {},
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'community_messages'), payload);
      setCommunityInput('');
      setCommunityImage(null);
      setReplyingTo(null);
      setCooldownLeft(SLOW_MODE_SECONDS);
      scrollToBottom();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to send message');
    }
  };

  const toggleReaction = async (msgId: string, emoji: string) => {
    if (!firebaseUser) return;
    const msg = communityMessages.find((m) => m.id === msgId);
    if (!msg) return;

    const currentReactions = { ...(msg.reactions || {}) };
    const userList = currentReactions[emoji] || [];
    const uid = firebaseUser.uid;

    if (userList.includes(uid)) {
      currentReactions[emoji] = userList.filter((id) => id !== uid);
      if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
    } else {
      currentReactions[emoji] = [...userList, uid];
    }

    try {
      await updateDoc(doc(db, 'community_messages', msgId), { reactions: currentReactions });
    } catch (err: unknown) {
      console.warn('Reaction error:', err);
    }
  };

  const deleteCommunityMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'community_messages', msgId));
      toast.success(isArabic ? 'تم حذف الرسالة' : 'Message deleted');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    }
  };

  // Support Center Functions
  const sendSupportMessage = async () => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first');
      return;
    }
    if (!supportInput.trim()) return;

    const ticketId = isAdmin ? selectedTicketId : firebaseUser.uid;
    if (!ticketId) return;

    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        lastMessage: supportInput.trim(),
        unreadByStaff: !isAdmin,
        unreadByUser: isAdmin,
        updatedAt: serverTimestamp(),
      }).catch(async () => {
        await addDoc(collection(db, 'support_tickets'), {
          id: ticketId,
          userId: firebaseUser.uid,
          userName: appUser?.name || 'User',
          userEmail: firebaseUser.email || '',
          lastMessage: supportInput.trim(),
          unreadByStaff: !isAdmin,
          unreadByUser: isAdmin,
          updatedAt: serverTimestamp(),
        });
      });

      await addDoc(collection(db, 'support_tickets', ticketId, 'messages'), {
        senderId: firebaseUser.uid,
        senderName: appUser?.name || (isAdmin ? 'Staff Support' : 'User'),
        senderRole: isAdmin ? 'staff' : 'user',
        text: supportInput.trim(),
        createdAt: serverTimestamp(),
      });

      setSupportInput('');
      scrollToBottom();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Support error');
    }
  };

  const filteredTickets = supportTickets.filter((t) => {
    const matchesFilter = supportFilter === 'all' || (supportFilter === 'unread' && t.unreadByStaff);
    const matchesSearch =
      !supportSearch ||
      t.userName.toLowerCase().includes(supportSearch.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(supportSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const hasUnreadSupport = supportTickets.some((t) => (isAdmin ? t.unreadByStaff : t.unreadByUser));

  return (
    <div className="fixed bottom-6 end-6 md:bottom-8 md:end-8 z-[9999999]">
      <AnimatePresence mode="wait">
        {/* Floating Toggle Button */}
        {!isOpen && (
          <motion.button
            key="chat-toggle-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="relative p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-2xl glow-primary flex items-center justify-center cursor-pointer group border border-emerald-400/50"
            aria-label="Open Floating Chatbot"
          >
            <Bot className="w-7 h-7 text-black stroke-[2.5]" />
            {hasUnreadSupport && (
              <span className="absolute -top-1 -end-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
              </span>
            )}
          </motion.button>
        )}

        {/* Spring Animated Modal */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{ height: `${modalHeight}px` }}
            className="w-[calc(100vw-2rem)] sm:w-[420px] stadium-glass border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative backdrop-blur-2xl"
          >
            {/* Top Resize Handle */}
            <div
              onMouseDown={startResizing}
              onTouchStart={startResizing}
              className="w-full h-6 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-ns-resize group select-none border-b border-white/10 shrink-0"
              title="Drag to resize height"
            >
              <GripHorizontal className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            </div>

            {/* Header Navigation Tabs */}
            <div className="p-3 border-b border-white/10 bg-background/40 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 flex-1">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'ai'
                      ? 'bg-primary text-black shadow-md glow-primary-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>{t('tabAi')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('community')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'community'
                      ? 'bg-primary text-black shadow-md glow-primary-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{t('tabCommunity')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'support'
                      ? 'bg-primary text-black shadow-md glow-primary-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>{t('tabSupport')}</span>
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ==================================================== */}
              {/* TAB 1: 🤖 AI ASSISTANT */}
              {/* ==================================================== */}
              {activeTab === 'ai' && (
                !firebaseUser ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 my-auto bg-muted/20 rounded-3xl border border-border/40">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                      <Bot className="w-8 h-8" />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <h3 className="text-xl font-black text-foreground">
                        {isArabic ? 'تسجيل الدخول مطلوب' : 'Sign In Required'}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {isArabic
                          ? 'يرجى تسجيل الدخول لاستخدام مساعد EGFootball5 الذكي لحجز الملاعب والبحث التلقائي والإرشادات.'
                          : 'Please sign in to unlock AI-powered pitch search, booking assistance, and tactical advice.'}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/login');
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl px-6 py-5 w-full text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      {isArabic ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className="flex-1 overflow-y-auto space-y-3 pe-1">
                      {/* Initial AI Loading Skeleton Animation */}
                      {initialAiLoading ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          {/* Skeleton Message Bubble */}
                          <div className="max-w-[85%] p-4 rounded-2xl bg-muted/60 border border-border/50 space-y-2.5">
                            <div className="h-4 bg-primary/20 rounded-md w-3/4 animate-pulse" />
                            <div className="h-3.5 bg-muted/60 rounded-md w-full animate-pulse" />
                            <div className="h-3.5 bg-muted/60 rounded-md w-5/6 animate-pulse" />
                          </div>
                          {/* Skeleton Chips */}
                          <div className="flex flex-wrap gap-2">
                            <div className="h-7 w-36 bg-emerald-500/15 rounded-full border border-emerald-500/20 animate-pulse" />
                            <div className="h-7 w-32 bg-emerald-500/15 rounded-full border border-emerald-500/20 animate-pulse" />
                            <div className="h-7 w-40 bg-emerald-500/15 rounded-full border border-emerald-500/20 animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        aiMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              msg.sender === 'user' ? 'items-end' : 'items-start'
                            }`}
                          >
                            <div
                              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                                msg.sender === 'user'
                                  ? 'bg-emerald-500 text-black font-medium rounded-br-none shadow-md shadow-emerald-500/10'
                                  : 'bg-muted/80 border border-border/60 text-foreground rounded-bl-none'
                              }`}
                            >
                              {/* User uploaded image thumbnail */}
                              {msg.image && (
                                <Image
                                  src={msg.image}
                                  alt="Uploaded screenshot"
                                  width={300}
                                  height={200}
                                  unoptimized
                                  className="w-full max-h-48 object-cover rounded-xl mb-2 border border-black/20"
                                />
                              )}

                              {/* Render formatted markdown for AI, or clean text for user */}
                              {msg.sender === 'ai' ? (
                                <FormattedMarkdownText content={msg.text} />
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                              )}

                              {/* Speech Playback Action */}
                              {msg.sender === 'ai' && (
                                <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                                  <button
                                    onClick={() => playTTSAudio(msg.text)}
                                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>{t('listenVoice')}</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Dynamic Prompt Chips - Unclipped Full Width Layout */}
                            {msg.sender === 'ai' && msg.chips && msg.chips.length > 0 && (
                              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-3 w-full p-0.5 overflow-visible">
                                {msg.chips.map((chip, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => sendAIMessage(chip)}
                                    className="text-xs px-3.5 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all font-bold flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 text-start whitespace-normal break-words max-w-full"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>{chip}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}

                      {aiLoading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl bg-muted/40 w-max animate-pulse">
                          <Bot className="w-4 h-4 text-emerald-400 animate-bounce" />
                          <span>{t('aiThinking')}</span>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* AI Input controls — sleek glass container, no inner box border */}
                    <div className="pt-2 border-t border-border/40 space-y-2 shrink-0">
                      {attachedImage && (
                        <div className="relative inline-block">
                          <Image
                            src={attachedImage}
                            alt="Thumbnail preview"
                            width={56}
                            height={56}
                            unoptimized
                            className="w-14 h-14 object-cover rounded-xl border border-emerald-500/50"
                          />

                          <button
                            onClick={() => setAttachedImage(null)}
                            className="absolute -top-1.5 -end-1.5 p-0.5 rounded-full bg-destructive text-white text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 bg-muted/70 border border-border/80 p-1.5 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
                        {/* Vision / Image button */}
                        <label className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer transition-colors shrink-0">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>

                        {/* Voice Recognition button */}
                        <button
                          type="button"
                          onClick={toggleVoiceRecognition}
                          className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                            isListening
                              ? 'bg-destructive/20 text-destructive animate-pulse'
                              : 'hover:bg-muted text-muted-foreground hover:text-emerald-400'
                          }`}
                          title="Voice recognition"
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>

                        <input
                          type="text"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                          placeholder={isArabic ? 'اكتب سؤالك أو استفسارك هنا...' : 'Type your message or question...'}
                          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                          className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs text-foreground placeholder:text-muted-foreground/60 px-1 py-1"
                        />

                        <button
                          onClick={() => sendAIMessage()}
                          disabled={aiLoading || (!aiInput.trim() && !attachedImage)}
                          className="p-2.5 rounded-full bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-all cursor-pointer shrink-0 shadow-md hover:scale-105 active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* ==================================================== */}
              {/* TAB 2: 💬 COMMUNITY CHANNEL */}
              {/* ==================================================== */}
              {activeTab === 'community' && (
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-3 pe-1">
                    {communityMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl bg-muted/60 border border-border/50 space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">{msg.userName}</span>
                            {msg.userRole === 'admin' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Staff
                              </span>
                            )}
                          </div>
                          {(msg.userId === firebaseUser?.uid || isAdmin) && (
                            <button
                              onClick={() => deleteCommunityMessage(msg.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {msg.replyTo && (
                          <div className="p-2 rounded-xl bg-background/50 border-l-2 border-emerald-500 text-xs text-muted-foreground">
                            <span className="font-bold text-emerald-400">@{msg.replyTo.userName}: </span>
                            <span className="truncate">{msg.replyTo.text}</span>
                          </div>
                        )}

                        {msg.imageUrl && (
                          <Image
                            src={msg.imageUrl}
                            alt="Community attachment"
                            width={300}
                            height={200}
                            unoptimized
                            className="w-full max-h-48 object-cover rounded-xl border border-black/20"
                          />
                        )}

                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {EMOJI_LIST.map((emoji) => {
                              const count = msg.reactions?.[emoji]?.length || 0;
                              const hasReacted = firebaseUser && msg.reactions?.[emoji]?.includes(firebaseUser.uid);
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className={`text-[11px] px-1.5 py-0.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                    hasReacted
                                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                      : 'bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  {count > 0 && <span className="font-bold">{count}</span>}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="text-muted-foreground hover:text-emerald-400 flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Reply className="w-3 h-3" />
                            <span>{t('reply')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Bar */}
                  <div className="pt-2 border-t border-border/40 space-y-2 shrink-0">
                    {replyingTo && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                        <span>
                          {t('replyingTo')} <strong>@{replyingTo.userName}</strong>
                        </span>
                        <button onClick={() => setReplyingTo(null)} className="cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {communityImage && (
                      <div className="relative inline-block">
                        <Image
                          src={communityImage}
                          alt="Thumbnail preview"
                          width={56}
                          height={56}
                          unoptimized
                          className="w-14 h-14 object-cover rounded-xl border border-emerald-500/50"
                        />

                        <button
                          onClick={() => setCommunityImage(null)}
                          className="absolute -top-1.5 -end-1.5 p-0.5 rounded-full bg-destructive text-white text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {showEmojiPicker && (
                      <div className="p-2 rounded-2xl bg-card border border-border flex flex-wrap gap-1 mb-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setCommunityInput((prev) => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1.5 hover:bg-muted rounded-lg text-base cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 bg-muted/70 border border-border/80 p-1.5 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer shrink-0"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      <label className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer shrink-0">
                        <ImageIcon className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                          onChange={handleCommunityImage}
                        />
                      </label>

                      <input
                        type="text"
                        value={communityInput}
                        onChange={(e) => setCommunityInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendCommunityMessage()}
                        placeholder={t('shareCommunityPlaceholder')}
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                        className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs text-foreground placeholder:text-muted-foreground/60 px-1 py-1"
                      />

                      <button
                        onClick={sendCommunityMessage}
                        disabled={cooldownLeft > 0 || (!communityInput.trim() && !communityImage)}
                        className="p-2.5 rounded-full bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-all flex items-center justify-center min-w-[36px] cursor-pointer shrink-0 shadow-md hover:scale-105 active:scale-95"
                      >
                        {cooldownLeft > 0 ? (
                          <span className="text-xs font-mono font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cooldownLeft}
                          </span>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: 🎧 SUPPORT CENTER */}
              {/* ==================================================== */}
              {activeTab === 'support' && (
                <div className="flex flex-col h-full space-y-3">
                  {/* STAFF / ADMIN VIEW: Searchable Inbox with Filter Pills & Animated Search */}
                  {isAdmin ? (
                    <div className="flex flex-col h-full space-y-3">
                      {/* Filter Pills & Animated Search Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40">
                          {(['all', 'unread'] as const).map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setSupportFilter(filter)}
                              className={`relative px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                                supportFilter === filter
                                  ? 'text-black'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {supportFilter === filter && (
                                <motion.div
                                  layoutId="supportFilterPill"
                                  className="absolute inset-0 bg-emerald-500 rounded-lg -z-10"
                                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                              )}
                              {filter === 'all' ? t('all') : t('unread')}
                            </button>
                          ))}
                        </div>

                        {/* Animated Search Bar with Filter Icon */}
                        <div className="relative flex-1 max-w-[170px] group transition-all duration-300 rounded-full border border-border/60 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/30 focus-within:shadow-[0_0_15px_rgba(57,255,20,0.25)] bg-muted/40 overflow-hidden">
                          <Filter className="w-3.5 h-3.5 absolute start-2.5 top-2 text-emerald-400 group-focus-within:rotate-180 transition-transform duration-300" />
                          <input
                            type="text"
                            value={supportSearch}
                            onChange={(e) => setSupportSearch(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                            className="w-full bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs ps-8 pe-2 py-1 text-foreground placeholder:text-muted-foreground/60"
                          />
                        </div>
                      </div>

                      {/* Ticket Roster vs Chat View */}
                      {!selectedTicketId ? (
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {filteredTickets.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-8">
                              {t('noTicketsFound')}
                            </p>
                          ) : (
                            filteredTickets.map((tix) => (
                              <button
                                key={tix.id}
                                onClick={() => setSelectedTicketId(tix.id)}
                                className="w-full text-start p-3 rounded-2xl bg-muted/50 hover:bg-muted border border-border/50 transition-all space-y-1 block cursor-pointer"
                              >
                                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                  <span>{tix.userName}</span>
                                  {tix.unreadByStaff && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-black">
                                      New
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{tix.lastMessage}</p>
                              </button>
                            ))
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col h-full justify-between">
                          <button
                            onClick={() => setSelectedTicketId(null)}
                            className="text-xs text-emerald-400 flex items-center gap-1 font-bold mb-2 cursor-pointer"
                          >
                            ← {t('backToInbox')}
                          </button>

                          <div className="flex-1 overflow-y-auto space-y-2 pe-1">
                            {supportMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${
                                  msg.senderRole === 'staff' ? 'items-end' : 'items-start'
                                }`}
                              >
                                <div
                                  className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                                    msg.senderRole === 'staff'
                                      ? 'bg-emerald-500 text-black font-medium'
                                      : 'bg-muted border border-border text-foreground'
                                  }`}
                                >
                                  <p>{msg.text}</p>
                                </div>
                              </div>
                            ))}
                            <div ref={chatBottomRef} />
                          </div>

                          <div className="flex items-center gap-2 bg-muted/70 border border-border/80 p-1.5 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner mt-2">
                            <input
                              type="text"
                              value={supportInput}
                              onChange={(e) => setSupportInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendSupportMessage()}
                              placeholder={t('replyToUserPlaceholder')}
                              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                              className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs text-foreground placeholder:text-muted-foreground/60 px-2 py-1"
                            />
                            <button
                              onClick={sendSupportMessage}
                              className="p-2.5 rounded-full bg-emerald-500 text-black font-bold cursor-pointer shrink-0 shadow-md hover:scale-105"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* USER VIEW: 1-on-1 Support Thread */
                    <div className="flex flex-col h-full justify-between space-y-3">
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{t('staffSupportOnline')}</span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pe-1">
                        {supportMessages.length === 0 ? (
                          <div className="text-center text-xs text-muted-foreground py-8">
                            <Headphones className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
                            <p>{t('howCanStaffHelp')}</p>
                          </div>
                        ) : (
                          supportMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${
                                msg.senderRole === 'user' ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                                  msg.senderRole === 'user'
                                    ? 'bg-emerald-500 text-black font-medium'
                                    : 'bg-muted border border-border text-foreground'
                                }`}
                              >
                                <p className="font-bold text-[10px] opacity-75 mb-0.5">
                                  {msg.senderName}
                                </p>
                                <p>{msg.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={chatBottomRef} />
                      </div>

                      <div className="flex items-center gap-2 bg-muted/70 border border-border/80 p-1.5 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner shrink-0">
                        <input
                          type="text"
                          value={supportInput}
                          onChange={(e) => setSupportInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendSupportMessage()}
                          placeholder={t('typeMessageToStaff')}
                          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                          className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs text-foreground placeholder:text-muted-foreground/60 px-2 py-1"
                        />
                        <button
                          onClick={sendSupportMessage}
                          disabled={!supportInput.trim()}
                          className="p-2.5 rounded-full bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-all cursor-pointer shrink-0 shadow-md hover:scale-105"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
