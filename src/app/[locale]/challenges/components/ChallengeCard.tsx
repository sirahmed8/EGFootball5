'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, X, Swords, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface Challenge {
  id: string;
  challengerSquad: string;
  squadLogo: string;
  pitchName: string;
  city: string;
  date: string;
  time: string;
  wagerTerms: string;
  accepted: boolean;
  postedBy?: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId?: string;
  isArabic: boolean;
  acceptingId: string | null;
  onAccept: (id: string, squad: string) => void;
  onWithdrawClick: (challenge: Challenge) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge: c,
  currentUserId,
  isArabic,
  acceptingId,
  onAccept,
  onWithdrawClick,
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 w-full">
      <Card className="border-border rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 bg-card w-full min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 min-w-0 w-full">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
              {c.squadLogo}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-base sm:text-lg text-foreground truncate">{c.challengerSquad}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{c.city} • {c.pitchName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {c.postedBy === currentUserId && !c.accepted && (
              <button
                onClick={() => onWithdrawClick(c)}
                className="p-1 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer shrink-0"
                title={isArabic ? 'سحب التحدي' : 'Withdraw Challenge'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase shrink-0 self-start sm:self-auto">
              {isArabic ? 'مباراة 5v5' : '5v5 Challenge'}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-muted/50 border border-border space-y-1">
          <div className="text-xs font-bold text-muted-foreground">{isArabic ? 'شروط ورهان المباراة' : 'Match Terms & Stakes'}</div>
          <div className="text-xs sm:text-sm font-black text-amber-400 break-words">{c.wagerTerms}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1 flex-wrap">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" /> <span>{c.date} - {c.time}</span>
          </div>
        </div>

        <Button
          onClick={() => onAccept(c.id, c.challengerSquad)}
          disabled={c.accepted || acceptingId === c.id}
          className={`w-full py-3 sm:py-3.5 rounded-2xl font-black transition-all cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm ${
            c.accepted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-primary text-black hover:bg-primary/90 glow-primary-sm'
          }`}
        >
          {c.accepted ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Swords className="w-4 h-4 shrink-0" />}
          {c.accepted
            ? (isArabic ? 'تم تأكيد المباراة وموعد الملعب!' : 'Match Locked & Confirmed!')
            : acceptingId === c.id
            ? (isArabic ? 'جاري القبول...' : 'Accepting...')
            : (isArabic ? 'قبول التحدي ⚔️' : 'Accept Challenge ⚔️')}
        </Button>
      </Card>
    </motion.div>
  );
};
