'use client';

import React from 'react';
import Image from 'next/image';
import { Send, Smile, ImageIcon, X, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CommunityMessage, EMOJI_LIST } from './types';

interface CommunityInputBarProps {
  replyingTo: CommunityMessage | null;
  setReplyingTo: (msg: CommunityMessage | null) => void;
  communityImage: string | null;
  setCommunityImage: (img: string | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  communityInput: string;
  setCommunityInput: React.Dispatch<React.SetStateAction<string>>;
  handleCommunityImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sendCommunityMessage: () => void;
  cooldownLeft: number;
}

export function CommunityInputBar({
  replyingTo,
  setReplyingTo,
  communityImage,
  setCommunityImage,
  showEmojiPicker,
  setShowEmojiPicker,
  communityInput,
  setCommunityInput,
  handleCommunityImage,
  sendCommunityMessage,
  cooldownLeft,
}: CommunityInputBarProps) {
  const t = useTranslations('FloatingChat');

  return (
    <div className="pt-2 border-t border-border/40 space-y-2 shrink-0">
      {replyingTo && (
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
          <span>
            {t('replyingTo')} <strong>@{replyingTo.userName}</strong>
          </span>
          <button onClick={() => setReplyingTo(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {communityImage && (
        <div className="relative inline-block">
          <Image
            src={communityImage}
            alt="Thumbnail preview"
            width={56}
            height={56}
            unoptimized
            className="w-14 h-14 object-cover rounded-xl border border-emerald-500/50"
          />
          <button
            onClick={() => setCommunityImage(null)}
            className="absolute -top-1.5 -end-1.5 p-0.5 rounded-full bg-destructive text-white text-xs cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="p-2 rounded-2xl bg-card border border-border flex flex-wrap gap-1 mb-1">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setCommunityInput((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="p-1.5 hover:bg-muted rounded-lg text-base cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 bg-muted/70 border border-border/80 p-1.5 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer shrink-0"
        >
          <Smile className="w-4 h-4" />
        </button>

        <label className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer shrink-0">
          <ImageIcon className="w-4 h-4" />
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handleCommunityImage}
          />
        </label>

        <input
          type="text"
          value={communityInput}
          onChange={(e) => setCommunityInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendCommunityMessage()}
          placeholder={t('shareCommunityPlaceholder')}
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs text-foreground placeholder:text-muted-foreground/60 px-1 py-1"
        />

        <button
          onClick={sendCommunityMessage}
          disabled={cooldownLeft > 0 || (!communityInput.trim() && !communityImage)}
          className="p-2.5 rounded-full bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-all flex items-center justify-center min-w-[36px] cursor-pointer shrink-0 shadow-md hover:scale-105 active:scale-95"
        >
          {cooldownLeft > 0 ? (
            <span className="text-xs font-mono font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {cooldownLeft}
            </span>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
