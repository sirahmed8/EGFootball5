'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2, Reply } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CommunityMessage, EMOJI_LIST } from './types';

interface CommunityMessageItemProps {
  msg: CommunityMessage;
  firebaseUser: any;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onToggleReaction: (id: string, emoji: string) => void;
  onReply: (msg: CommunityMessage) => void;
}

export function CommunityMessageItem({
  msg,
  firebaseUser,
  isAdmin,
  onDelete,
  onToggleReaction,
  onReply,
}: CommunityMessageItemProps) {
  const t = useTranslations('FloatingChat');

  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  return (
    <div className="p-3 rounded-2xl bg-muted/60 border border-border/50 space-y-2 relative group">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-foreground">{msg.userName}</span>
          {msg.userRole === 'admin' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Staff
            </span>
          )}
        </div>
        {(msg.userId === firebaseUser?.uid || isAdmin) && (
          <div>
            {confirmDelete ? (
              <span className="inline-flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => onDelete(msg.id)}
                  className="px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground font-black hover:bg-destructive/90 transition-all cursor-pointer"
                >
                  Delete?
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-1.5 py-0.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {msg.replyTo && (
        <div className="p-2 rounded-xl bg-background/50 border-l-2 border-emerald-500 text-xs text-muted-foreground">
          <span className="font-bold text-emerald-400">@{msg.replyTo.userName}: </span>
          <span className="truncate">{msg.replyTo.text}</span>
        </div>
      )}

      {msg.imageUrl && (
        <Image
          src={msg.imageUrl}
          alt="Community attachment"
          width={300}
          height={200}
          unoptimized
          className="w-full max-h-48 object-cover rounded-xl border border-black/20"
        />
      )}

      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{msg.text}</p>

      <div className="pt-2 border-t border-border/30 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {EMOJI_LIST.map((emoji) => {
            const count = msg.reactions?.[emoji]?.length || 0;
            const hasReacted =
              firebaseUser && msg.reactions?.[emoji]?.includes(firebaseUser.uid);
            return (
              <button
                key={emoji}
                onClick={() => onToggleReaction(msg.id, emoji)}
                className={`text-[11px] px-1.5 py-0.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                  hasReacted
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && <span className="font-bold">{count}</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onReply(msg)}
          className="text-muted-foreground hover:text-emerald-400 flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <Reply className="w-3 h-3" />
          <span>{t('reply')}</span>
        </button>
      </div>
    </div>
  );
}
