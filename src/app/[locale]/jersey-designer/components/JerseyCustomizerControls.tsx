'use client';

import * as React from 'react';
import { Shield, Crown, Star, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CollarStyle, PatternType, BadgeType, JERSEY_COLORS } from './types';

interface JerseyCustomizerControlsProps {
  isArabic: boolean;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  collarStyle: CollarStyle;
  setCollarStyle: (style: CollarStyle) => void;
  pattern: PatternType;
  setPattern: (pattern: PatternType) => void;
  badgeIcon: BadgeType;
  setBadgeIcon: (badge: BadgeType) => void;
  squadName: string;
  setSquadName: (val: string) => void;
  playerName: string;
  setPlayerName: (val: string) => void;
  number: string;
  setNumber: (val: string) => void;
}

export function JerseyCustomizerControls({
  isArabic,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  collarStyle,
  setCollarStyle,
  pattern,
  setPattern,
  badgeIcon,
  setBadgeIcon,
  squadName,
  setSquadName,
  playerName,
  setPlayerName,
  number,
  setNumber,
}: JerseyCustomizerControlsProps) {
  const patterns: PatternType[] = ['solid', 'stripes', 'hoops', 'checkerboard', 'halves', 'sash'];
  const badges = [
    { id: 'shield', icon: Shield },
    { id: 'crown', icon: Crown },
    { id: 'star', icon: Star },
    { id: 'flame', icon: Flame },
  ] as const;

  return (
    <div className="lg:col-span-7 space-y-4">
      <Card className="rounded-[2rem] border-white/[0.06] bg-white/[0.02] p-5 md:p-7 shadow-xl space-y-6">
        {/* Row 1: Pattern + Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Pattern */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              {isArabic ? 'تصميم النسيج' : 'Fabric Pattern'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {patterns.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPattern(p)}
                  className={`text-[10px] h-9 rounded-xl font-black uppercase tracking-wide transition-all duration-200 border cursor-pointer ${
                    pattern === p
                      ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                      : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              {isArabic ? 'شعار النادي' : 'Club Crest'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBadgeIcon(b.id)}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all duration-200 border cursor-pointer ${
                      badgeIcon === b.id
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Row 2: Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              {isArabic ? 'اللون الأساسي' : 'Base Color'}
            </label>
            <div className="flex flex-wrap gap-2">
              {JERSEY_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setPrimaryColor(c.hex)}
                  title={c.name}
                  className="relative rounded-full transition-all duration-200 focus:outline-none cursor-pointer"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: c.hex,
                    boxShadow:
                      primaryColor === c.hex
                        ? `0 0 0 2px #050505, 0 0 0 4px ${c.hex}, 0 0 14px ${c.hex}80`
                        : '0 0 0 1px rgba(255,255,255,0.12)',
                    transform: primaryColor === c.hex ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              {isArabic ? 'اللون الثانوي' : 'Accent & Trim'}
            </label>
            <div className="flex flex-wrap gap-2">
              {JERSEY_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSecondaryColor(c.hex)}
                  title={c.name}
                  className="relative rounded-full transition-all duration-200 focus:outline-none cursor-pointer"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: c.hex,
                    boxShadow:
                      secondaryColor === c.hex
                        ? `0 0 0 2px #050505, 0 0 0 4px ${c.hex}, 0 0 14px ${c.hex}80`
                        : '0 0 0 1px rgba(255,255,255,0.12)',
                    transform: secondaryColor === c.hex ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Row 3: Collar */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
            {isArabic ? 'الياقة' : 'Collar Cut'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCollarStyle('vneck')}
              className={`h-9 rounded-xl font-black text-sm tracking-wide transition-all duration-200 border cursor-pointer ${
                collarStyle === 'vneck'
                  ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
              }`}
            >
              V-Neck
            </button>
            <button
              type="button"
              onClick={() => setCollarStyle('crew')}
              className={`h-9 rounded-xl font-black text-sm tracking-wide transition-all duration-200 border cursor-pointer ${
                collarStyle === 'crew'
                  ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/25 hover:bg-white/[0.07] hover:text-white/80'
              }`}
            >
              Crew Cut
            </button>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Row 4: Text inputs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              {isArabic ? 'اسم النادي' : 'Squad Chest'}
            </label>
            <input
              type="text"
              value={squadName}
              maxLength={15}
              onChange={(e) => setSquadName(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black uppercase text-xs focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-white/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              {isArabic ? 'اسم اللاعب' : 'Player Back'}
            </label>
            <input
              type="text"
              value={playerName}
              maxLength={12}
              onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
              className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black uppercase text-xs focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-white/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block">
              {isArabic ? 'رقم' : 'Number'}
            </label>
            <input
              type="text"
              value={number}
              maxLength={2}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-black font-mono text-xs focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
