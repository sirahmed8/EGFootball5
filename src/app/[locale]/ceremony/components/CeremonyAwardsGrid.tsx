'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Award, Star, HeartHandshake, Crown } from 'lucide-react';
import { SeasonData } from '../types';

interface CeremonyAwardsGridProps {
  seasonData: SeasonData;
  isArabic: boolean;
}

export function CeremonyAwardsGrid({ seasonData, isArabic }: CeremonyAwardsGridProps) {
  const pendingLabel = isArabic ? 'قيد الانتظار' : 'Pending';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Golden Boot */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-amber-500/30 global-box space-y-3"
      >
        <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 w-fit">
          <Trophy className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-black text-amber-400">
            {isArabic ? 'جائزة الحذاء الذهبي' : 'Golden Boot'}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {isArabic ? 'أفضل هداف في الموسم الرياضي.' : 'Top goalscorer of the season.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
              🏆 {seasonData.goldenBootWinner || pendingLabel}
            </span>
            {seasonData.goldenBootGoals ? (
              <span className="text-[11px] font-bold text-emerald-400">
                ⚽ {seasonData.goldenBootGoals} {isArabic ? 'هدف' : 'Goals'}
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* 2. Golden Glove */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-slate-400/30 global-box space-y-3"
      >
        <div className="p-3.5 rounded-2xl bg-slate-400/20 text-slate-300 w-fit">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-300">
            {isArabic ? 'جائزة القفاز الذهبي' : 'Golden Glove'}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {isArabic ? 'أفضل حارس مرمى ونظافة شباك.' : 'Best goalkeeper clean sheets.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-300 font-bold text-[11px]">
              🧤 {seasonData.goldenGloveWinner || pendingLabel}
            </span>
            {seasonData.goldenGloveSheets ? (
              <span className="text-[11px] font-bold text-cyan-400">
                🛡️ {seasonData.goldenGloveSheets} {isArabic ? 'كلين شيت' : 'Clean Sheets'}
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* 3. Playmaker Award */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-emerald-500/30 global-box space-y-3"
      >
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit">
          <Award className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-black text-emerald-400">
            {isArabic ? 'صانع ألعاب الموسم' : 'Playmaker of the Season'}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {isArabic ? 'اللاعب الأكثر صناعة للأهداف.' : 'Player with most goal assists.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
              🅰️ {seasonData.playmakerWinner || pendingLabel}
            </span>
            {seasonData.playmakerAssists ? (
              <span className="text-[11px] font-bold text-emerald-400">
                🅰️ {seasonData.playmakerAssists} {isArabic ? 'أسيست' : 'Assists'}
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* 4. Season MVP */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-purple-500/30 global-box space-y-3"
      >
        <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 w-fit">
          <Star className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-black text-purple-400">
            {isArabic ? 'أفضل لاعب في الموسم (MVP)' : 'Season MVP Award'}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {isArabic ? 'صاحب أعلى متوسط تقييم بالمباريات.' : 'Highest average match rating.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-[11px]">
              ⭐ {seasonData.mvpWinner || pendingLabel}
            </span>
            {seasonData.mvpRating ? (
              <span className="text-[11px] font-bold text-purple-400">
                ⭐ {seasonData.mvpRating} {isArabic ? 'تقييم' : 'Rating'}
              </span>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* 5. Fair Play Award */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-rose-500/30 global-box space-y-3"
      >
        <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 w-fit">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-black text-rose-400">
            {isArabic ? 'اللعب النظيف والروح الرياضية' : 'Fair Play & Conduct'}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {isArabic ? 'أفضل سلوك وانضباط رياضي.' : 'Best sportsmanship & discipline.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-[11px]">
              🎖️ {seasonData.fairplayWinner || pendingLabel}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 6. Champion Squad Cup */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-yellow-500/30 global-box space-y-3"
      >
        <div className="p-3.5 rounded-2xl bg-yellow-500/20 text-yellow-400 w-fit">
          <Crown className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-black text-yellow-400">
            {isArabic ? 'كأس الفريق بطل الموسم' : 'Champion Squad Cup'}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {isArabic ? 'الفريق الأعلى تصنيفاً ومشاركة.' : 'Top ranked neighborhood team.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-bold text-[11px]">
              👑 {seasonData.championSquad || pendingLabel}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
