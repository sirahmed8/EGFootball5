'use client';

import React from 'react';
import Image from 'next/image';
import { Camera, Mic, MicOff, Send, X } from 'lucide-react';

interface AIChatInputBarProps {
  aiInput: string;
  setAiInput: (val: string) => void;
  attachedImage: string | null;
  setAttachedImage: (img: string | null) => void;
  isListening: boolean;
  toggleVoiceRecognition: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sendAIMessage: () => void;
  aiLoading: boolean;
  isArabic: boolean;
}

export function AIChatInputBar({
  aiInput,
  setAiInput,
  attachedImage,
  setAttachedImage,
  isListening,
  toggleVoiceRecognition,
  handleImageUpload,
  sendAIMessage,
  aiLoading,
  isArabic,
}: AIChatInputBarProps) {
  return (
    <div className="pt-2 border-t border-border/40 space-y-2 shrink-0">
      {attachedImage && (
        <div className="relative inline-block">
          <Image
            src={attachedImage}
            alt="Thumbnail preview"
            width={56}
            height={56}
            unoptimized
            className="w-14 h-14 object-cover rounded-xl border border-emerald-500/50"
          />
          <button
            onClick={() => setAttachedImage(null)}
            className="absolute -top-1.5 -end-1.5 p-0.5 rounded-full bg-destructive text-white text-xs cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 bg-muted/70 border border-border/80 p-1.5 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
        <label className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-400 cursor-pointer transition-colors shrink-0">
          <Camera className="w-4 h-4" />
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        <button
          type="button"
          onClick={toggleVoiceRecognition}
          className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
            isListening
              ? 'bg-destructive/20 text-destructive animate-pulse'
              : 'hover:bg-muted text-muted-foreground hover:text-emerald-400'
          }`}
          title="Voice recognition"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
          placeholder={isArabic ? 'اكتب سؤالك أو استفسارك هنا...' : 'Type your message or question...'}
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs text-foreground placeholder:text-muted-foreground/60 px-1 py-1"
        />

        <button
          onClick={sendAIMessage}
          disabled={aiLoading || (!aiInput.trim() && !attachedImage)}
          className="p-2.5 rounded-full bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-all cursor-pointer shrink-0 shadow-md hover:scale-105 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
