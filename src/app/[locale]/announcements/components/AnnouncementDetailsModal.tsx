'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, X } from 'lucide-react';
import { Portal } from '@/components/Portal';

export type Category =
  | 'All'
  | 'Tournaments'
  | 'Stadium Maintenance'
  | 'Special Offers'
  | 'Platform Updates';

export interface Announcement {
  id: string;
  category: Category;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  badgeColor?: string;
}

interface AnnouncementDetailsModalProps {
  announcement: Announcement | null;
  onClose: () => void;
  isArabic: boolean;
}

export function AnnouncementDetailsModal({
  announcement,
  onClose,
  isArabic,
}: AnnouncementDetailsModalProps) {
  React.useEffect(() => {
    if (!announcement) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [announcement, onClose]);

  if (!announcement) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-black border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          dir={isArabic ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 start-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>

          <div className="space-y-6 mt-2">
            <span className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block">
              {announcement.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{announcement.title}</h2>
            <div className="flex items-center gap-6 text-sm text-neutral-400 border-b border-white/10 pb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {announcement.date}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {announcement.author}
              </span>
            </div>
            <div className="text-neutral-300 leading-relaxed space-y-4 text-sm sm:text-base">
              {announcement.summary}
            </div>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
}
