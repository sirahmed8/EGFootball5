'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
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
import { AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NotificationsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { NotificationCard, NotificationItem } from './components/NotificationCard';

export default function NotificationsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

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
    const original = [...notifications];
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل في تحديث الإشعار' : 'Failed to update notification');
      setNotifications(original);
    }
  };

  const handleDelete = async (id: string) => {
    const original = [...notifications];
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
      toast.success(isArabic ? 'تم حذف الإشعار' : 'Notification deleted');
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل في حذف الإشعار' : 'Failed to delete notification');
      setNotifications(original);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(isArabic ? 'تم تمييز جميع الإشعارات كمقروءة' : 'All notifications marked as read');
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
    setClearing(true);
    const snapshot = [...notifications];
    setNotifications([]);
    try {
      const batch = writeBatch(db);
      snapshot.forEach((n) => batch.delete(doc(db, 'notifications', n.id)));
      await batch.commit();
      setShowClearConfirm(false);
      toast.success(isArabic ? 'تم مسح جميع الإشعارات' : 'All notifications cleared');
    } catch (err) {
      console.error(err);
      setNotifications(snapshot);
      toast.error(isArabic ? 'فشل مسح الإشعارات' : 'Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black">
            <Bell className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مركز الإشعارات' : 'Notifications Center'}</span>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-foreground">
            {isArabic ? 'النشاط و' : 'Activity & '}<span className="text-primary">{isArabic ? 'التنبيهات' : 'Alerts'}</span>
          </h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            disabled={unreadCount === 0}
            className="border-border text-foreground hover:bg-muted text-xs font-bold rounded-2xl flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-primary" /> {isArabic ? 'تحديد الكل كمقروء' : 'Mark all read'}
          </Button>
          <Button
            onClick={() => setShowClearConfirm(true)}
            variant="outline"
            disabled={notifications.length === 0}
            className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-bold rounded-2xl flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> {isArabic ? 'مسح الكل' : 'Clear all'}
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-primary text-black shadow-lg'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {isArabic ? `الكل (${notifications.length})` : `All (${notifications.length})`}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-primary text-black shadow-lg'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {isArabic ? `غير المقروءة (${unreadCount})` : `Unread (${unreadCount})`}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <NotificationsPageSkeleton />
      ) : !firebaseUser ? (
        <Card className="border-border rounded-3xl p-12 text-center space-y-4 bg-card">
          <BellOff className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-black text-foreground">{isArabic ? 'سجل دخولك لعرض الإشعارات' : 'Sign in to see notifications'}</h3>
          <p className="text-sm text-muted-foreground">{isArabic ? 'تنبيهات الحجوزات ومبارياتك ستظهر هنا فور تسجيل الدخول.' : 'Your booking alerts and match updates will appear here.'}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-border rounded-3xl p-12 text-center space-y-4 bg-card">
          <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-black text-foreground">
            {filter === 'unread'
              ? (isArabic ? 'لا توجد إشعارات غير مقروءة' : 'No unread notifications')
              : (isArabic ? 'لا توجد إشعارات بعد' : 'No notifications yet')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {filter === 'unread'
              ? (isArabic ? 'أنت على اطلاع بكل جديد! انتقل إلى "الكل" لعرض الأرشيف.' : "You're all caught up! Switch to 'All' to see past alerts.")
              : (isArabic ? 'تأكيدات الحجوزات ودعوات المباريات ستصلك هنا فور حدوثها.' : 'Booking confirmations, match invites, and platform alerts will appear here.')}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                isArabic={isArabic}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Explicit Confirmation Dialog for Clear All */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="rounded-3xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-destructive font-black flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {isArabic ? 'مسح جميع الإشعارات' : 'Clear All Notifications'}
            </DialogTitle>
            <DialogDescription>
              {isArabic
                ? 'هل أنت متأكد من رغبتك في حذف كافة التنبيهات والإشعارات؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete all notifications? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
              disabled={clearing}
              className="rounded-xl cursor-pointer"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearing}
              className="rounded-xl font-bold cursor-pointer"
            >
              {clearing ? (isArabic ? 'جاري المسح...' : 'Clearing...') : (isArabic ? 'تأكيد المسح' : 'Clear All')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
