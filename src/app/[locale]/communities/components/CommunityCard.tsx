'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { MapPin, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Community } from './types';

interface CommunityCardProps {
  comm: Community;
  onJoin: (comm: Community) => void;
  isJoining: boolean;
}

export function CommunityCard({ comm, onJoin, isJoining }: CommunityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-w-0 w-full"
    >
      <Card className="stadium-glass border-white/10 hover:border-primary/40 transition-all rounded-3xl overflow-hidden card-lift h-full flex flex-col justify-between p-4 sm:p-6 w-full min-w-0">
        <CardContent className="p-0 space-y-4 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 min-w-0 w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
                {comm.logoEmoji}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-foreground truncate">{comm.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{comm.city}</span>
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-primary shrink-0 self-start sm:self-auto">
              {comm.category}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 break-words">
            {comm.description}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2 border-y border-white/10 text-center">
            <div>
              <div className="text-sm sm:text-base font-black text-foreground">{comm.membersCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Members</div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-emerald-400">{comm.matchesPlayed}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold">Matches Played</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 gap-2 flex-wrap">
            <span className="truncate">
              Captain: <strong className="text-foreground">{comm.captainName}</strong>
            </span>
          </div>
        </CardContent>

        <Button
          onClick={() => onJoin(comm)}
          disabled={isJoining}
          className="w-full mt-4 bg-primary/20 hover:bg-primary text-primary hover:text-black font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-primary/30 disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm py-2.5"
        >
          {isJoining ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Joining...
            </span>
          ) : (
            <>
              <UserPlus className="w-4 h-4 shrink-0" /> Request to Join
            </>
          )}
        </Button>
      </Card>
    </motion.div>
  );
}
