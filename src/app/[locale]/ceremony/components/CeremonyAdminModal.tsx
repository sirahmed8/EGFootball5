'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/Portal';
import { CustomDarkDatePicker } from '@/components/ui/CustomDarkDatePicker';
import { SeasonData } from '../types';

interface CeremonyAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonData: SeasonData;
  onSave: (data: SeasonData) => Promise<void>;
  isArabic: boolean;
}

export function CeremonyAdminModal({
  isOpen,
  onClose,
  seasonData,
  onSave,
  isArabic,
}: CeremonyAdminModalProps) {
  const [editTargetDate, setEditTargetDate] = useState(seasonData.targetDate || '');
  const [editBootWinner, setEditBootWinner] = useState(seasonData.goldenBootWinner || '');
  const [editBootGoals, setEditBootGoals] = useState(seasonData.goldenBootGoals || 0);
  const [editGloveWinner, setEditGloveWinner] = useState(seasonData.goldenGloveWinner || '');
  const [editGloveSheets, setEditGloveSheets] = useState(seasonData.goldenGloveSheets || 0);
  const [editPlaymaker, setEditPlaymaker] = useState(seasonData.playmakerWinner || '');
  const [editAssists, setEditAssists] = useState(seasonData.playmakerAssists || 0);
  const [editMvp, setEditMvp] = useState(seasonData.mvpWinner || '');
  const [editMvpRating, setEditMvpRating] = useState(seasonData.mvpRating || 0);
  const [editFairplay, setEditFairplay] = useState(seasonData.fairplayWinner || '');
  const [editChampionSquad, setEditChampionSquad] = useState(seasonData.championSquad || '');
  const [editGk, setEditGk] = useState(seasonData.totsGk || '');
  const [editDef1, setEditDef1] = useState(seasonData.totsDef1 || '');
  const [editDef2, setEditDef2] = useState(seasonData.totsDef2 || '');
  const [editMid, setEditMid] = useState(seasonData.totsMid || '');
  const [editStr, setEditStr] = useState(seasonData.totsStr || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        targetDate: editTargetDate,
        goldenBootWinner: editBootWinner,
        goldenBootGoals: editBootGoals,
        goldenGloveWinner: editGloveWinner,
        goldenGloveSheets: editGloveSheets,
        playmakerWinner: editPlaymaker,
        playmakerAssists: editAssists,
        mvpWinner: editMvp,
        mvpRating: editMvpRating,
        fairplayWinner: editFairplay,
        championSquad: editChampionSquad,
        totsGk: editGk,
        totsDef1: editDef1,
        totsDef2: editDef2,
        totsMid: editMid,
        totsStr: editStr,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="global-box border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>{isArabic ? 'إعدادات حفل ختام الموسم' : 'Admin Season Ceremony Settings'}</span>
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
            <div>
              <label className="text-amber-400 uppercase block mb-1">
                {isArabic ? 'تاريخ ختام الموسم' : 'Season End Target Date & Time'}
              </label>
              <CustomDarkDatePicker
                value={editTargetDate}
                onChange={(val) => setEditTargetDate(val)}
                isArabic={isArabic}
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {isArabic
                  ? 'اختر التوقيت لإطلاق الحفل والعد التنازلي، أو اتركه فارغاً لإبقاء الموسم مستمراً.'
                  : 'Select the target date & time to launch countdown, or clear to keep Season in Progress.'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-amber-400 uppercase block mb-1">
                  {isArabic ? 'الفائز بالحذاء الذهبي' : 'Golden Boot Winner'}
                </label>
                <input
                  type="text"
                  value={editBootWinner}
                  onChange={(e) => setEditBootWinner(e.target.value)}
                  placeholder={isArabic ? 'اسم اللاعب' : 'Player Name'}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>
              <div>
                <label className="text-amber-400 uppercase block mb-1">
                  {isArabic ? 'عدد الأهداف' : 'Goals Scored'}
                </label>
                <input
                  type="number"
                  value={editBootGoals}
                  onChange={(e) => setEditBootGoals(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 uppercase block mb-1">
                  {isArabic ? 'الفائز بالقفاز الذهبي' : 'Golden Glove Winner'}
                </label>
                <input
                  type="text"
                  value={editGloveWinner}
                  onChange={(e) => setEditGloveWinner(e.target.value)}
                  placeholder={isArabic ? 'اسم الحارس' : 'Goalkeeper Name'}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>
              <div>
                <label className="text-slate-300 uppercase block mb-1">
                  {isArabic ? 'كلين شيت' : 'Clean Sheets'}
                </label>
                <input
                  type="number"
                  value={editGloveSheets}
                  onChange={(e) => setEditGloveSheets(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-emerald-400 uppercase block mb-1">
                  {isArabic ? 'صانع ألعاب الموسم' : 'Playmaker Winner'}
                </label>
                <input
                  type="text"
                  value={editPlaymaker}
                  onChange={(e) => setEditPlaymaker(e.target.value)}
                  placeholder={isArabic ? 'اسم اللاعب' : 'Assister Name'}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>
              <div>
                <label className="text-purple-400 uppercase block mb-1">
                  {isArabic ? 'أفضل لاعب (MVP)' : 'Season MVP'}
                </label>
                <input
                  type="text"
                  value={editMvp}
                  onChange={(e) => setEditMvp(e.target.value)}
                  placeholder={isArabic ? 'اسم اللاعب' : 'MVP Player Name'}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-emerald-400 uppercase block">
                {isArabic ? 'تشكيلة الموسم (TOTS خماسي)' : 'Team of the Season (TOTS 5-a-side)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={isArabic ? 'حارس المرمى (GK)' : 'Goalkeeper (GK)'}
                  value={editGk}
                  onChange={(e) => setEditGk(e.target.value)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
                <input
                  type="text"
                  placeholder={isArabic ? 'المهاجم (STR)' : 'Striker (STR)'}
                  value={editStr}
                  onChange={(e) => setEditStr(e.target.value)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
                <input
                  type="text"
                  placeholder={isArabic ? 'مدافع 1 (DEF)' : 'Defender 1 (DEF)'}
                  value={editDef1}
                  onChange={(e) => setEditDef1(e.target.value)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
                <input
                  type="text"
                  placeholder={isArabic ? 'مدافع 2 (DEF)' : 'Defender 2 (DEF)'}
                  value={editDef2}
                  onChange={(e) => setEditDef2(e.target.value)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
                <input
                  type="text"
                  placeholder={isArabic ? 'لاعب وسط (MID)' : 'Midfielder (MID)'}
                  value={editMid}
                  onChange={(e) => setEditMid(e.target.value)}
                  className="col-span-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/10">
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
                disabled={saving}
                className="flex-1 bg-amber-500 text-black font-black rounded-xl"
              >
                {saving
                  ? isArabic
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : isArabic
                  ? 'حفظ الإعدادات'
                  : 'Save Settings'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </Portal>
  );
}
