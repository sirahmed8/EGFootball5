'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Users, Shield, Hash, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPosition?: string;
  text: string;
  timestamp: any;
}

export default function CommunityChatPage() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);

  const [activeChannel, setActiveChannel] = React.useState('general');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'general', name: 'General Chat', desc: 'Live platform discussion lounge', icon: '⚽' },
    { id: 'need-gk', name: 'Goalkeepers Callout', desc: 'Find goalkeepers for matches', icon: '🧤' },
    { id: 'match-invites', name: 'Match Lobbies', desc: 'Open match announcements', icon: '🏆' },
    { id: 'pitch-reviews', name: 'Stadium Feedback', desc: 'Pitch and turf reviews', icon: '⭐' },
  ];

  React.useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'community_chat', activeChannel, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(msgs);
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, [activeChannel]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      toast.error('Please sign in to send messages');
      return;
    }
    if (!text.trim()) return;

    const msgText = text;
    setText('');
    try {
      await addDoc(collection(db, 'community_chat', activeChannel, 'messages'), {
        senderId: firebaseUser.uid,
        senderName: appUser?.name || firebaseUser.displayName || 'Player',
        senderPosition: appUser?.position || 'MID',
        text: msgText,
        timestamp: Date.now(),
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-mesh py-8 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[85vh]">
      {/* Channels Sidebar */}
      <div className="w-full md:w-80 stadium-glass rounded-3xl p-5 border-white/10 shadow-xl flex flex-col justify-between flex-shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-primary w-5 h-5" />
              <h2 className="font-black text-lg text-foreground">Community Chat</h2>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              ● Live
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">Channels</div>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full p-3.5 rounded-2xl text-start transition-all cursor-pointer flex items-center justify-between ${
                  activeChannel === ch.id
                    ? 'bg-primary text-black font-black shadow-lg glow-primary-sm scale-[1.02]'
                    : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{ch.icon}</span>
                  <div>
                    <div className="text-xs font-extrabold">#{ch.name}</div>
                    <div className={`text-[10px] truncate max-w-[170px] ${activeChannel === ch.id ? 'text-black/80' : 'text-muted-foreground'}`}>
                      {ch.desc}
                    </div>
                  </div>
                </div>
                <Hash className="w-3.5 h-3.5 opacity-50" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-muted-foreground">Respect community guidelines & keep matches fair!</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 stadium-glass rounded-3xl border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-lg">
              #
            </div>
            <div>
              <h3 className="font-black text-lg text-foreground">
                #{channels.find((c) => c.id === activeChannel)?.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {channels.find((c) => c.id === activeChannel)?.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Loading real-time chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm space-y-2">
              <Sparkles className="w-8 h-8 text-primary opacity-50 animate-bounce" />
              <p>Be the first to send a message in #{activeChannel}!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === firebaseUser?.uid;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-foreground">
                    <span className="font-bold text-foreground">{msg.senderName}</span>
                    {msg.senderPosition && (
                      <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono text-[9px] font-bold">
                        {msg.senderPosition}
                      </span>
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                      isMe
                        ? 'bg-primary text-black font-semibold rounded-te-none shadow-md'
                        : 'bg-white/10 text-foreground rounded-ts-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex items-center gap-3 bg-white/5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message #${channels.find((c) => c.id === activeChannel)?.name}...`}
            className="flex-1 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary text-sm font-medium"
          />
          <Button
            type="submit"
            disabled={!text.trim()}
            className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-3.5 rounded-2xl glow-primary cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Send
          </Button>
        </form>
      </div>
    </div>
  );
}
