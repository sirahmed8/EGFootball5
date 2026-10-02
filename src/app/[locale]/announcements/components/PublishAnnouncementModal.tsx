'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Tag, Sparkles, Undo2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolidSelect } from '@/components/ui/SolidSelect';
import { Portal } from '@/components/Portal';
import { toast } from 'sonner';
import { generateAIResponse } from '@/lib/aiService';
import { Category } from './AnnouncementDetailsModal';

interface PublishAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { key: Category; label: string }[];
  onPublish: (data: { title: string; summary: string; category: Category }) => Promise<void>;
  submitting: boolean;
  isArabic: boolean;
}

export function PublishAnnouncementModal({
  isOpen,
  onClose,
  categories,
  onPublish,
  submitting,
  isArabic,
}: PublishAnnouncementModalProps) {
  const [pubTitle, setPubTitle] = React.useState('');
  const [pubSummary, setPubSummary] = React.useState('');
  const [pubCategory, setPubCategory] = React.useState<Category>('Platform Updates');
  const [prevTitle, setPrevTitle] = React.useState('');
  const [prevSummary, setPrevSummary] = React.useState('');
  const [isAiImproving, setIsAiImproving] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAiImprove = async () => {
    if (!pubTitle.trim() && !pubSummary.trim()) {
      toast.error(
        isArabic
          ? 'يرجى كتابة عنوان أو مسودة أولاً لتحسينها!'
          : 'Please enter a title or summary draft to improve!'
      );
      return;
    }
    setIsAiImproving(true);
    setPrevTitle(pubTitle);
    setPrevSummary(pubSummary);

    try {
      const prompt = `Improve this platform announcement draft to sound highly professional, energetic, and engaging for football players in Obour & Cairo:\nTitle: ${pubTitle}\nSummary: ${pubSummary}`;
      const res = await generateAIResponse(prompt, { locale: isArabic ? 'ar' : 'en' });
      const parts = res.text.split('\n');
      if (parts.length >= 2) {
        setPubTitle(parts[0].replace(/^Title:\s*/i, '').trim());
        setPubSummary(parts.slice(1).join(' ').replace(/^Summary:\s*/i, '').trim());
      } else {
        setPubSummary(res.text.trim());
      }
      toast.success(
        isArabic
          ? 'تم تطبيق التحسين الذكي! يمكنك التراجع في أي وقت ✨'
          : 'AI Polish applied! Revert anytime with Undo 🪄'
      );
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل التحسين بالذكاء الاصطناعي' : 'AI improvement failed');
    } finally {
      setIsAiImproving(false);
    }
  };

  const handleUndo = () => {
    if (prevTitle || prevSummary) {
      setPubTitle(prevTitle);
      setPubSummary(prevSummary);
      toast.info(isArabic ? 'تم التراجع للمسودة السابقة' : 'Reverted to previous draft!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim() || !pubSummary.trim()) {
      toast.error(
        isArabic ? 'يرجى ملء العنوان والتفاصيل' : 'Please fill in both title and summary'
      );
      return;
    }
    await onPublish({
      title: pubTitle.trim(),
      summary: pubSummary.trim(),
      category: pubCategory,
    });
    setPubTitle('');
    setPubSummary('');
  };

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
          className="w-full max-w-xl bg-black border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
          dir={isArabic ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />{' '}
              {isArabic ? 'نشر إعلان جديد' : 'Push New Announcement'}
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
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                {isArabic ? 'العنوان' : 'Title'}
              </label>
              <input
                type="text"
                required
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                placeholder={
                  isArabic
                    ? 'مثال: الإعلان عن بطولة صيف العبور!'
                    : 'e.g. Obour Summer Cup Gala Announced!'
                }
                className="w-full bg-black border border-white/15 rounded-2xl p-3 text-sm text-foreground focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                {isArabic ? 'الفئة' : 'Category'}
              </label>
              <SolidSelect
                value={pubCategory}
                onChange={(val) => setPubCategory(val as Category)}
                options={categories
                  .filter((c) => c.key !== 'All')
                  .map((c) => ({ value: c.key, label: c.label }))}
                icon={Tag}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground">
                  {isArabic ? 'التفاصيل والمحتوى' : 'Summary & Content'}
                </label>
                <div className="flex items-center gap-2">
                  {prevSummary && (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" /> {isArabic ? 'تراجع' : 'Undo AI'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAiImprove}
                    disabled={isAiImproving}
                    className="text-[11px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />{' '}
                    {isAiImproving
                      ? isArabic
                        ? 'جاري التحسين...'
                        : 'AI Improving...'
                      : isArabic
                      ? '✨ تحسين بالذكاء الاصطناعي'
                      : '✨ AI Improve Text'}
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                required
                value={pubSummary}
                onChange={(e) => setPubSummary(e.target.value)}
                placeholder={
                  isArabic ? 'اكتب تفاصيل الإعلان...' : 'Write announcement details...'
                }
                className="w-full bg-black border border-white/15 rounded-2xl p-3 text-sm text-foreground focus:border-primary outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-black font-black rounded-2xl py-6 glow-primary cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />{' '}
              {submitting
                ? isArabic
                  ? 'جاري النشر...'
                  : 'Publishing...'
                : isArabic
                ? 'نشر الإعلان الرسمي'
                : 'Publish Official Announcement'}
            </Button>
          </form>
        </motion.div>
      </div>
    </Portal>
  );
}
