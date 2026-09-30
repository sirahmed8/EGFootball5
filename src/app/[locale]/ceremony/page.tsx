'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CeremonyPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { toast } from 'sonner';

import { SeasonData, TimeLeft } from './types';
import { CeremonyCountdown } from './components/CeremonyCountdown';
import { CeremonyAwardsGrid } from './components/CeremonyAwardsGrid';
import { CeremonyTotsPitch } from './components/CeremonyTotsPitch';
import { CeremonyAdminModal } from './components/CeremonyAdminModal';

export default function CeremonyPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const appUser = useAuthStore((s) => s.appUser);
  const isAdminOrOwner = appUser?.role === 'admin' || appUser?.role === 'owner';

  const [seasonData, setSeasonData] = useState<SeasonData>({
    targetDate: '',
    goldenBootWinner: isArabic ? 'في انتظار ختام الموسم' : 'Pending Season End',
    goldenBootGoals: 0,
    goldenGloveWinner: isArabic ? 'في انتظار ختام الموسم' : 'Pending Season End',
    goldenGloveSheets: 0,
    playmakerWinner: isArabic ? 'في انتظار ختام الموسم' : 'Pending Season End',
    playmakerAssists: 0,
    mvpWinner: isArabic ? 'في انتظار ختام الموسم' : 'Pending Season End',
    mvpRating: 0,
    fairplayWinner: isArabic ? 'في انتظار ختام الموسم' : 'Pending Season End',
    championSquad: isArabic ? 'في انتظار ختام الموسم' : 'Pending Season End',
    totsGk: isArabic ? 'حارس المرمى' : 'Top GK',
    totsDef1: isArabic ? 'مدافع 1' : 'Top DEF 1',
    totsDef2: isArabic ? 'مدافع 2' : 'Top DEF 2',
    totsMid: isArabic ? 'خط وسط' : 'Top MID',
    totsStr: isArabic ? 'مهاجم' : 'Top STR',
  });

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch Season Data & Compute Automatic Winners from Live Firestore Stats
  useEffect(() => {
    async function fetchSeasonDocAndStats() {
      let target = '';
      let savedData: Partial<SeasonData> = {};

      try {
        const snap = await getDoc(doc(db, 'system', 'season'));
        if (snap.exists()) {
          const data = snap.data() as SeasonData;
          target = data.targetDate || '';
          savedData = data;
        }
      } catch {
        // Quiet fallback if system doc is missing or restricted
      }

      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (!usersSnap.empty) {
          const allUsers = usersSnap.docs
            .map((d) => {
              const data = d.data();
              return {
                name: data.name || data.displayName || (isArabic ? 'لاعب' : 'Player'),
                position: data.position || 'MID',
                goals: Number(data.goals) || 0,
                assists: Number(data.assists) || 0,
                saves: Number(data.saves) || 0,
                rating: Number(data.rating) || 0,
              };
            })
            .filter((u) => u.goals > 0 || u.saves > 0 || u.rating > 0 || u.assists > 0);

          if (allUsers.length > 0) {
            const topScorer = [...allUsers].sort((a, b) => b.goals - a.goals)[0];
            const topGk =
              [...allUsers]
                .filter((u) => u.position === 'GK')
                .sort((a, b) => b.saves - a.saves)[0] || allUsers[0];
            const topAssister =
              [...allUsers].sort((a, b) => b.assists - a.assists)[0] || allUsers[0];
            const topMvp =
              [...allUsers].sort((a, b) => b.rating - a.rating)[0] || allUsers[0];
            const totsDef = allUsers
              .filter((u) => u.position === 'DEF')
              .sort((a, b) => b.rating - a.rating);
            const totsMid =
              allUsers
                .filter((u) => u.position === 'MID')
                .sort((a, b) => b.rating - a.rating)[0] || allUsers[0];

            setSeasonData({
              targetDate: target,
              goldenBootWinner:
                savedData.goldenBootWinner ||
                (topScorer?.goals
                  ? topScorer.name
                  : isArabic
                  ? 'في انتظار ختام الموسم'
                  : 'Pending Season End'),
              goldenBootGoals: savedData.goldenBootGoals ?? (topScorer?.goals || 0),
              goldenGloveWinner:
                savedData.goldenGloveWinner ||
                (topGk?.saves
                  ? topGk.name
                  : isArabic
                  ? 'في انتظار ختام الموسم'
                  : 'Pending Season End'),
              goldenGloveSheets: savedData.goldenGloveSheets ?? (topGk?.saves || 0),
              playmakerWinner:
                savedData.playmakerWinner ||
                (topAssister?.assists
                  ? topAssister.name
                  : isArabic
                  ? 'في انتظار ختام الموسم'
                  : 'Pending Season End'),
              playmakerAssists: savedData.playmakerAssists ?? (topAssister?.assists || 0),
              mvpWinner:
                savedData.mvpWinner ||
                (topMvp?.rating
                  ? topMvp.name
                  : isArabic
                  ? 'في انتظار ختام الموسم'
                  : 'Pending Season End'),
              mvpRating: savedData.mvpRating ?? (topMvp?.rating || 0),
              fairplayWinner: savedData.fairplayWinner || 'Obour Eagles',
              championSquad: savedData.championSquad || 'Obour Eagles 🦅',
              totsGk: savedData.totsGk || topGk?.name || (isArabic ? 'حارس المرمى' : 'Top GK'),
              totsDef1:
                savedData.totsDef1 || totsDef[0]?.name || (isArabic ? 'مدافع 1' : 'Top DEF 1'),
              totsDef2:
                savedData.totsDef2 || totsDef[1]?.name || (isArabic ? 'مدافع 2' : 'Top DEF 2'),
              totsMid: savedData.totsMid || totsMid?.name || (isArabic ? 'خط وسط' : 'Top MID'),
              totsStr: savedData.totsStr || topScorer?.name || (isArabic ? 'مهاجم' : 'Top STR'),
            });
            return;
          }
        }
      } catch {
        // Quiet fallback if users query is restricted
      } finally {
        setLoading(false);
      }

      setSeasonData((prev) => ({ ...prev, targetDate: target }));
    }
    fetchSeasonDocAndStats();
  }, [isArabic]);

  // Live Countdown Interval
  useEffect(() => {
    if (!seasonData.targetDate || seasonData.targetDate.trim() === '') return;
    const interval = setInterval(() => {
      const target = new Date(seasonData.targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seasonData.targetDate]);

  const handleSaveSeasonSettings = async (updated: SeasonData) => {
    try {
      await setDoc(doc(db, 'system', 'season'), updated, { merge: true });
      setSeasonData(updated);
      toast.success(
        isArabic ? 'تم تحديث إعدادات حفل ختام الموسم!' : 'Season Ceremony settings updated!'
      );
    } catch {
      toast.error(isArabic ? 'فشل تحديث الإعدادات.' : 'Failed to update ceremony settings.');
    }
  };

  const hasActiveTimer = Boolean(seasonData.targetDate && seasonData.targetDate.trim() !== '');

  if (loading) {
    return <CeremonyPageSkeleton />;
  }

  return (
    <div
      className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="relative z-10 w-full max-w-6xl space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">
                {isArabic
                  ? 'حفل ختام الموسم وجوائز التكريم'
                  : 'End-of-Season Ceremony & Trophy Gala'}
              </span>
            </div>
            {isAdminOrOwner && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                size="sm"
                className="bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl text-xs ms-3 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 me-1" />
                <span>{isArabic ? 'تعديل إعدادات الحفل' : 'Edit Ceremony Settings'}</span>
              </Button>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gradient-primary">
            {isArabic ? 'نهائي الموسم الرياضي' : 'Season Finale'}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
            {isArabic
              ? 'العد التنازلي الرسمي لحفل ختام الموسم، توزيع الجوائز والكؤوس التكريمية.'
              : 'Official countdown to the Grand Season Ceremony, Trophy Distribution & Awards Gala.'}
          </p>
        </motion.div>

        {/* Countdown Timer or Season in Progress Banner */}
        <CeremonyCountdown
          hasActiveTimer={hasActiveTimer}
          timeLeft={timeLeft}
          isArabic={isArabic}
          isAdminOrOwner={isAdminOrOwner}
          onOpenEditModal={() => setIsEditModalOpen(true)}
        />

        {/* Awards & TOTS Pitch Showcase */}
        {hasActiveTimer && (
          <div className="space-y-8 mt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-foreground flex items-center justify-center gap-2">
                <Trophy className="w-7 h-7 text-amber-400" />
                <span>
                  {isArabic
                    ? 'معرض كؤوس وجوائز ختام الموسم'
                    : 'Season Trophy Gala & Awards Showcase'}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {isArabic
                  ? 'الجوائز والكؤوس الرسمية المقرر توزيعها في الحفل الختامي'
                  : 'Official honors to be awarded at the grand ceremony'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CeremonyAwardsGrid seasonData={seasonData} isArabic={isArabic} />
              <CeremonyTotsPitch seasonData={seasonData} isArabic={isArabic} />
            </div>
          </div>
        )}
      </div>

      {/* Admin Settings Modal */}
      <CeremonyAdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        seasonData={seasonData}
        onSave={handleSaveSeasonSettings}
        isArabic={isArabic}
      />
    </div>
  );
}
