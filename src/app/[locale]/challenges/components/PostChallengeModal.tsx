'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/Portal';

interface PostChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSquadName?: string;
  onSubmit: (data: {
    squadName: string;
    pitchName: string;
    dateStr: string;
    timeStr: string;
    wager: string;
  }) => Promise<void>;
  submitting: boolean;
  isArabic: boolean;
}

export function PostChallengeModal({
  isOpen,
  onClose,
  defaultSquadName = '',
  onSubmit,
  submitting,
  isArabic,
}: PostChallengeModalProps) {
  const [squadName, setSquadName] = React.useState(defaultSquadName);
  const [pitchName, setPitchName] = React.useState('');
  const [wager, setWager] = React.useState('');
  const [dateStr, setDateStr] = React.useState('');
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    if (defaultSquadName) setSquadName(defaultSquadName);
  }, [defaultSquadName]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ squadName, pitchName, dateStr, timeStr, wager });
    setPitchName('');
    setWager('');
    setDateStr('');
    setTimeStr('');
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg stadium-glass border-border rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative bg-card"
          dir={isArabic ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-2xl font-black text-foreground">
              {isArabic ? 'إضافة تحدي بين الفرق' : 'Post Squad Challenge'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                {isArabic ? 'اسم فريقك *' : 'Your Squad Name *'}
              </label>
              <input
                type="text"
                required
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                placeholder={isArabic ? 'مثال: صقور العبور' : 'e.g. Obour Warriors'}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                {isArabic ? 'عنوان أو اسم الملعب *' : 'Pitch Location *'}
              </label>
              <input
                type="text"
                required
                value={pitchName}
                onChange={(e) => setPitchName(e.target.value)}
                placeholder={isArabic ? 'مثال: استاد الأهلي بالعبور - ملعب 2' : 'e.g. Al Ahly Obour Stadium Pitch 2'}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  {isArabic ? 'اليوم' : 'Date'}
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  {isArabic ? 'الوقت' : 'Time'}
                </label>
                <input
                  type="time"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                {isArabic ? 'شرط التحدي والرهان *' : 'Wager Terms *'}
              </label>
              <input
                type="text"
                required
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                placeholder={isArabic ? 'مثال: الخاسر يدفع حجز الملعب كاملاً' : 'e.g. Loser Pays Pitch Fee'}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2 stadium-glass border-white/10 text-foreground rounded-2xl"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-1/2 bg-primary text-black font-black rounded-2xl glow-primary"
              >
                {submitting
                  ? isArabic
                    ? 'جاري النشر...'
                    : 'Posting...'
                  : isArabic
                  ? 'نشر التحدي 🚀'
                  : 'Post Challenge 🚀'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </Portal>
  );
}
