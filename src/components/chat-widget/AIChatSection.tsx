'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { generateAIResponse } from '@/lib/aiService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bot } from 'lucide-react';
import {
  AIMessage,
  SpeechRecognitionConstructor,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance,
  SpeechRecognitionResultItem,
} from './types';
import { AIChatMessageItem } from './AIChatMessageItem';
import { AIChatInputBar } from './AIChatInputBar';

interface AIChatSectionProps {
  firebaseUser: any;
  appUser: any;
  locale: string;
  isArabic: boolean;
  onClose: () => void;
  aiMessages: AIMessage[];
  setAiMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
  initialAiLoading: boolean;
  scrollToBottom: () => void;
}

export function AIChatSection({
  firebaseUser,
  appUser,
  locale,
  isArabic,
  onClose,
  aiMessages,
  setAiMessages,
  initialAiLoading,
  scrollToBottom,
}: AIChatSectionProps) {
  const router = useRouter();
  const t = useTranslations('FloatingChat');

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const localScrollToBottom = useCallback(() => {
    scrollToBottom();
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [scrollToBottom]);

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

      const isAdviceReq =
        queryText.includes('نصيحة') ||
        queryText.includes('Insight') ||
        queryText.includes('Tactical');
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
            setAiMessages((prev) => [
              ...prev,
              { id: `usr-${Date.now()}`, sender: 'user', text: queryText, timestamp: Date.now() },
              cooldownMsg,
            ]);
            setAiInput('');
            localScrollToBottom();
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
      localScrollToBottom();

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
        localScrollToBottom();
      }
    },
    [aiInput, attachedImage, appUser, locale, isArabic, setAiMessages, localScrollToBottom]
  );

  if (!firebaseUser) {
    return (
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
            onClose();
            router.push('/login');
          }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl px-6 py-5 w-full text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          {isArabic ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      <div className="flex-1 overflow-y-auto space-y-3 pe-1">
        {initialAiLoading ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="max-w-[85%] p-4 rounded-2xl bg-muted/60 border border-border/50 space-y-2.5">
              <div className="h-4 bg-primary/20 rounded-md w-3/4 animate-pulse" />
              <div className="h-3.5 bg-muted/60 rounded-md w-full animate-pulse" />
              <div className="h-3.5 bg-muted/60 rounded-md w-5/6 animate-pulse" />
            </div>
          </div>
        ) : (
          aiMessages.map((msg) => (
            <AIChatMessageItem
              key={msg.id}
              message={msg}
              isArabic={isArabic}
              onPlayTTS={playTTSAudio}
              onChipClick={(chip) => sendAIMessage(chip)}
            />
          ))
        )}

        {aiLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/60 border border-border/40 text-xs text-muted-foreground w-fit animate-pulse">
            <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>{isArabic ? 'جاري التحليل والكتابة...' : 'Thinking & formulating response...'}</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      <AIChatInputBar
        aiInput={aiInput}
        setAiInput={setAiInput}
        attachedImage={attachedImage}
        setAttachedImage={setAttachedImage}
        isListening={isListening}
        toggleVoiceRecognition={toggleVoiceRecognition}
        handleImageUpload={handleImageUpload}
        sendAIMessage={() => sendAIMessage()}
        aiLoading={aiLoading}
        isArabic={isArabic}
      />
    </div>
  );
}
