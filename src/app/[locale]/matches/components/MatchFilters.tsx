'use client';

import { useTranslations } from 'next-intl';
import { Target } from 'lucide-react';

interface MatchFiltersProps {
  selectedPosition: 'GK' | 'DEF' | 'MID' | 'STR';
  setSelectedPosition: (pos: 'GK' | 'DEF' | 'MID' | 'STR') => void;
  filter: 'all' | 'joined' | 'open';
  setFilter: (f: 'all' | 'joined' | 'open') => void;
}

export function MatchFilters({
  selectedPosition,
  setSelectedPosition,
  filter,
  setFilter,
}: MatchFiltersProps) {
  const t = useTranslations('Matches');
  const tPositions = useTranslations('Positions');

  return (
    <div className="space-y-4">
      {/* Position Selector Bar */}
      <div className="p-4 rounded-3xl bg-card/70 border border-border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
        <span className="font-extrabold text-foreground flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>{tPositions('title')}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'GK', label: tPositions('gk') },
            { id: 'DEF', label: tPositions('def') },
            { id: 'MID', label: tPositions('mid') },
            { id: 'STR', label: tPositions('str') },
          ].map((pos) => (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id as 'GK' | 'DEF' | 'MID' | 'STR')}
              className={`px-3.5 py-2 rounded-2xl font-black border transition-all cursor-pointer ${
                selectedPosition === pos.id
                  ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                  : 'bg-background/40 border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-4 w-full overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: t('allMatchesTab') },
          { id: 'open', label: t('openMatchesTab') },
          { id: 'joined', label: t('joinedMatchesTab') },
        ].map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'all' | 'joined' | 'open')}
              className={`px-5 py-2.5 text-xs font-black rounded-full border transition-all duration-300 hover:scale-[1.03] active:scale-95 whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-primary text-black border-transparent shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
