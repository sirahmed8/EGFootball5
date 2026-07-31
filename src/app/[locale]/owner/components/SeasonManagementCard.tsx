'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CustomDarkDatePicker } from '@/components/ui/CustomDarkDatePicker';
import { Trophy, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function SeasonManagementCard() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSeason() {
      try {
        const snap = await getDoc(doc(db, 'system', 'season'));
        if (snap.exists() && snap.data().targetDate) {
          const iso = snap.data().targetDate;
          if (iso) setTargetDate(iso.slice(0, 16));
        }
      } catch (err) {
        console.warn('Error fetching season doc:', err);
      }
    }
    fetchSeason();
  }, []);

  const handleSaveSeason = async () => {
    if (!targetDate) {
      toast.error(isArabic ? 'يرجى إدخال تاريخ انتهاء الموسم' : 'Please select season end date');
      return;
    }

    setSaving(true);
    try {
      const iso = new Date(targetDate).toISOString();
      await setDoc(doc(db, 'system', 'season'), { targetDate: iso }, { merge: true });
      toast.success(isArabic ? 'تم تحديث ميعاد حفل ختام الموسم بنجاح 🏆' : 'Season Ceremony countdown date updated! 🏆');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update season date');
    } finally {
      setSaving(false);
    }
  };

  const handlePreset = (days: number) => {
    const future = new Date(Date.now() + days * 86400000);
    setTargetDate(future.toISOString().slice(0, 16));
  };

  const handleResetSeason = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'system', 'season'), { targetDate: '' }, { merge: true });
      setTargetDate('');
      toast.success(isArabic ? 'تم إلغاء عد الموسم ومسح الموعد' : 'Season countdown reset to TBD (Unstarted)');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset season');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-white/10 rounded-3xl p-6 md:p-8 bg-black shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">
            {isArabic ? 'إدارة الموسم وحفل الجوائز' : 'Season & Gala Ceremony Management'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isArabic ? 'حدد موعد الختام والعد التنازلي لحفل توزيع الجوائز' : 'Set the official season end date and ceremony countdown target.'}
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {isArabic ? 'تاريخ وساعة ختام الموسم:' : 'Season Finale Date & Time:'}
          </label>
          <CustomDarkDatePicker
            value={targetDate}
            onChange={(newVal) => setTargetDate(newVal)}
            isArabic={isArabic}
          />
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handlePreset(30)}
            className="text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-foreground transition-colors cursor-pointer"
          >
            🗓️ +30 Days
          </button>
          <button
            type="button"
            onClick={() => handlePreset(60)}
            className="text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-foreground transition-colors cursor-pointer"
          >
            🏆 +60 Days
          </button>
          <button
            type="button"
            onClick={handleResetSeason}
            className="text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-full text-rose-400 transition-colors cursor-pointer"
          >
            ⚠️ Reset Season (TBD)
          </button>
        </div>

        <Button
          onClick={handleSaveSeason}
          disabled={saving}
          className="bg-primary text-black font-black rounded-2xl px-6 py-3 glow-primary cursor-pointer flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ وتحديث العد التنازلي' : 'Save & Update Season Countdown')}
        </Button>
      </div>
    </div>
  );
}
