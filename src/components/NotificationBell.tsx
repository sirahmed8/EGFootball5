'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell } from 'lucide-react';

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
  const popupRef = useRef<HTMLDivElement>(null);

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

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error batch marking notifications as read', err);
    }
  };

  if (!appUser) return null;

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popup — always rendered, CSS transition, clamped to viewport */}
      <div
        ref={popupRef}
        className={`
          absolute top-full mt-2
          w-[min(320px,calc(100vw-1rem)]
          bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden
          transition-all duration-200 origin-top
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        style={{
          /* Keep popup inside the viewport on both sides */
          right: 0,
          maxWidth: 'min(320px, calc(100vw - 1rem))',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-zinc-800">
          <h3 className="font-bold text-white text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${notif.read ? 'opacity-60' : 'bg-primary/5'}`}
                onClick={() => { if (!notif.read) handleMarkAsRead(notif.id); }}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className={`font-semibold text-xs leading-snug ${notif.read ? 'text-zinc-300' : 'text-white'}`}>
                    {notif.title}
                  </h4>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5" />}
                </div>
                <p className="text-xs text-zinc-400 leading-snug">{notif.message}</p>
                <span className="text-[10px] text-zinc-500 mt-1.5 block">
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
