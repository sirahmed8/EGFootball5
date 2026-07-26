'use client';

import { useState, useEffect, useCallback } from 'react';
import { rtdb } from '@/lib/firebase/config';
import {
  ref,
  push,
  set,
  onValue,
  onDisconnect,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number | null;
  isOptimistic?: boolean;
}

interface TypingData {
  name?: string;
  timestamp?: number;
}

export function useMatchChat(matchId: string, initialLimit = 50) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [limitCount, setLimitCount] = useState<number>(initialLimit);

  // Subscribe to RTDB messages
  useEffect(() => {
    if (!matchId) return;

    const messagesRef = query(
      ref(rtdb, `chats/${matchId}/messages`),
      orderByChild('timestamp'),
      limitToLast(limitCount)
    );

    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const msgs: ChatMessage[] = [];
          snapshot.forEach((childSnapshot) => {
            msgs.push({ id: childSnapshot.key as string, ...childSnapshot.val() });
          });
          setMessages(msgs);
        } else {
          setMessages([]);
        }
      },
      (error) => {
        console.error('Error fetching chat messages:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [matchId, limitCount]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!matchId) return;

    const typingRef = ref(rtdb, `chats/${matchId}/typing`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, TypingData>;
        const activeTyping: Record<string, string> = {};
        const now = Date.now();
        Object.entries(data).forEach(([uid, val]) => {
          if (val && val.name && val.timestamp && now - val.timestamp < 10000) {
            activeTyping[uid] = val.name;
          }
        });
        setTypingUsers(activeTyping);
      } else {
        setTypingUsers({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [matchId]);

  // Send message with optimistic update & error callback for text restoration
  const sendMessage = useCallback(
    async (text: string, senderId: string, senderName: string): Promise<boolean> => {
      const cleanText = text.trim();
      if (!cleanText || !matchId || !senderId) return false;

      const tempId = `opt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const optimisticMsg: ChatMessage = {
        id: tempId,
        text: cleanText,
        senderId,
        senderName: senderName || 'Player',
        timestamp: Date.now(),
        isOptimistic: true,
      };

      // Optimistically append message
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const messagesRef = ref(rtdb, `chats/${matchId}/messages`);
        await push(messagesRef, {
          text: cleanText,
          senderId,
          senderName: senderName || 'Player',
          timestamp: serverTimestamp(),
        });
        return true;
      } catch (error) {
        console.error('Failed to send RTDB message:', error);
        // Rollback optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return false;
      }
    },
    [matchId]
  );

  // Set typing status
  const setTyping = useCallback(
    async (senderId: string, senderName: string, isTyping: boolean) => {
      if (!matchId || !senderId) return;

      const userTypingRef = ref(rtdb, `chats/${matchId}/typing/${senderId}`);

      if (isTyping) {
        onDisconnect(userTypingRef).remove();
        await set(userTypingRef, {
          name: senderName || 'Player',
          timestamp: Date.now(),
        });
      } else {
        await set(userTypingRef, null);
      }
    },
    [matchId]
  );

  const loadMore = useCallback(() => {
    setLimitCount((prev) => prev + 50);
  }, []);

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    setTyping,
    loadMore,
  };
}

