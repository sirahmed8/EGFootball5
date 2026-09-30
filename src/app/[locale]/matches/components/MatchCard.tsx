'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Booking, Pitch } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  MessageCircle,
  Share2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MatchChat = dynamic(() => import('@/components/MatchChat'), { ssr: false });

interface MatchCardProps {
  match: Booking;
  pitch?: Pitch;
  firebaseUser: any;
  selectedPosition: 'GK' | 'DEF' | 'MID' | 'STR';
  loadingAction: string | null;
  onJoinMatch: (match: Booking) => void;
  onLeaveMatch: (match: Booking) => void;
  onShareMatch: (match: Booking) => void;
  onOpenGkModal: (pitchName: string, timeSlot: string) => void;
  formatTimeSlot: (hour: number) => string;
  isArabic: boolean;
}

export function MatchCard({
  match,
  pitch,
  firebaseUser,
  selectedPosition,
  loadingAction,
  onJoinMatch,
  onLeaveMatch,
  onShareMatch,
  onOpenGkModal,
  formatTimeSlot,
  isArabic,
}: MatchCardProps) {
  const t = useTranslations('Matches');

  const currentPlayers = match.joinedPlayers?.length || 1;
  const spotsRemaining = match.numPeople - currentPlayers;
  const isUserJoined = Boolean(
    firebaseUser && match.joinedPlayers?.some((p) => p.uid === firebaseUser.uid)
  );
  const isFull = currentPlayers >= match.numPeople;

  return (
    <Card className="stadium-glass border-white/10 card-lift transition-all duration-300 backdrop-blur-xl flex flex-col justify-between overflow-hidden rounded-3xl shadow-xl h-full">
      <div>
        <div className="h-48 w-full relative bg-slate-900 flex items-center justify-center overflow-hidden border-b border-white/10">
          <Image
            src={pitch?.imagePreviewUrl || '/stadium_hero_bg.jpg'}
            alt={pitch?.name || 'Pitch'}
            fill
            unoptimized
            className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/40" />

          <span className="absolute top-3 end-3 px-3.5 py-1 rounded-full text-xs font-black bg-primary text-black shadow-md">
            {t('spotsSummary', { joined: currentPlayers, total: match.numPeople })}
          </span>

          {spotsRemaining > 0 && (
            <span className="absolute top-3 start-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-xs">
              🔥 {spotsRemaining} {t('spotsLeft')}
            </span>
          )}
        </div>

        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-black text-lg text-foreground line-clamp-1">
              {pitch?.name || 'Obour Champions Stadium'}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{pitch?.locationName || 'Obour City'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-2xl border border-border/40 font-bold">
            <div className="flex items-center gap-1.5 text-foreground">
              <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{match.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-foreground">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{formatTimeSlot(match.timeSlot)} ({match.duration}h)</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>{t('joinedPlayersTitle')}</span>
              <span className="font-mono text-primary">{currentPlayers}/{match.numPeople} Players</span>
            </div>
            {(() => {
              const pct = Math.min((currentPlayers / match.numPeople) * 100, 100);
              const barColor =
                pct > 80
                  ? 'bg-rose-500'
                  : pct >= 50
                  ? 'bg-amber-400'
                  : 'bg-emerald-500';
              return (
                <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Joined Players Badges List */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pe-1">
              {match.joinedPlayers?.map((player, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    player.uid === firebaseUser?.uid
                  ? 'bg-primary text-black border-primary font-black'
                  : 'bg-muted/80 text-foreground border-border/60'
                  }`}
                >
                  ⚽ {player.name}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </div>

      <div className="p-5 pt-0 space-y-2">
        <div className="flex items-center gap-2">
          {isUserJoined ? (
            <Button
              onClick={() => onLeaveMatch(match)}
              disabled={loadingAction === match.id}
              variant="destructive"
              className="flex-1 font-extrabold rounded-2xl text-xs py-5 cursor-pointer"
            >
              {loadingAction === match.id ? t('processing') : t('leaveMatchBtn')}
            </Button>
          ) : (
            <Button
              onClick={() => onJoinMatch(match)}
              disabled={loadingAction === match.id || isFull}
              className={`flex-1 font-black rounded-2xl text-xs py-5 transition-all cursor-pointer ${
                isFull
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-black hover:bg-primary/90 shadow-md shadow-primary/20'
              }`}
            >
              {loadingAction === match.id
                ? t('processing')
                : isFull
                ? t('matchFull')
                : t('joinMatchBtn', { position: selectedPosition })}
            </Button>
          )}

          <Button
            onClick={() => onShareMatch(match)}
            variant="outline"
            size="icon"
            className="rounded-2xl border-border text-foreground hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 p-2.5 shrink-0 cursor-pointer"
            title={isArabic ? 'نسخ رابط المباراة' : 'Copy match link'}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Realtime Match Chat Dialog & Emergency GK Call triggers */}
        <div className="flex gap-2 pt-1">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  className="flex-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('openMatchChat')}</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg p-0 bg-card/95 border-border backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle className="text-lg font-black text-foreground">
                  💬 {t('matchChatTitle', { pitchName: pitch?.name || 'Obour Match' })}
                </DialogTitle>
              </DialogHeader>
              <div className="p-4 pt-2">
                <MatchChat matchId={match.id} />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() =>
              onOpenGkModal(pitch?.name || 'Stadium', formatTimeSlot(match.timeSlot))
            }
            variant="ghost"
            className="text-xs font-black text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl py-2 px-3 flex items-center justify-center gap-1 cursor-pointer"
            title={isArabic ? 'استدعاء حارس مرمى طارئ' : 'Emergency GK Call'}
          >
            🧤 {isArabic ? 'حارس طارئ' : 'Need GK'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
