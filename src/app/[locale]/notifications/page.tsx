'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Calendar, Trophy, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'match' | 'system';
  read: boolean;
  createdAt: number;
}

export default function NotificationsPage() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const mockNotifs: NotificationItem[] = [
    {
      id: 'n1',
      title: 'Booking Confirmed! ⚽',
      body: 'Your deposit for Obour Stadium Slot (8:00 PM) has been verified. Download your QR Pass now!',
      type: 'booking',
      read: false,
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'n2',
      title: 'Public Match Invitation 🏆',
      body: 'Player Ziad invited you to join "Obour Champions 5v5" match tomorrow.',
      type: 'match',
      read: false,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'n3',
      title: 'New Pitch Feature Live! ⚡',
      body: 'InstaPay fast deposit is now available for all stadium bookings.',
      type: 'system',
      read: true,
      createdAt: Date.now() - 172800000,
    },
  ];

  React.useEffect(() => {
    async function fetchNotifs() {
      if (!firebaseUser) {
        setNotifications(mockNotifs);
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
          setNotifications(list);
        } else {
          setNotifications(mockNotifs);
        }
      } catch (err) {
        console.error(err);
        setNotifications(mockNotifs);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifs();
  }, [firebaseUser]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
    if (!firebaseUser) return;
    try {
      const batch = writeBatch(db);
      notifications.filter((n) => !n.read).forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="min-h-screen bg-mesh py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 stadium-glass p-6 md:p-8 rounded-3xl border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black">
            <Bell className="w-3.5 h-3.5" /> Notifications Center
          </div>
          <h1 className="text-3xl font-black text-foreground">
            Activity & <span className="text-gradient-primary">Alerts</span>
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            className="stadium-glass border-white/10 text-foreground hover:bg-white/10 text-xs font-bold rounded-2xl cursor-pointer flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4 text-primary" /> Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filter === 'all' ? 'bg-primary text-black shadow-lg glow-primary-sm' : 'stadium-glass border-white/10 text-muted-foreground'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filter === 'unread' ? 'bg-primary text-black shadow-lg glow-primary-sm' : 'stadium-glass border-white/10 text-muted-foreground'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notification Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className={`stadium-glass border-white/10 rounded-3xl p-5 shadow-lg transition-all ${
                !item.read ? 'border-s-4 border-s-primary bg-primary/5' : 'opacity-80'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                  {item.type === 'booking' ? '⚽' : item.type === 'match' ? '🏆' : '📣'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
