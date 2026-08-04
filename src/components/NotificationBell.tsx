'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  AppNotification,
} from '@/hooks/useNotifications';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { badgePopVariant } from '@/lib/animations';

export function NotificationBell() {
  const { appUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations('Notifications');

  const { data: notifications = [] } = useNotifications(appUser?.uid);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

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

  if (!appUser) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ notificationId: id, userId: appUser.uid });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    markAllAsReadMutation.mutate({ userId: appUser.uid, notifications });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer text-foreground"
        aria-label={t('title')}
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              variants={badgePopVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute top-1 end-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 w-[min(340px,calc(100vw-1.5rem))] bg-[#0B0F19] border-2 border-emerald-500/30 rounded-3xl shadow-2xl z-[9999] overflow-hidden end-0 global-outline-glow"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                {t('title')}
                {unreadCount > 0 && (
                  <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary/70 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t('markAllRead')}
                </button>
              )}
            </div>

            {/* Scrollable body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/50 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground font-medium">{t('empty')}</p>
                </div>
              ) : (
                notifications.map((notif: AppNotification) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 cursor-pointer global-list-item ${
                      notif.read ? 'opacity-60' : 'bg-primary/10 border-s-2 border-primary'
                    }`}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif.id);
                    }}
                  >
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <h4
                        className={`font-semibold text-xs leading-snug ${
                          notif.read ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{notif.message}</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1.5 block">
                      {new Date(notif.createdAt).toLocaleString(
                        locale === 'ar' ? 'ar-EG' : 'en-US',
                        { dateStyle: 'short', timeStyle: 'short' }
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
