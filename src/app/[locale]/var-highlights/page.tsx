'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Camera, Play, Share2, Film, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { VarHighlightsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useLocale } from 'next-intl';
import { UploadVarClipModal, VarClip } from './components/UploadVarClipModal';

export default function VarHighlightsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const appUser = useAuthStore((s) => s.appUser);
  const isOwnerOrAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';

  const [clips, setClips] = React.useState<VarClip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedClip, setSelectedClip] = React.useState<VarClip | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchClips() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'var_highlights'), orderBy('timestamp', 'desc')));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VarClip));
          setClips(list);
          setSelectedClip(list[0]);
        } else {
          setClips([]);
        }
      } catch (err) {
        console.error(err);
        setClips([]);
      } finally {
        setLoading(false);
      }
    }
    fetchClips();
  }, []);

  const handleClipUploaded = (clip: VarClip) => {
    setClips((prev) => [clip, ...prev]);
    setSelectedClip(clip);
  };


  const [isSlowMo, setIsSlowMo] = React.useState(false);
  const [upvotes, setUpvotes] = React.useState<Record<string, number>>({});

  const handleUpvote = (id: string) => {
    setUpvotes((prev) => ({ ...prev, [id]: (prev[id] || 12) + 1 }));
    toast.success(isArabic ? 'تم التصويت للقطة الأسبوع! 🗳️⚽' : 'Vote submitted for VAR Goal of the Week! 🗳️⚽');
  };

  if (loading) {
    return <VarHighlightsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 global-box p-8 rounded-3xl border-white/10 shadow-xl"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black">
            <Camera className="w-4 h-4" /> {isArabic ? 'استوديو الفار والمقاطع 2.0' : 'Stadium Pitch VAR Highlights 2.0'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground">
            {isArabic ? 'تقنية' : 'Pitch'} <span className="text-gradient-primary">{isArabic ? 'الفار' : 'VAR Studio'}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{isArabic ? 'مقاطع فيديو تلقائية مدتها 30 ثانية، مع تقنية العرض البطيء، وتصويت الجمهور.' : '30-second automated video highlights, 0.25x slow-mo VAR review, and community goal voting.'}</p>
        </div>

        {isOwnerOrAdmin && (
          <Button
            onClick={() => setIsUploadOpen(true)}
            size="lg"
            className="bg-primary text-black hover:bg-primary/90 font-black rounded-2xl glow-primary cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> {isArabic ? 'رفع مقطع فار' : 'Upload VAR Highlight'}
          </Button>
        )}
      </motion.div>

      {/* Main Video Player */}
      {selectedClip ? (
        <Card className="global-box border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="w-full h-80 md:h-[420px] rounded-2xl bg-black border-2 border-emerald-500/40 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
            <span className={`text-7xl group-hover:scale-110 transition-transform ${isSlowMo ? 'animate-pulse' : ''}`}>⚽</span>
            
            <div className="absolute top-4 start-4 flex items-center gap-2 z-20">
              <Button
                size="sm"
                variant={isSlowMo ? 'default' : 'outline'}
                onClick={() => setIsSlowMo(!isSlowMo)}
                className="text-xs font-black rounded-xl bg-black/80 backdrop-blur border border-cyan-500/40 text-cyan-400"
              >
                {isSlowMo ? (isArabic ? '🔍 العرض البطيء مفعل' : '🔍 VAR 0.25x SLOW-MO ACTIVE') : (isArabic ? '▶ العرض الطبيعي 1.0x' : '▶ 1.0x NORMAL SPEED')}
              </Button>
            </div>

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Button size="lg" className="bg-primary text-black rounded-full p-6 glow-primary">
                <Play className="w-8 h-8 fill-black" />
              </Button>
            </div>
            <div className="absolute bottom-4 start-4 px-3 py-1 rounded-full bg-black/90 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {isArabic ? 'تسجيلات فار عالية الدقة' : 'EGFootball5 VAR HD Recording'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h2 className="text-2xl font-black text-foreground">{selectedClip.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isArabic ? 'اللاعب' : 'Player'}: <strong className="text-foreground">{selectedClip.player}</strong> • {isArabic ? 'الملعب' : 'Stadium'}: {selectedClip.pitch} ({selectedClip.time})
              </p>
              {selectedClip.matchId && (
                <div className="mt-2 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md inline-flex items-center gap-1">
                  🔗 Linked to Match ID: {selectedClip.matchId}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleUpvote(selectedClip.id)}
                variant="outline"
                className="font-black px-4 py-3 rounded-2xl border-white/10 text-xs flex items-center gap-2 cursor-pointer"
              >
                👍 {isArabic ? 'تصويت' : 'Vote Clip'} ({upvotes[selectedClip.id] || 12})
              </Button>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(isArabic ? 'تم نسخ الرابط!' : 'Clip link copied!');
                }}
                className="bg-primary text-black hover:bg-primary/90 font-black px-6 py-3.5 rounded-2xl glow-primary-sm cursor-pointer flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> {isArabic ? 'مشاركة المقطع' : 'Share VAR Clip'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="global-box border-white/10 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-foreground">{isArabic ? 'لا توجد مقاطع فيديو فار حالياً' : 'No VAR Highlights Uploaded Yet'}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isOwnerOrAdmin
              ? (isArabic ? 'اضغط على الزر بالأعلى لرفع مقطع فار من مباريات الملعب!' : 'Click the button above to upload VAR video clips from your pitch matches!')
              : (isArabic ? 'يقوم أصحاب الملاعب برفع مقاطع الفار بعد المباريات. تحقق مرة أخرى قريباً!' : 'Pitch owners and stadium referees upload VAR match highlights after games. Check back soon!')}
          </p>
        </Card>
      )}

      {/* Upload Modal */}
      <UploadVarClipModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onClipUploaded={handleClipUploaded}
        defaultPitch={(appUser as any)?.pitchName || appUser?.city || 'Obour Main Stadium'}
        isArabic={isArabic}
      />
    </div>
  );
}

