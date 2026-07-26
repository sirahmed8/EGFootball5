'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
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
  where,
  getDocs,
} from 'firebase/firestore';
import {
  MessageSquare,
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
  Search,
  Sparkles,
  ChevronDown,
  GripHorizontal,
  CheckCheck,
  Clock,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  chips?: string[];
  modelUsed?: string;
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
  reactions?: Record<string, string[]>; // { "❤️": ["uid1", "uid2"] }
  createdAt: any;
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  lastMessage: string;
  unreadByStaff: boolean;
  unreadByUser: boolean;
  updatedAt: any;
}

interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'staff';
  text: string;
  createdAt: any;
}

const EMOJI_LIST = ['❤️', '🔥', '👏', '😂', '👍', '⚽', '🏆', '🎯', '🚀', '💯'];
const SLOW_MODE_SECONDS = 5;

export function FloatingChatWidget() {
  const { appUser, firebaseUser } = useAuthStore();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const isAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'community' | 'support'>('ai');
  const [modalHeight, setModalHeight] = useState<number>(560);
  const isResizing = useRef(false);

  // ----------------------------------------------------
  // Tab 1: AI Assistant State
  // ----------------------------------------------------
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-ai',
      sender: 'ai',
      text: isArabic
        ? 'أهلاً بك! أنا مساعد Kickoff الذكي ⚽ كيف يمكنني مساعدتك اليوم في الملاعب أو المباريات؟'
        : 'Welcome! I am Kickoff AI Assistant ⚽ How can I help you today with pitches, bookings, or matches?',
      chips: isArabic
        ? ['⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة', '📍 معرفة عناوين الملاعب']
        : ['⚽ How to book a pitch?', '🏆 Available matches', '📍 Find pitch locations'],
      timestamp: Date.now(),
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

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

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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

  // ----------------------------------------------------
  // Firestore Subscriptions
  // ----------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    // Sub to Community Messages
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
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen || !firebaseUser) return;

    if (isAdmin) {
      // Admin view: fetch all support tickets
      const qTickets = query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc'));
      const unsubTickets = onSnapshot(qTickets, (snap) => {
        const tix = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
        setSupportTickets(tix);
      });
      return () => unsubTickets();
    } else {
      // User view: single ticket under user's UID
      const userTicketId = firebaseUser.uid;
      setSelectedTicketId(userTicketId);
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
  }, [isOpen, firebaseUser, isAdmin, activeTab]);

  // Admin selected ticket messages subscription
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
  }, [isAdmin, selectedTicketId]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  // ----------------------------------------------------
  // AI Assistant Functions
  // ----------------------------------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error(isArabic ? 'صيغة الصورة غير مدعومة (png, jpeg, jpg, webp فقط)' : 'Only PNG, JPEG, JPG, WEBP formats allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(isArabic ? 'خاصية التعرف على الصوت غير مدعومة في متصفحك' : 'Voice recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isArabic ? 'ar-EG' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setAiInput(transcript);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech error:', err);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    speechRecognitionRef.current = recognition;
    recognition.start();
  };

  const playTTSAudio = async (text: string) => {
    try {
      // Call /api/ai/tts route
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale }),
      });
      const data = await res.json();

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
        return;
      }

      // Fallback: Browser SpeechSynthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isArabic ? 'ar-SA' : 'en-US';
        window.speechSynthesis.speak(utterance);
      } else {
        toast.error(isArabic ? 'خاصية القراءة الصوتية غير متاحة' : 'Speech synthesis not available');
      }
    } catch {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isArabic ? 'ar-SA' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const sendAIMessage = async (textToSend?: string) => {
    const queryText = (textToSend || aiInput).trim();
    if (!queryText && !attachedImage) return;

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
        modelUsed: res.modelUsed,
        timestamp: Date.now(),
      };

      setAiMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error(err.message || 'AI Error');
    } finally {
      setAiLoading(false);
      scrollToBottom();
    }
  };

  // ----------------------------------------------------
  // Community Channel Functions
  // ----------------------------------------------------
  const handleCommunityImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error(isArabic ? 'صيغة الصورة غير مدعومة' : 'Only PNG, JPEG, JPG, WEBP formats allowed');
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
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
    } catch (err: any) {
      console.warn('Reaction error:', err);
    }
  };

  const deleteCommunityMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'community_messages', msgId));
      toast.success(isArabic ? 'تم حذف الرسالة' : 'Message deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ----------------------------------------------------
  // Support Center Functions
  // ----------------------------------------------------
  const sendSupportMessage = async () => {
    if (!firebaseUser) {
      toast.error(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first');
      return;
    }
    if (!supportInput.trim()) return;

    const ticketId = isAdmin ? selectedTicketId : firebaseUser.uid;
    if (!ticketId) return;

    try {
      // 1. Ensure parent ticket exists
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        lastMessage: supportInput.trim(),
        unreadByStaff: !isAdmin,
        unreadByUser: isAdmin,
        updatedAt: serverTimestamp(),
      }).catch(async () => {
        // Create if missing
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

      // 2. Add message to subcollection
      await addDoc(collection(db, 'support_tickets', ticketId, 'messages'), {
        senderId: firebaseUser.uid,
        senderName: appUser?.name || (isAdmin ? 'Staff Support' : 'User'),
        senderRole: isAdmin ? 'staff' : 'user',
        text: supportInput.trim(),
        createdAt: serverTimestamp(),
      });

      setSupportInput('');
      scrollToBottom();
    } catch (err: any) {
      toast.error(err.message || 'Support error');
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
            className="relative p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_0_25px_rgba(57,255,20,0.4)] flex items-center justify-center cursor-pointer group border border-emerald-400/50"
            aria-label="Open Floating Chatbot"
          >
            <Bot className="w-7 h-7 text-black stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
            </span>
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
            className="w-[calc(100vw-2rem)] sm:w-[420px] bg-card/95 border border-border backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Top Resize Handle */}
            <div
              onMouseDown={startResizing}
              onTouchStart={startResizing}
              className="w-full h-6 bg-muted/40 hover:bg-muted/80 transition-colors flex items-center justify-center cursor-ns-resize group select-none border-b border-border/40 shrink-0"
              title="Drag to resize height"
            >
              <GripHorizontal className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            </div>

            {/* Header with Navigation Tabs */}
            <div className="p-3 border-b border-border/60 bg-background/50 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/40 flex-1">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'ai'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>{isArabic ? 'الذكاء الاصطناعي' : 'AI Assistant'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('community')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'community'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{isArabic ? 'المجتمع' : 'Community'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'support'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>{isArabic ? 'الدعم' : 'Support'}</span>
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ==================================================== */}
              {/* TAB 1: 🟢 AI ASSISTANT */}
              {/* ==================================================== */}
              {activeTab === 'ai' && (
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {aiMessages.map((msg) => (
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
                            <img
                              src={msg.image}
                              alt="Uploaded screenshot"
                              className="w-full max-h-48 object-cover rounded-xl mb-2 border border-black/20"
                            />
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {/* AI Actions: Speech Playback */}
                          {msg.sender === 'ai' && (
                            <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                              <button
                                onClick={() => playTTSAudio(msg.text)}
                                className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>{isArabic ? 'استماع' : 'Listen Voice'}</span>
                              </button>
                              {msg.modelUsed && (
                                <span className="text-[10px] font-mono opacity-60">
                                  {msg.modelUsed}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Dynamic Prompt Chips */}
                        {msg.sender === 'ai' && msg.chips && msg.chips.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                            {msg.chips.map((chip, idx) => (
                              <button
                                key={idx}
                                onClick={() => sendAIMessage(chip)}
                                className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 shrink-0" />
                                <span>{chip}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {aiLoading && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl bg-muted/40 w-max animate-pulse">
                        <Bot className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span>{isArabic ? 'الذكاء الاصطناعي يفكر...' : 'Gemini AI is thinking...'}</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* AI Input controls */}
                  <div className="pt-2 border-t border-border/40 space-y-2 shrink-0">
                    {attachedImage && (
                      <div className="relative inline-block">
                        <img
                          src={attachedImage}
                          alt="Thumbnail preview"
                          className="w-14 h-14 object-cover rounded-xl border border-emerald-500/50"
                        />
                        <button
                          onClick={() => setAttachedImage(null)}
                          className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-white text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 bg-muted/50 border border-border p-1.5 rounded-2xl">
                      {/* Vision / Image button */}
                      <label className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer transition-colors">
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
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
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
                        placeholder={
                          isArabic ? 'اسأل الذكاء الاصطناعي...' : 'Ask Gemini AI assistant...'
                        }
                        className="flex-1 bg-transparent border-none text-xs text-foreground focus:outline-none px-2"
                      />

                      <button
                        onClick={() => sendAIMessage()}
                        disabled={aiLoading || (!aiInput.trim() && !attachedImage)}
                        className="p-2 rounded-xl bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 2: 💬 COMMUNITY CHANNEL */}
              {/* ==================================================== */}
              {activeTab === 'community' && (
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {communityMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl bg-muted/60 border border-border/50 space-y-2 relative group"
                      >
                        {/* Header info */}
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

                        {/* Reply banner if any */}
                        {msg.replyTo && (
                          <div className="p-2 rounded-xl bg-background/50 border-l-2 border-emerald-500 text-xs text-muted-foreground">
                            <span className="font-bold text-emerald-400">@{msg.replyTo.userName}: </span>
                            <span className="truncate block">{msg.replyTo.text}</span>
                          </div>
                        )}

                        {/* Message image */}
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Attachment"
                            className="w-full max-h-48 object-cover rounded-xl border border-border"
                          />
                        )}

                        <p className="text-sm text-foreground">{msg.text}</p>

                        {/* Emoji Reactions & Reply Bar */}
                        <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-border/30 text-xs">
                          <div className="flex flex-wrap items-center gap-1">
                            {['❤️', '🔥', '👏', '😂', '👍'].map((emoji) => {
                              const uids = msg.reactions?.[emoji] || [];
                              const hasReacted = uids.includes(firebaseUser?.uid || '');
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className={`px-1.5 py-0.5 rounded-lg text-xs border transition-all cursor-pointer ${
                                    hasReacted
                                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                      : 'bg-background/40 border-border/40 hover:bg-muted'
                                  }`}
                                >
                                  {emoji} {uids.length > 0 && uids.length}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="text-muted-foreground hover:text-emerald-400 flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Reply className="w-3 h-3" />
                            <span>{isArabic ? 'رد' : 'Reply'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input & Cooldown Bar */}
                  <div className="pt-2 border-t border-border/40 space-y-2 shrink-0">
                    {replyingTo && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
                        <span>
                          {isArabic ? 'رد على' : 'Replying to'} <strong>@{replyingTo.userName}</strong>
                        </span>
                        <button onClick={() => setReplyingTo(null)} className="cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {communityImage && (
                      <div className="relative inline-block">
                        <img
                          src={communityImage}
                          alt="Thumbnail preview"
                          className="w-14 h-14 object-cover rounded-xl border border-emerald-500/50"
                        />
                        <button
                          onClick={() => setCommunityImage(null)}
                          className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-white text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Emoji picker popover */}
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

                    <div className="flex items-center gap-1.5 bg-muted/50 border border-border p-1.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      <label className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer">
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
                        placeholder={
                          isArabic ? 'اكتب رسالة للمجتمع...' : 'Share message with community...'
                        }
                        className="flex-1 bg-transparent border-none text-xs text-foreground focus:outline-none px-2"
                      />

                      <button
                        onClick={sendCommunityMessage}
                        disabled={cooldownLeft > 0 || (!communityInput.trim() && !communityImage)}
                        className="p-2 rounded-xl bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-colors flex items-center justify-center min-w-[36px] cursor-pointer"
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
                  {/* STAFF / ADMIN VIEW: Searchable Inbox with Filter Pills */}
                  {isAdmin ? (
                    <div className="flex flex-col h-full space-y-3">
                      {/* Filter Pills */}
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
                              {filter === 'all'
                                ? isArabic
                                  ? 'الكل'
                                  : 'All'
                                : isArabic
                                ? 'غير مقروء'
                                : 'Unread'}
                            </button>
                          ))}
                        </div>

                        <div className="relative flex-1 max-w-[160px]">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={supportSearch}
                            onChange={(e) => setSupportSearch(e.target.value)}
                            placeholder={isArabic ? 'بحث...' : 'Search...'}
                            className="w-full bg-muted/40 border border-border rounded-xl text-xs pl-8 pr-2 py-1 text-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Ticket Roster vs Chat View */}
                      {!selectedTicketId ? (
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {filteredTickets.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-8">
                              {isArabic ? 'لا توجد تذاكر دعم' : 'No support tickets found'}
                            </p>
                          ) : (
                            filteredTickets.map((tix) => (
                              <button
                                key={tix.id}
                                onClick={() => setSelectedTicketId(tix.id)}
                                className="w-full text-left p-3 rounded-2xl bg-muted/50 hover:bg-muted border border-border/50 transition-all space-y-1 block cursor-pointer"
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
                            ← {isArabic ? 'العودة للبريد' : 'Back to Inbox'}
                          </button>

                          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
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

                          <div className="flex items-center gap-1.5 bg-muted/50 border border-border p-1.5 rounded-2xl mt-2">
                            <input
                              type="text"
                              value={supportInput}
                              onChange={(e) => setSupportInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendSupportMessage()}
                              placeholder={isArabic ? 'الرد على المستخدم...' : 'Reply to user...'}
                              className="flex-1 bg-transparent border-none text-xs text-foreground focus:outline-none px-2"
                            />
                            <button
                              onClick={sendSupportMessage}
                              className="p-2 rounded-xl bg-emerald-500 text-black font-bold cursor-pointer"
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
                        <span>
                          {isArabic
                            ? 'فريق الدعم الفني متواجد لمساعدتك 24/7'
                            : 'Staff support is online to assist you'}
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {supportMessages.length === 0 ? (
                          <div className="text-center text-xs text-muted-foreground py-8">
                            <Headphones className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
                            <p>{isArabic ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can staff help you today?'}</p>
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

                      <div className="flex items-center gap-1.5 bg-muted/50 border border-border p-1.5 rounded-2xl shrink-0">
                        <input
                          type="text"
                          value={supportInput}
                          onChange={(e) => setSupportInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendSupportMessage()}
                          placeholder={
                            isArabic ? 'اكتب استفسارك للدعم...' : 'Type message to staff...'
                          }
                          className="flex-1 bg-transparent border-none text-xs text-foreground focus:outline-none px-2"
                        />
                        <button
                          onClick={sendSupportMessage}
                          disabled={!supportInput.trim()}
                          className="p-2 rounded-xl bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-colors cursor-pointer"
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
