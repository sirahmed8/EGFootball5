'use client';

import * as React from 'react';
import { User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User as AppUser } from '@/types';

interface UserMobileCardProps {
  user: AppUser;
  hasFailedImg: boolean;
  onImageError: (uid: string) => void;
  onToggleVip: (user: AppUser) => Promise<void>;
  onUpdateRole: (userId: string, role: AppUser['role']) => Promise<void>;
  onToggleBlacklist: (userId: string, isBlacklisted: boolean) => Promise<void>;
  t: (key: any) => string;
  isVipPending: boolean;
  isRolePending: boolean;
  isBlacklistPending: boolean;
}

export function UserMobileCard({
  user,
  hasFailedImg,
  onImageError,
  onToggleVip,
  onUpdateRole,
  onToggleBlacklist,
  t,
  isVipPending,
  isRolePending,
  isBlacklistPending,
}: UserMobileCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {user.photoURL && !hasFailedImg ? (
            <img
              src={user.photoURL}
              alt={user.name || 'User'}
              className="w-10 h-10 rounded-full border border-primary/30 object-cover shrink-0"
              referrerPolicy="no-referrer"
              onError={() => onImageError(user.uid)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/30 font-bold text-sm shrink-0">
              {user.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
          )}
          <div>
            <div className="font-bold text-foreground text-sm flex items-center gap-1">
              <span>{user.name}</span>
              {user.isVip && <span className="text-amber-400 text-xs">👑</span>}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {user.email || user.phone || '-'}
            </div>
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            user.role === 'owner'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : user.role === 'admin'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {user.role}
        </span>
      </div>

      {user.role !== 'owner' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          {/* VIP Toggle - Mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleVip(user)}
            disabled={isVipPending}
            className={`flex-1 h-8 text-xs font-bold rounded-xl border cursor-pointer ${
              user.isVip
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                : 'border-white/20 text-muted-foreground hover:bg-white/10'
            }`}
          >
            <Crown className="w-3.5 h-3.5 me-1 text-amber-400" />
            {user.isVip ? 'VIP ✓' : '👑 Give VIP'}
          </Button>

          {user.role === 'admin' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateRole(user.uid, 'player')}
              disabled={isRolePending}
              className="flex-1 h-8 text-xs rounded-xl"
            >
              {t('makePlayer')}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateRole(user.uid, 'admin')}
              disabled={isRolePending}
              className="flex-1 h-8 text-xs rounded-xl border-primary/40 text-primary"
            >
              {t('makeAdmin')}
            </Button>
          )}
          <Button
            variant={user.isBlacklisted ? 'default' : 'destructive'}
            size="sm"
            onClick={() => onToggleBlacklist(user.uid, !user.isBlacklisted)}
            disabled={isBlacklistPending}
            className="flex-1 h-8 text-xs rounded-xl"
          >
            {user.isBlacklisted ? t('unblacklist') : t('blacklist')}
          </Button>
        </div>
      )}
    </div>
  );
}
