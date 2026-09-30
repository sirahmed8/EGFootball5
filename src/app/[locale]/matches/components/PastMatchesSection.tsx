'use client';

import { Booking, Pitch, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ShieldCheck, Trophy } from 'lucide-react';

interface PastMatchesSectionProps {
  pastMatches: Booking[];
  pitchesCache: Record<string, Pitch>;
  appUser: User | null;
  isArabic: boolean;
  onVerifyResult: (match: Booking) => void;
}

export function PastMatchesSection({
  pastMatches,
  pitchesCache,
  appUser,
  isArabic,
  onVerifyResult,
}: PastMatchesSectionProps) {
  if (pastMatches.length === 0) return null;

  const isOwnerOrAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';

  return (
    <details className="group rounded-2xl border border-border/40 bg-card/40 overflow-hidden mt-8">
      <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none list-none">
        <span className="text-sm font-extrabold text-muted-foreground">
          🕐 {isArabic ? 'مباريات سابقة' : 'Past Matches'}
        </span>
        <span className="text-xs font-black px-3 py-1 rounded-full bg-muted text-muted-foreground">
          {pastMatches.length} {isArabic ? 'مباراة' : 'matches'}
        </span>
      </summary>
      <div className="p-5 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pastMatches.map((match) => {
          const pitch = pitchesCache[match.pitchId];
          const isVerified = match.matchResult?.isVerified;

          return (
            <div
              key={match.id}
              className="bg-background/60 border border-border/40 rounded-2xl p-4 space-y-3 shadow-inner"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-sm text-foreground">{pitch?.name || 'Pitch'}</h4>
                  <div className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 mt-1">
                    <CalendarIcon className="w-3 h-3" /> {match.date}
                  </div>
                </div>
                {isVerified ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                    Unverified
                  </span>
                )}
              </div>

              {isVerified && match.matchResult ? (
                <div className="bg-muted/40 p-3 rounded-xl border border-border/40 space-y-2">
                  <div className="flex justify-between items-center font-black text-lg">
                    <span>
                      Team A <span className="text-primary">{match.matchResult.teamAScore}</span>
                    </span>
                    <span className="text-muted-foreground text-sm">-</span>
                    <span>
                      <span className="text-primary">{match.matchResult.teamBScore}</span> Team B
                    </span>
                  </div>
                  {match.matchResult.mvpUid && (
                    <div className="text-[11px] text-amber-400 flex items-center gap-1 font-bold">
                      <Trophy className="w-3 h-3" /> MVP Selected
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic font-medium">
                  {isArabic ? 'في انتظار توثيق النتيجة...' : 'Awaiting score verification...'}
                </div>
              )}

              {!isVerified && isOwnerOrAdmin && (
                <Button
                  onClick={() => onVerifyResult(match)}
                  variant="outline"
                  className="w-full h-8 text-xs font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                >
                  {isArabic ? 'توثيق النتيجة' : 'Verify Result'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}
