'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { SeasonData } from '../types';

interface CeremonyTotsPitchProps {
  seasonData: SeasonData;
  isArabic: boolean;
}

export function CeremonyTotsPitch({ seasonData, isArabic }: CeremonyTotsPitchProps) {
  const totsPlayers = [
    {
      position: isArabic ? 'حارس' : 'GK',
      top: '85%',
      left: '50%',
      name: seasonData.totsGk || (isArabic ? 'حارس المرمى' : 'Top GK'),
    },
    {
      position: isArabic ? 'مدافع' : 'DEF',
      top: '65%',
      left: '25%',
      name: seasonData.totsDef1 || (isArabic ? 'مدافع 1' : 'Top DEF 1'),
    },
    {
      position: isArabic ? 'مدافع' : 'DEF',
      top: '65%',
      left: '75%',
      name: seasonData.totsDef2 || (isArabic ? 'مدافع 2' : 'Top DEF 2'),
    },
    {
      position: isArabic ? 'وسط' : 'MID',
      top: '45%',
      left: '50%',
      name: seasonData.totsMid || (isArabic ? 'خط وسط' : 'Top MID'),
    },
    {
      position: isArabic ? 'مهاجم' : 'STR',
      top: '25%',
      left: '50%',
      name: seasonData.totsStr || (isArabic ? 'مهاجم' : 'Top STR'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl p-6 bg-black border border-white/10 global-box relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-emerald-400" />
        <h3 className="text-xl font-black text-foreground">
          {isArabic ? 'تشكيلة الموسم المثالية (خماسي)' : 'Team of the Season (5-a-side)'}
        </h3>
      </div>

      <div className="relative w-full aspect-[3/4] bg-emerald-950/40 rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-inner">
        {/* Pitch Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-500/30" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full border-2 border-emerald-500/30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 left-1/2 w-32 h-24 border-2 border-t-0 border-emerald-500/30 -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-24 border-2 border-b-0 border-emerald-500/30 -translate-x-1/2" />

        {/* Players */}
        {totsPlayers.map((player, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
            className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ top: player.top, left: player.left }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-white shadow-lg flex items-center justify-center font-black text-black group-hover:scale-110 transition-transform text-xs">
              {player.position}
            </div>
            <div className="mt-2 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-xs font-bold whitespace-nowrap border border-white/10">
              {player.name}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
