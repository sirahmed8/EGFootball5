'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SeasonManagementCard() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [targetDate, setTargetDate] = useState('2026-08-31T20:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSeason() {
      try {
        const snap = await getDoc(doc(db, 'system', 'season'));
        if (snap.exists() && snap.data().targetDate) {
          const iso = snap.data().targetDate;
          setTargetDate(iso.slice(0, 16));
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

  return (
    <div className="global-box border-white/10 rounded-3xl p-6 md:p-8 bg-black shadow-xl space-y-6">
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
          <Input
            type="datetime-local"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-black border-white/10 rounded-2xl text-foreground"
          />
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
