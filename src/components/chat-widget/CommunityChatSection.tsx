'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { toast } from 'sonner';
import { CommunityMessage, SLOW_MODE_SECONDS } from './types';
import { CommunityMessageItem } from './CommunityMessageItem';
import { CommunityInputBar } from './CommunityInputBar';

interface CommunityChatSectionProps {
  firebaseUser: any;
  appUser: any;
  isAdmin: boolean;
  isArabic: boolean;
  isOpen: boolean;
}

export function CommunityChatSection({
  firebaseUser,
  appUser,
  isAdmin,
  isArabic,
  isOpen,
}: CommunityChatSectionProps) {
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [communityInput, setCommunityInput] = useState('');
  const [communityImage, setCommunityImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const qComm = query(
      collection(db, 'community_messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    const unsubComm = onSnapshot(
      qComm,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityMessage));
        setCommunityMessages(msgs);
        scrollToBottom();
      },
      (err) => {
        console.warn('Community chat snapshot error:', err);
      }
    );

    return () => unsubComm();
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  const handleCommunityImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error(isArabic ? 'صيغة الصورة غير مدعومة' : 'Image format not supported');
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
      toast.warning(
        isArabic
          ? `انتظر ${cooldownLeft} ثوانٍ قبل الإرسال مجدداً`
          : `Please wait ${cooldownLeft}s before sending again`
      );
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

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      <div className="flex-1 overflow-y-auto space-y-3 pe-1">
        {communityMessages.map((msg) => (
          <CommunityMessageItem
            key={msg.id}
            msg={msg}
            firebaseUser={firebaseUser}
            isAdmin={isAdmin}
            onDelete={deleteCommunityMessage}
            onToggleReaction={toggleReaction}
            onReply={setReplyingTo}
          />
        ))}
        <div ref={chatBottomRef} />
      </div>

      <CommunityInputBar
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        communityImage={communityImage}
        setCommunityImage={setCommunityImage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        communityInput={communityInput}
        setCommunityInput={setCommunityInput}
        handleCommunityImage={handleCommunityImage}
        sendCommunityMessage={sendCommunityMessage}
        cooldownLeft={cooldownLeft}
      />
    </div>
  );
}
