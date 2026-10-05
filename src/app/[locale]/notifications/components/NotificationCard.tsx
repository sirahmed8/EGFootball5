'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'match' | 'system';
  read: boolean;
  createdAt: number;
  userId: string;
}

interface NotificationCardProps {
  item: NotificationItem;
  isArabic: boolean;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(ts: number, isArabic: boolean): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return isArabic ? 'الآن' : 'Just now';
  if (diff < 3600) return isArabic ? `منذ ${Math.floor(diff / 60)} دقيقة` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return isArabic ? `منذ ${Math.floor(diff / 3600)} ساعة` : `${Math.floor(diff / 3600)}h ago`;
  return isArabic ? `منذ ${Math.floor(diff / 86400)} يوم` : `${Math.floor(diff / 86400)}d ago`;
}

const typeConfig: Record<string, { emoji: string; color: string }> = {
  booking: { emoji: '⚽', color: 'text-emerald-400' },
  match: { emoji: '🏆', color: 'text-amber-400' },
  system: { emoji: '📣', color: 'text-blue-400' },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  isArabic,
  onMarkRead,
  onDelete,
}) => {
  const cfg = typeConfig[item.type] || typeConfig.system;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={() => !item.read && onMarkRead(item.id)}
        className={`border-border rounded-3xl p-5 shadow-lg transition-all cursor-pointer group bg-card ${
          !item.read
            ? 'border-s-4 border-s-primary bg-primary/5 hover:bg-primary/10'
            : 'opacity-80 hover:opacity-100 hover:bg-muted/40'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center text-lg flex-shrink-0">
            {cfg.emoji}
          </div>
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`font-bold text-sm truncate ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(item.createdAt, isArabic)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                  title={isArabic ? 'حذف الإشعار' : 'Delete notification'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
            {!item.read && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {isArabic ? 'جديد' : 'New'}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
