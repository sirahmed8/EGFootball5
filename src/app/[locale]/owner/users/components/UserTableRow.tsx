import React from 'react';
import { User as AppUser } from '@/types';
import { User, Shield, ShieldAlert, Ban, CheckCircle, Mail, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserTableRowProps {
  user: AppUser;
  hasFailedImg: boolean;
  onImageError: (uid: string) => void;
  onToggleVip: (user: AppUser) => void;
  onUpdateRole: (userId: string, newRole: AppUser['role']) => void;
  onToggleBlacklist: (userId: string, isBlacklisted: boolean) => void;
  onDeleteClick: (user: { id: string; name: string }) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  isVipPending: boolean;
  isRolePending: boolean;
  isBlacklistPending: boolean;
  isDeletePending: boolean;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  hasFailedImg,
  onImageError,
  onToggleVip,
  onUpdateRole,
  onToggleBlacklist,
  onDeleteClick,
  t,
  isVipPending,
  isRolePending,
  isBlacklistPending,
  isDeletePending,
}) => {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-3 py-3 flex items-center gap-2.5">
        {user.photoURL && !hasFailedImg ? (
          <img
            src={user.photoURL}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full border border-primary/30 object-cover shrink-0"
            referrerPolicy="no-referrer"
            onError={() => onImageError(user.uid)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-primary" />}
          </div>
        )}
        <div>
          <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <span>{user.name}</span>
            {user.isVip && <span className="text-amber-400 text-xs">👑</span>}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">{user.phone || '-'}</div>
        </div>
      </td>
      <td className="px-3 py-3 text-muted-foreground">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate max-w-[180px]">{user.email || '-'}</span>
        </div>
      </td>
      <td className="px-3 py-3">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            user.role === 'owner'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : user.role === 'admin'
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {user.role === 'owner' ? t('owner') : user.role === 'admin' ? t('admin') : t('player')}
        </span>
      </td>
      <td className="px-3 py-3">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
            user.isBlacklisted ? 'bg-destructive/20 text-destructive' : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {user.isBlacklisted ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
          {user.isBlacklisted ? t('blacklisted') : t('active')}
        </span>
      </td>
      <td className="px-3 py-3 text-end">
        <div className="flex items-center justify-end gap-1.5">
          {user.role !== 'owner' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleVip(user)}
                disabled={isVipPending}
                className={`h-8 px-2.5 text-xs font-bold rounded-xl border cursor-pointer ${
                  user.isVip
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    : 'border-white/20 text-muted-foreground hover:bg-white/10'
                }`}
                title={user.isVip ? 'Revoke VIP Status' : 'Grant Free VIP Pass'}
              >
                <Crown className="w-3.5 h-3.5 me-1 text-amber-400" />
                {user.isVip ? 'VIP Active' : 'Give VIP 👑'}
              </Button>

              {user.role === 'admin' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateRole(user.uid, 'player')}
                  disabled={isRolePending}
                  className="h-8 px-2.5 text-xs rounded-xl border-border text-foreground hover:bg-white/10 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 me-1 text-amber-400" />
                  {t('makePlayer')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateRole(user.uid, 'admin')}
                  disabled={isRolePending}
                  className="h-8 px-2.5 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 me-1" />
                  {t('makeAdmin')}
                </Button>
              )}

              <Button
                variant={user.isBlacklisted ? 'default' : 'destructive'}
                size="sm"
                onClick={() => onToggleBlacklist(user.uid, !user.isBlacklisted)}
                disabled={isBlacklistPending}
                className="h-8 px-2.5 text-xs font-semibold rounded-xl cursor-pointer"
              >
                {user.isBlacklisted ? t('unblacklist') : t('blacklist')}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteClick({ id: user.uid, name: user.name })}
                disabled={isDeletePending}
                className="h-8 w-8 p-0 rounded-xl bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer"
                title={t('deleteUser')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
