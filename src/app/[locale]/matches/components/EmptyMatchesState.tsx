'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Trophy, Plus } from 'lucide-react';

interface EmptyMatchesStateProps {
  filter: 'all' | 'joined' | 'open';
  isArabic: boolean;
  onHostClick?: () => void;
}

export function EmptyMatchesState({
  filter,
  isArabic,
  onHostClick,
}: EmptyMatchesStateProps) {
  const t = useTranslations('Matches');

  const getMessage = () => {
    if (filter === 'joined') {
      return {
        title: isArabic ? 'لم تنضم إلى أي مباراة بعد' : "You Haven't Joined Any Matches Yet",
        desc: isArabic
          ? 'استعرض المباريات المفتوحة وانضم لتحدي جديد أو نظّم مباراتك الخاصة الآن.'
          : 'Browse open public matches and join the pitch, or host your own match.',
      };
    }
    if (filter === 'open') {
      return {
        title: isArabic ? 'لا توجد مباريات بمقاعد شاغرة حالياً' : 'No Open Matches With Available Slots',
        desc: isArabic
          ? 'جميع المباريات الحالية مكتملة العدد. بادر بتنظيم مباراة جديدة ودعوة زملائك.'
          : 'All current matches are full. Start your own public match and invite players!',
      };
    }
    return {
      title: isArabic ? 'لا توجد مباريات معلنة حالياً' : 'No Open Matches Right Now',
      desc: isArabic
        ? 'كن أول من ينظم مباراة عامة ويدعو اللاعبين في منطقتك للمشاركة والتحدي!'
        : 'Be the first to host a public match and invite local players to join!',
    };
  };

  const message = getMessage();

  return (
    <div className="text-center py-16 px-4 space-y-5 rounded-3xl bg-card/30 border border-border/40 backdrop-blur-xl max-w-2xl mx-auto my-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-primary shadow-[0_0_30px_rgba(57,255,20,0.15)]">
        <Trophy className="w-8 h-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          {message.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto font-medium leading-relaxed">
          {message.desc}
        </p>
      </div>

      {onHostClick && (
        <div className="pt-2">
          <Button
            onClick={onHostClick}
            className="bg-primary text-black font-black hover:bg-primary/90 rounded-2xl h-11 px-6 shadow-[0_0_20px_rgba(57,255,20,0.25)] transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 me-1.5" />
            <span>{t('hostMatchBtn')}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
