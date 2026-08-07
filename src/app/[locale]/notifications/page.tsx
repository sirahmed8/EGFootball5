'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, BellOff, Calendar, Trophy, Info, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'match' | 'system';
  read: boolean;
  createdAt: number;
  userId: string;
}

function formatRelativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const typeConfig: Record<string, { emoji: string; color: string }> = {
  booking: { emoji: '⚽', color: 'text-emerald-400' },
  match: { emoji: '🏆', color: 'text-amber-400' },
  system: { emoji: '📣', color: 'text-blue-400' },
};

export default function NotificationsPage() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  // Real-time listener
  React.useEffect(() => {
    if (!firebaseUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
        setNotifications(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [firebaseUser]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
    try {
      const batch = writeBatch(db);
      unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    toast('Clear all notifications?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Clear All',
        onClick: async () => {
          const snapshot = [...notifications];
          setNotifications([]);
          try {
            const batch = writeBatch(db);
            snapshot.forEach((n) => batch.delete(doc(db, 'notifications', n.id)));
            await batch.commit();
            toast.success('All notifications cleared');
          } catch (err) {
            console.error(err);
            setNotifications(snapshot);
            toast.error('Failed to clear notifications');
          }
        },
      },
    });
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 global-box global-outline-glow p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black">
            <Bell className="w-3.5 h-3.5" />
            Notifications Center
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-foreground">
            Activity & <span className="text-gradient-primary">Alerts</span>
          </h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            disabled={unreadCount === 0}
            className="global-box border-white/10 text-foreground hover:bg-white/10 text-xs font-bold rounded-2xl global-btn flex items-center gap-2 disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4 text-primary" /> Mark all read
          </Button>
          <Button
            onClick={handleClearAll}
            variant="outline"
            disabled={notifications.length === 0}
            className="global-box border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold rounded-2xl global-btn flex items-center gap-2 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-primary text-black shadow-lg glow-primary-sm'
              : 'global-box border-white/10 text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-primary text-black shadow-lg glow-primary-sm'
              : 'global-box border-white/10 text-muted-foreground hover:text-foreground'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : !firebaseUser ? (
        <Card className="global-box border-white/10 rounded-3xl p-12 text-center space-y-4 bg-black">
          <BellOff className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-black text-foreground">Sign in to see notifications</h3>
          <p className="text-sm text-muted-foreground">Your booking alerts and match updates will appear here.</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="global-box border-white/10 rounded-3xl p-12 text-center space-y-4 bg-black">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-black text-foreground">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {filter === 'unread'
              ? "You're all caught up! Switch to 'All' to see past alerts."
              : 'Booking confirmations, match invites, and platform alerts will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((item) => {
              const cfg = typeConfig[item.type] || typeConfig.system;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    onClick={() => !item.read && handleMarkRead(item.id)}
                    className={`global-box border-white/10 rounded-3xl p-5 shadow-lg transition-all cursor-pointer group ${
                      !item.read
                        ? 'border-s-4 border-s-primary bg-primary/5 hover:bg-primary/10'
                        : 'opacity-75 hover:opacity-100 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0`}>
                        {cfg.emoji}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-bold text-sm truncate ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                        {!item.read && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> New
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
