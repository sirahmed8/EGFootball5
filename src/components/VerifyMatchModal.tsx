'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Booking } from '@/types';
import { db } from '@/lib/firebase/config';
import { doc, runTransaction, increment } from 'firebase/firestore';
import { ShieldCheck, Trophy, Target, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface VerifyMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Booking;
}

export function VerifyMatchModal({ isOpen, onClose, match }: VerifyMatchModalProps) {
  const t = useTranslations('Matches');
  const [teamAScore, setTeamAScore] = useState<number | ''>('');
  const [teamBScore, setTeamBScore] = useState<number | ''>('');
  const [mvpUid, setMvpUid] = useState<string>('');
  const [varHighlightId, setVarHighlightId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const joinedPlayers = match.joinedPlayers || [];

  const handleVerify = async () => {
    if (teamAScore === '' || teamBScore === '') {
      toast.error('Please enter the final score.');
      return;
    }
    
    setSubmitting(true);
    try {
      const matchRef = doc(db, 'bookings', match.id);

      await runTransaction(db, async (transaction) => {
        // 1. Mark match as verified and save results
        transaction.update(matchRef, {
          matchResult: {
            teamAScore: Number(teamAScore),
            teamBScore: Number(teamBScore),
            mvpUid: mvpUid || null,
            varHighlightId: varHighlightId || null,
            isVerified: true,
          }
        });

        // 2. Update stats for all joined players
        for (const player of joinedPlayers) {
          if (!player.uid) continue;
          const userRef = doc(db, 'users', player.uid);
          
          // Using increment ensures we don't need to read each user document first
          const updateData: any = {
            matchesPlayed: increment(1)
          };
          
          if (player.uid === mvpUid) {
            updateData.mvpBadges = increment(1);
            updateData.rating = increment(10); // +10 points for MVP
          } else {
            updateData.rating = increment(3); // +3 points for playing
          }
          
          transaction.update(userRef, updateData);
        }
      });

      toast.success('Match results verified and stats updated! 🏆');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify match.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 bg-[#0c1219] dark:bg-[#070b10] border border-border/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Verify Match Result</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs font-medium">
            Lock in the final score and select the MVP. This will permanently update the global leaderboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Input */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider block flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Final Score
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold">Team A</span>
                <Input 
                  type="number" 
                  min="0"
                  value={teamAScore} 
                  onChange={(e) => setTeamAScore(e.target.value === '' ? '' : parseInt(e.target.value))} 
                  className="text-center font-black text-xl h-12 bg-background/50 border-border" 
                  placeholder="0"
                />
              </div>
              <span className="font-black text-xl text-muted-foreground pt-4">-</span>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold">Team B</span>
                <Input 
                  type="number" 
                  min="0"
                  value={teamBScore} 
                  onChange={(e) => setTeamBScore(e.target.value === '' ? '' : parseInt(e.target.value))} 
                  className="text-center font-black text-xl h-12 bg-background/50 border-border" 
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* MVP Selection */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider block flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Match MVP
            </label>
            <select
              value={mvpUid}
              onChange={(e) => setMvpUid(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-background/50 border border-border text-sm font-bold text-foreground outline-none focus:border-primary/50"
            >
              <option value="">Select MVP (Optional)</option>
              {joinedPlayers.map((p) => (
                <option key={p.uid} value={p.uid}>
                  {p.name} {(p as any).position ? `(${(p as any).position})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* VAR Highlight Link */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider block flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Link VAR Highlight ID (Optional)
            </label>
            <Input 
              type="text" 
              value={varHighlightId} 
              onChange={(e) => setVarHighlightId(e.target.value)} 
              className="font-mono text-xs h-12 bg-background/50 border-border" 
              placeholder="e.g. 8fA9d2k..."
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={submitting}
            className="w-full bg-primary text-black font-black hover:bg-primary/90 rounded-2xl h-12 text-base shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer"
          >
            {submitting ? 'Verifying...' : 'Verify & Update Leaderboard'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
