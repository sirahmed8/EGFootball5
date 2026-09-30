'use client';

import React from 'react';
import { Send, Headphones } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SupportMessage } from './types';

interface SupportThreadViewProps {
  isAdmin: boolean;
  supportMessages: SupportMessage[];
  supportInput: string;
  setSupportInput: React.Dispatch<React.SetStateAction<string>>;
  sendSupportMessage: () => void;
  onBackToInbox?: () => void;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
}

export function SupportThreadView({
  isAdmin,
  supportMessages,
  supportInput,
  setSupportInput,
  sendSupportMessage,
  onBackToInbox,
  chatBottomRef,
}: SupportThreadViewProps) {
  const t = useTranslations('FloatingChat');

  return (
    <div className="flex flex-col h-full justify-between">
      {isAdmin && onBackToInbox && (
        <button
          onClick={onBackToInbox}
          className="text-xs text-emerald-400 flex items-center gap-1 font-bold mb-2 cursor-pointer"
        >
          ← {t('backToInbox')}
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pe-1">
        {supportMessages.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-8">
            <Headphones className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
            <p>{t('howCanStaffHelp')}</p>
          </div>
        ) : (
          supportMessages.map((msg) => {
            const isOutgoing = isAdmin ? msg.senderRole === 'staff' : msg.senderRole === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                    isOutgoing
                      ? 'bg-emerald-500 text-black font-medium'
                      : 'bg-muted border border-border text-foreground'
                  }`}
                >
                  {!isOutgoing && (
                    <p className="font-bold text-[10px] opacity-75 mb-0.5">{msg.senderName}</p>
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      <div className="flex items-center gap-2 bg-muted/70 border border-border/80 p-1.5 rounded-full focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner mt-2 shrink-0">
        <input
          type="text"
          value={supportInput}
          onChange={(e) => setSupportInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendSupportMessage()}
          placeholder={isAdmin ? t('replyToUserPlaceholder') : t('typeMessageToStaff')}
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs text-foreground placeholder:text-muted-foreground/60 px-2 py-1"
        />
        <button
          onClick={sendSupportMessage}
          disabled={!supportInput.trim()}
          className="p-2.5 rounded-full bg-emerald-500 text-black disabled:opacity-40 hover:bg-emerald-400 transition-all cursor-pointer shrink-0 shadow-md hover:scale-105"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
