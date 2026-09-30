'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SupportTicket } from './types';

interface AdminTicketListProps {
  supportFilter: 'all' | 'unread';
  setSupportFilter: (f: 'all' | 'unread') => void;
  supportSearch: string;
  setSupportSearch: (s: string) => void;
  filteredTickets: SupportTicket[];
  onSelectTicket: (id: string) => void;
}

export function AdminTicketList({
  supportFilter,
  setSupportFilter,
  supportSearch,
  setSupportSearch,
  filteredTickets,
  onSelectTicket,
}: AdminTicketListProps) {
  const t = useTranslations('FloatingChat');

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40">
          {(['all', 'unread'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSupportFilter(filter)}
              className={`relative px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                supportFilter === filter ? 'text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {supportFilter === filter && (
                <motion.div
                  layoutId="supportFilterPill"
                  className="absolute inset-0 bg-emerald-500 rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {filter === 'all' ? t('all') : t('unread')}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-[170px] group transition-all duration-300 rounded-full border border-border/60 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/30 focus-within:shadow-[0_0_15px_rgba(57,255,20,0.25)] bg-muted/40 overflow-hidden">
          <Filter className="w-3.5 h-3.5 absolute start-2.5 top-2 text-emerald-400 group-focus-within:rotate-180 transition-transform duration-300" />
          <input
            type="text"
            value={supportSearch}
            onChange={(e) => setSupportSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            className="w-full bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs ps-8 pe-2 py-1 text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredTickets.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">{t('noTicketsFound')}</p>
        ) : (
          filteredTickets.map((tix) => (
            <button
              key={tix.id}
              onClick={() => onSelectTicket(tix.id)}
              className="w-full text-start p-3 rounded-2xl bg-muted/50 hover:bg-muted border border-border/50 transition-all space-y-1 block cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>{tix.userName}</span>
                {tix.unreadByStaff && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-black">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{tix.lastMessage}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
