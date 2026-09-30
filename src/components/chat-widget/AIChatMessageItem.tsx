'use client';

import React from 'react';
import Image from 'next/image';
import { Volume2, Sparkles } from 'lucide-react';
import { FormattedMarkdownText } from '@/components/FormattedMarkdownText';
import { AIMessage } from './types';

interface AIChatMessageItemProps {
  message: AIMessage;
  isArabic: boolean;
  onPlayTTS: (text: string) => void;
  onChipClick: (chip: string) => void;
}

export function AIChatMessageItem({
  message,
  isArabic,
  onPlayTTS,
  onChipClick,
}: AIChatMessageItemProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`p-3.5 rounded-2xl text-xs max-w-[88%] space-y-2 ${
          isUser
            ? 'bg-primary text-black font-medium shadow-md glow-primary-sm'
            : 'bg-muted/80 border border-border/60 text-foreground'
        }`}
      >
        {message.image && (
          <Image
            src={message.image}
            alt="Uploaded query preview"
            width={240}
            height={160}
            unoptimized
            className="w-full max-h-40 object-cover rounded-xl border border-black/20"
          />
        )}

        <div className="leading-relaxed">
          <FormattedMarkdownText content={message.text} />
        </div>

        {!isUser && (
          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/30">
            <button
              onClick={() => onPlayTTS(message.text)}
              className="text-muted-foreground hover:text-emerald-400 p-1 rounded-lg transition-colors cursor-pointer"
              title={isArabic ? 'استماع للرد صوتياً' : 'Listen to audio response'}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {message.chips && message.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
          {message.chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onChipClick(chip)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-emerald-400 border border-primary/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
