'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMatchChat, ChatMessage } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChatMessagesSkeleton } from '@/components/skeletons/PageSkeletons';
import { toast } from 'sonner';

const QUICK_CHIPS = ['⚽جاهزين للماتش؟', '🔥 يلا بينا!', '👍 تمام يا شباب', '🏆 الفوز لينا!'];

export default function MatchChat({ matchId }: { matchId: string }) {
  const { firebaseUser, appUser } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations('MatchChat');

  const { messages, loading, typingUsers, sendMessage, setTyping } = useMatchChat(matchId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendDirectMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !firebaseUser || !appUser) return;

    const success = await sendMessage(
      textToSend.trim(),
      firebaseUser.uid,
      appUser.name || 'Player'
    );

    if (!success) {
      toast.error(t('errorSend'));
      // Restore input text on send failure
      setNewMessage(textToSend);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    if (!firebaseUser || !appUser) return;

    // Trigger typing status
    setTyping(firebaseUser.uid, appUser.name || 'Player', true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(firebaseUser.uid, appUser.name || 'Player', false);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = newMessage;
    setNewMessage('');
    if (firebaseUser && appUser) {
      setTyping(firebaseUser.uid, appUser.name || 'Player', false);
    }
    await sendDirectMessage(msg);
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Filter typing indicator to exclude current user
  const otherTypingUsers = Object.entries(typingUsers).filter(
    ([uid]) => uid !== firebaseUser?.uid
  );

  return (
    <div className="flex flex-col h-[60vh] max-h-[600px] border border-border rounded-xl overflow-hidden bg-card/90 backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <span>⚽</span> {t('title')}
        </h3>
        <span className="text-xs text-emerald-400 font-mono font-bold">LIVE CHAT</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <ChatMessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm space-y-2">
            <span className="text-3xl">💬</span>
            <p>{t('noMessages')}</p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isMe = msg.senderId === firebaseUser?.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}
              >
                <span className="text-[10px] text-muted-foreground mb-1 px-1 font-semibold">
                  {msg.senderName}
                </span>
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] break-words shadow-sm ${
                    isMe
                      ? 'bg-primary text-black font-semibold rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm border border-border/50'
                  } ${msg.isOptimistic ? 'opacity-70 animate-pulse' : ''}`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/60 mt-1 px-1 font-mono">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        {/* Typing indicator bubble */}
        {otherTypingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic px-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {otherTypingUsers.map(([, name]) => name).join(', ')} {t('typing') || 'is typing...'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chips Bar */}
      <div className="px-3 py-1.5 bg-muted/30 border-t border-border flex gap-1.5 overflow-x-auto scrollbar-none">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => sendDirectMessage(chip)}
            className="px-2.5 py-1 rounded-full global-list-item text-[11px] font-bold text-foreground hover:bg-primary/20 hover:border-primary/40 transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background flex gap-2">
        <Input
          value={newMessage}
          onChange={handleInputChange}
          placeholder={t('placeholder')}
          className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary text-xs sm:text-sm"
          autoFocus
        />
        <Button
          type="submit"
          disabled={!newMessage.trim()}
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md global-btn shrink-0"
        >
          <Send className="w-4 h-4 rtl:rotate-180" />
        </Button>
      </form>
    </div>
  );
}
