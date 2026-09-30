'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { SupportTicket, SupportMessage } from './types';
import { AdminTicketList } from './AdminTicketList';
import { SupportThreadView } from './SupportThreadView';

interface StaffSupportSectionProps {
  firebaseUser: any;
  appUser: any;
  isAdmin: boolean;
  isArabic: boolean;
  isOpen: boolean;
}

export function StaffSupportSection({
  firebaseUser,
  appUser,
  isAdmin,
  isArabic,
  isOpen,
}: StaffSupportSectionProps) {
  const t = useTranslations('FloatingChat');

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

  useEffect(() => {
    if (!isOpen || !firebaseUser) return;

    if (isAdmin) {
      const qTickets = query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc'));
      const unsubTickets = onSnapshot(
        qTickets,
        (snap) => {
          const tix = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
          setSupportTickets(tix);
        },
        (err) => {
          console.warn('Admin support tickets snapshot error:', err);
        }
      );
      return () => unsubTickets();
    } else {
      const userTicketId = firebaseUser.uid;
      const qUserMsgs = query(
        collection(db, 'support_tickets', userTicketId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const unsubUserMsgs = onSnapshot(
        qUserMsgs,
        (snap) => {
          const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportMessage));
          setSupportMessages(msgs);
          scrollToBottom();
        },
        (err) => {
          console.warn('User support messages snapshot error:', err);
        }
      );
      return () => unsubUserMsgs();
    }
  }, [isOpen, firebaseUser, isAdmin, scrollToBottom]);

  useEffect(() => {
    if (!isAdmin || !selectedTicketId) return;
    const qStaffMsgs = query(
      collection(db, 'support_tickets', selectedTicketId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubStaffMsgs = onSnapshot(
      qStaffMsgs,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportMessage));
        setSupportMessages(msgs);
        scrollToBottom();
      },
      (err) => {
        console.warn('Staff support messages snapshot error:', err);
      }
    );
    return () => unsubStaffMsgs();
  }, [isAdmin, selectedTicketId, scrollToBottom]);

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

  const filteredTickets = supportTickets.filter((tick) => {
    const matchesFilter =
      supportFilter === 'all' || (supportFilter === 'unread' && tick.unreadByStaff);
    const matchesSearch =
      !supportSearch ||
      tick.userName.toLowerCase().includes(supportSearch.toLowerCase()) ||
      tick.lastMessage.toLowerCase().includes(supportSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-3">
      {isAdmin ? (
        !selectedTicketId ? (
          <AdminTicketList
            supportFilter={supportFilter}
            setSupportFilter={setSupportFilter}
            supportSearch={supportSearch}
            setSupportSearch={setSupportSearch}
            filteredTickets={filteredTickets}
            onSelectTicket={setSelectedTicketId}
          />
        ) : (
          <SupportThreadView
            isAdmin={true}
            supportMessages={supportMessages}
            supportInput={supportInput}
            setSupportInput={setSupportInput}
            sendSupportMessage={sendSupportMessage}
            onBackToInbox={() => setSelectedTicketId(null)}
            chatBottomRef={chatBottomRef}
          />
        )
      ) : (
        <div className="flex flex-col h-full justify-between space-y-3">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{t('staffSupportOnline')}</span>
          </div>

          <SupportThreadView
            isAdmin={false}
            supportMessages={supportMessages}
            supportInput={supportInput}
            setSupportInput={setSupportInput}
            sendSupportMessage={sendSupportMessage}
            chatBottomRef={chatBottomRef}
          />
        </div>
      )}
    </div>
  );
}
