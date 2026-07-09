'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  type: string;
};

export function NotificationBell() {
  const { appUser } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tNav = useTranslations('Navbar');

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!appUser?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', appUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(notifs);
    });

    return unsubscribe;
  }, [appUser?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  const handleMarkAllAsRead = () => {
    notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id));
  };

  if (!appUser) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="w-6 h-6 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — CSS transition, no animation classes that cause flicker */}
      <div
        className={`absolute ltr:right-0 rtl:left-0 mt-2 w-80 max-w-[90vw] bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden
          transition-all duration-200 origin-top
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-800">
          <h3 className="font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No notifications yet
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 border-b border-white/5 transition-colors cursor-pointer hover:bg-white/5 ${notif.read ? 'opacity-70' : 'bg-primary/5'}`}
                onClick={() => { if (!notif.read) handleMarkAsRead(notif.id); }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-semibold text-sm ${notif.read ? 'text-zinc-300' : 'text-white'}`}>
                    {notif.title}
                  </h4>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-snug">{notif.message}</p>
                <span className="text-[10px] text-zinc-500 mt-2 block">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
