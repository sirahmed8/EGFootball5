'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/Portal';

interface GoalSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; videoUrl: string; pitchName: string }) => Promise<void>;
  submitting: boolean;
  isArabic: boolean;
}

export function GoalSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  isArabic,
}: GoalSubmissionModalProps) {
  const [goalTitle, setGoalTitle] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [pitchName, setPitchName] = React.useState('');

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
    await onSubmit({ title: goalTitle, videoUrl, pitchName });
    setGoalTitle('');
    setVideoUrl('');
    setPitchName('');
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
          className="w-full max-w-lg stadium-glass border-white/10 rounded-3xl p-6 md:p-8 space-y-4 bg-black relative"
          dir={isArabic ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-2xl font-black text-foreground">
              {isArabic ? 'تقديم فيديو الهدف للمسابقة' : 'Submit Goal Video Clip'}
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
                {isArabic ? 'عنوان الهدف *' : 'Goal Title *'}
              </label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder={isArabic ? 'مثال: تسديدة صاروخية في المقص' : 'e.g. Long-range Rocket Top Corner'}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                {isArabic ? 'رابط الفيديو (YouTube / MP4) *' : 'Video URL (YouTube / MP4) *'}
              </label>
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                {isArabic ? 'اسم الملعب' : 'Pitch Name'}
              </label>
              <input
                type="text"
                value={pitchName}
                onChange={(e) => setPitchName(e.target.value)}
                placeholder={isArabic ? 'مثال: استاد الأهلي بالعبور' : 'e.g. Obour Eagles Arena'}
                className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-1/2 rounded-2xl"
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
                    ? 'جاري التقديم...'
                    : 'Submitting...'
                  : isArabic
                  ? 'ارفع المقطع 🚀'
                  : 'Submit Clip 🚀'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </Portal>
  );
}
