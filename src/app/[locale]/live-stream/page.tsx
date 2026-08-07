'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Tv, MessageSquare, Send, Radio, Users, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { collection, onSnapshot, query, orderBy, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'live' | 'upcoming' | 'ended';
  streamUrl?: string;
}

interface ChatMessage {
  id: string;
  name: string;
  msg: string;
  timestamp: number;
}

export default function LiveStreamPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);
  const [chat, setChat] = React.useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = React.useState('');
  const [liveMatch, setLiveMatch] = React.useState<LiveMatch | null>(null);
  const [loadingMatch, setLoadingMatch] = React.useState(true);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Subscribe to live match in real-time (so scores update without page refresh)
  React.useEffect(() => {
    setLoadingMatch(true);
    const q = query(collection(db, 'live_matches'), where('status', '==', 'live'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          setLiveMatch({ id: d.id, ...d.data() } as LiveMatch);
        } else {
          setLiveMatch(null);
        }
        setLoadingMatch(false);
      },
      (err) => {
        console.error(err);
        setLiveMatch(null);
        setLoadingMatch(false);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to live chat messages
  React.useEffect(() => {
    const q = query(collection(db, 'live_chat'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
      setChat(msgs.slice(-100)); // keep last 100 messages
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    if (inputMsg.trim().length > 300) {
      toast.error(isArabic ? 'الرسالة طويلة جداً (300 حرف كحد أقصى)' : 'Message too long (max 300 characters)');
      return;
    }
    const name = appUser?.name || firebaseUser?.displayName || (isArabic ? 'مشجع' : 'Fan');
    const msgText = inputMsg.trim();
    setInputMsg('');
    try {
      await addDoc(collection(db, 'live_chat'), {
        name,
        msg: msgText,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(err);
      setInputMsg(msgText); // restore message on failure
      toast.error(isArabic ? 'فشل إرسال الرسالة' : 'Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 md:px-8 max-w-7xl mx-auto space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Live Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between global-box p-6 rounded-3xl shadow-xl bg-black"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              {isArabic ? 'بث مباريات' : 'Tournament'} <span className="text-gradient-primary">{isArabic ? 'مباشر' : 'Live Stream'}</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {loadingMatch ? (isArabic ? 'جاري التحقق من المباريات المباشرة...' : 'Checking live matches...') : liveMatch ? `${liveMatch.homeTeam} ${isArabic ? 'ضد' : 'vs'} ${liveMatch.awayTeam} — ${isArabic ? 'مباشر الآن' : 'Live Now'}` : (isArabic ? 'لا يوجد بث مباشر حالياً' : 'No broadcast currently active')}
            </p>
          </div>
        </div>

        <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${liveMatch ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-white/5 text-muted-foreground border border-white/10'}`}>
          {liveMatch ? <><span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> {isArabic ? 'بث مباشر' : 'Live Broadcast'}</> : <><WifiOff className="w-3.5 h-3.5" /> {isArabic ? 'أوفلاين' : 'Offline'}</>}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Stream Player */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="global-box border-white/10 rounded-3xl p-4 shadow-2xl space-y-4 overflow-hidden">
            <div className="w-full h-80 md:h-[450px] rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              {loadingMatch ? (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-sm font-bold">{isArabic ? 'جاري التحقق من البث المباشر...' : 'Checking for live broadcasts...'}</p>
                </div>
              ) : liveMatch ? (
                <>
                  {/* Live Scoreboard Overlay */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between p-3 rounded-2xl bg-black/90 backdrop-blur-md border border-white/15 text-xs font-bold">
                    <div className="flex items-center gap-2 text-foreground font-black">
                      <span className="text-xl">⚽</span> {liveMatch.homeTeam}
                    </div>
                    <div className="text-xl font-black text-primary px-4 py-1.5 rounded-xl bg-white/10 font-mono">
                      {liveMatch.homeScore} - {liveMatch.awayScore}
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-black">
                      {liveMatch.awayTeam} <span className="text-xl">🏟️</span>
                    </div>
                  </div>
                  <div className="text-6xl">⚽</div>
                  <div className="absolute bottom-4 start-4 px-3 py-1 rounded-full bg-black/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                    {isArabic ? 'مباشر' : 'LIVE'} {liveMatch.minute}&apos; ⏱️
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl">
                    📺
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-lg">{isArabic ? 'لا يوجد بث مباشر' : 'No Live Broadcast'}</h3>
                    <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                      {isArabic ? 'لا يوجد مباريات تبث الآن. ارجع لاحقاً عندما يبدأ المشرف بث مباشر.' : 'No tournament match is currently broadcasting. Check back when an admin starts a live session.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Live Fan Chat */}
        <div className="global-box rounded-3xl p-5 border-white/10 shadow-xl flex flex-col justify-between h-[520px]">
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-black text-sm text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> {isArabic ? 'دردشة الجماهير' : 'Live Fan Chat'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">{chat.length} {isArabic ? 'رسائل' : 'messages'}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pt-2 scrollbar-none">
              {chat.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground text-center">
                  <MessageSquare className="w-8 h-8 opacity-30" />
                  <p className="text-xs font-medium">{isArabic ? 'لا توجد رسائل بعد. كن أول من يشجع!' : 'No messages yet. Be the first to cheer!'}</p>
                </div>
              ) : (
                chat.map((c) => (
                  <div key={c.id} className="text-xs bg-white/5 p-2.5 rounded-xl border border-white/5 global-list-item">
                    <span className="font-bold text-primary me-2">{c.name}:</span>
                    <span className="text-foreground">{c.msg}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-white/10">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={firebaseUser ? (isArabic ? 'أرسل رسالة للتشجيع...' : 'Send message to stream...') : (isArabic ? 'سجل الدخول للدردشة...' : 'Sign in to chat...')}
              disabled={!firebaseUser}
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-medium focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <Button type="submit" size="icon" disabled={!firebaseUser} className="bg-primary text-black rounded-xl cursor-pointer">
              <Send className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
