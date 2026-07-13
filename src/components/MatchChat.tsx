'use client';

import { useState, useEffect, useRef } from 'react';
import { rtdb } from '@/lib/firebase/config';
import { ref, push, serverTimestamp, onChildAdded, onValue, off, query, orderByChild, limitToLast, DataSnapshot } from 'firebase/database';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useLocale } from 'next-intl';
import { ChatMessagesSkeleton } from '@/components/skeletons/PageSkeletons';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number | null;
}

export default function MatchChat({ matchId }: { matchId: string }) {
  const { firebaseUser, appUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!matchId) return;
    
    // Reference to the match's chat messages (fetching last 50)
    const messagesRef = query(ref(rtdb, `chats/${matchId}/messages`), orderByChild('timestamp'), limitToLast(50));
    
    const handleNewMessage = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find(m => m.id === snapshot.key)) return prev;
          return [...prev, { id: snapshot.key, ...data }];
        });
      }
    };

    let isMounted = true;

    // First load event to turn off loading state
    onValue(messagesRef, (snapshot) => {
      if (!isMounted) return;
      setLoading(false);
      if (snapshot.exists()) {
        const msgs: Message[] = [];
        snapshot.forEach((childSnapshot) => {
          msgs.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        setMessages(msgs);
      } else {
        setMessages([]);
      }
      
      // Then listen for new children added
      if (isMounted) {
        onChildAdded(messagesRef, handleNewMessage);
      }
    }, { onlyOnce: true });

    return () => {
      isMounted = false;
      off(messagesRef);
    };
  }, [matchId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !firebaseUser || !appUser) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // optimistic clear

    const messagesRef = ref(rtdb, `chats/${matchId}/messages`);
    await push(messagesRef, {
      text: messageText,
      senderId: firebaseUser.uid,
      senderName: appUser.name || 'Player',
      timestamp: serverTimestamp()
    });
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[60vh] max-h-[600px] border border-border rounded-xl overflow-hidden bg-card/40 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/20">
        <h3 className="font-bold text-foreground">
          {locale === 'ar' ? 'دردشة المباراة' : 'Match Chat'}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <ChatMessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {locale === 'ar' ? 'لا توجد رسائل بعد. كن أول من يكتب!' : 'No messages yet. Be the first to say hi!'}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === firebaseUser?.uid;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <span className="text-[10px] text-muted-foreground mb-1 px-1">
                  {msg.senderName}
                </span>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${isMe ? 'bg-primary text-black rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/60 mt-1 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={locale === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
          className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary"
          autoFocus
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim()} 
          size="icon"
          className="rounded-full bg-primary text-black hover:bg-primary/90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
