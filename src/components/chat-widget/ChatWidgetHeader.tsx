'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Users, Headphones, X, GripHorizontal } from 'lucide-react';

interface ChatWidgetHeaderProps {
  activeTab: 'ai' | 'community' | 'support';
  setActiveTab: (tab: 'ai' | 'community' | 'support') => void;
  onClose: () => void;
  onStartResizing: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function ChatWidgetHeader({
  activeTab,
  setActiveTab,
  onClose,
  onStartResizing,
}: ChatWidgetHeaderProps) {
  const t = useTranslations('FloatingChat');

  return (
    <>
      {/* Top Resize Handle */}
      <div
        onMouseDown={onStartResizing}
        onTouchStart={onStartResizing}
        className="w-full h-6 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-ns-resize group select-none border-b border-white/10 shrink-0"
        title="Drag to resize height"
      >
        <GripHorizontal className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
      </div>

      {/* Header Navigation Tabs */}
      <div className="p-3 border-b border-white/10 bg-background/40 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 flex-1">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-primary text-black shadow-md glow-primary-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t('tabAi')}</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'community'
                ? 'bg-primary text-black shadow-md glow-primary-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('tabCommunity')}</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'support'
                ? 'bg-primary text-black shadow-md glow-primary-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>{t('tabSupport')}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
