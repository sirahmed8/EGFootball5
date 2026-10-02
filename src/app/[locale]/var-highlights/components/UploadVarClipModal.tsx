'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/Portal';
import { toast } from 'sonner';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase/config';

export interface VarClip {
  id: string;
  title: string;
  player: string;
  pitch: string;
  time: string;
  videoUrl?: string;
  category?: string;
  matchId?: string;
}

interface UploadVarClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClipUploaded: (clip: VarClip) => void;
  defaultPitch: string;
  isArabic: boolean;
}

export function UploadVarClipModal({
  isOpen,
  onClose,
  onClipUploaded,
  defaultPitch,
  isArabic,
}: UploadVarClipModalProps) {
  const [newTitle, setNewTitle] = React.useState('');
  const [newPlayer, setNewPlayer] = React.useState('');
  const [newPitch, setNewPitch] = React.useState(defaultPitch);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [newMatchId, setNewMatchId] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (defaultPitch) setNewPitch(defaultPitch);
  }, [defaultPitch]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUploadClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error(isArabic ? 'يرجى إدخال عنوان المقطع' : 'Please enter a clip title');
      return;
    }
    if (!videoFile) {
      toast.error(isArabic ? 'يرجى اختيار مقطع فيديو' : 'Please select a video file');
      return;
    }
    setSubmitting(true);
    try {
      const fileRef = ref(storage, `var_highlights/${Date.now()}_${videoFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, videoFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error(error);
          toast.error(isArabic ? 'فشل تحميل الفيديو' : 'Video upload failed');
          setSubmitting(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const newDoc = {
            title: newTitle.trim(),
            player: newPlayer.trim() || (isArabic ? 'لاعب غير محدد' : 'Unknown Player'),
            pitch: newPitch.trim() || 'Obour Main Stadium',
            time: isArabic ? 'اليوم' : 'Today',
            videoUrl: downloadUrl,
            category: 'Match Event',
            matchId: newMatchId.trim() || null,
            timestamp: Date.now(),
          };

          const refDoc = await addDoc(collection(db, 'var_highlights'), newDoc);
          const createdClip: VarClip = { id: refDoc.id, ...newDoc, matchId: newMatchId.trim() || undefined };
          onClipUploaded(createdClip);
          toast.success(isArabic ? 'تم رفع مقطع الفار بنجاح! 🎬' : 'VAR highlight uploaded successfully! 🎬');
          setSubmitting(false);
          setNewTitle('');
          setNewPlayer('');
          setVideoFile(null);
          setUploadProgress(0);
          onClose();
        }
      );
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? 'فشل رفع المقطع' : 'Failed to upload highlight');
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="global-box border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 bg-black"
          onClick={(e) => e.stopPropagation()}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />{' '}
              {isArabic ? 'رفع مقطع فار جديد' : 'Upload Pitch VAR Clip'}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUploadClip} className="space-y-4 text-xs font-bold">
            <div>
              <label className="text-muted-foreground uppercase block mb-1">
                {isArabic ? 'عنوان المقطع' : 'Highlight Title'}
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={
                  isArabic ? 'مثال: هدف خرافي دبل كيك' : "e.g. Insane Bicycle Kick Goal in 90'"
                }
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase block mb-1">
                {isArabic ? 'اللاعب (اختياري)' : 'Featured Player (Optional)'}
              </label>
              <input
                type="text"
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                placeholder="e.g. Messi or leave empty"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase block mb-1">
                {isArabic ? 'معرف المباراة (اختياري)' : 'Match ID (Optional)'}
              </label>
              <input
                type="text"
                value={newMatchId}
                onChange={(e) => setNewMatchId(e.target.value)}
                placeholder="Link this clip to a specific match event"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase block mb-1">
                {isArabic ? 'اسم الملعب' : 'Stadium / Pitch Name'}
              </label>
              <input
                type="text"
                value={newPitch}
                onChange={(e) => setNewPitch(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
              />
            </div>

            <div>
              <label className="text-muted-foreground uppercase block mb-1">
                {isArabic ? 'ملف الفيديو (MP4)' : 'Video File (MP4)'}
              </label>
              <input
                type="file"
                accept="video/mp4,video/x-m4v,video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVideoFile(e.target.files[0]);
                  }
                }}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-black hover:file:bg-primary/90"
                dir="ltr"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-black font-black rounded-xl"
              >
                {submitting
                  ? isArabic
                    ? 'جاري النشر...'
                    : 'Publishing...'
                  : isArabic
                  ? 'نشر المقطع'
                  : 'Publish Clip'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </Portal>
  );
}
