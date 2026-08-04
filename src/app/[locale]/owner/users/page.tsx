'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { User as AppUser } from '@/types';
import { useUsers, useUpdateUserRole, useToggleBlacklist, useDeleteUser, useToggleVipStatus } from '@/hooks/useUserRoles';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { User, Shield, ShieldAlert, Ban, CheckCircle, Mail, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UsersPageSkeleton } from '@/components/skeletons/PageSkeletons';

export default function OwnerUsersPage() {
  const router = useRouter();
  const { appUser, loading } = useAuthStore();
  const t = useTranslations('OwnerUsers');

  const { data: users = [], isLoading: fetching } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const toggleBlacklistMutation = useToggleBlacklist();
  const deleteUserMutation = useDeleteUser();
  const toggleVipMutation = useToggleVipStatus();

  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [failedImageUids, setFailedImageUids] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && appUser?.role !== 'owner') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  if (loading || appUser?.role !== 'owner' || fetching) {
    return <UsersPageSkeleton />;
  }

  const handleUpdateRole = async (userId: string, newRole: AppUser['role']) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, newRole });
      toast.success('Role updated successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleUpdateBlacklist = async (userId: string, isBlacklisted: boolean) => {
    try {
      await toggleBlacklistMutation.mutateAsync({ userId, isBlacklisted });
      toast.success(isBlacklisted ? 'User blacklisted' : 'User unblacklisted');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update blacklist status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation.mutateAsync({ userId: userToDelete.id });
      toast.success(`User "${userToDelete.name}" deleted successfully`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-mesh">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-foreground tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground font-medium">{t('subtitle')}</p>
      </div>

      <Card className="stadium-glass border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            {t('title')}
          </CardTitle>
          <CardDescription className="font-medium text-xs">
            {users.length} {t('title')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {users.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 font-medium">
              {t('noUsers')}
            </div>
          ) : (
            <>
              {/* Desktop Table View (Fits 100% zoom screens cleanly) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-3 py-3 text-start">{t('name')}</th>
                      <th className="px-3 py-3 text-start">{t('email')}</th>
                      <th className="px-3 py-3 text-start">{t('role')}</th>
                      <th className="px-3 py-3 text-start">{t('status')}</th>
                      <th className="px-3 py-3 text-end">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => {
                      const hasFailedImg = failedImageUids[user.uid];
                      return (
                        <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                          <td className="px-3 py-3 font-medium text-foreground flex items-center gap-2.5">
                            {user.photoURL && !hasFailedImg ? (
                              <img
                                src={user.photoURL}
                                alt={user.name || 'User'}
                                className="w-8 h-8 rounded-full border border-primary/30 object-cover shrink-0"
                                referrerPolicy="no-referrer"
                                onError={() => {
                                  setFailedImageUids((prev) => ({ ...prev, [user.uid]: true }));
                                }}
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              user.role === 'owner' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              user.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' :
                              'bg-muted text-muted-foreground border border-border'
                            }`}>
                              {user.role === 'owner' ? t('owner') :
                               user.role === 'admin' ? t('admin') :
                               t('player')}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              user.isBlacklisted ? 'bg-destructive/20 text-destructive' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {user.isBlacklisted ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                              {user.isBlacklisted ? t('blacklisted') : t('active')}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              {user.role !== 'owner' && (
                                <>
                                  {/* VIP Manual Grant / Revoke Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      const nextVip = !user.isVip;
                                      await toggleVipMutation.mutateAsync({ userId: user.uid, isVip: nextVip });
                                      toast.success(nextVip ? `👑 Gifted Pitch Pass VIP to ${user.name}!` : `Revoked VIP from ${user.name}`);
                                    }}
                                    disabled={toggleVipMutation.isPending}
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
                                      onClick={() => handleUpdateRole(user.uid, 'player')}
                                      disabled={updateRoleMutation.isPending}
                                      className="h-8 px-2.5 text-xs rounded-xl border-border text-foreground hover:bg-white/10 cursor-pointer"
                                    >
                                      <ShieldAlert className="w-3.5 h-3.5 me-1 text-amber-400" />
                                      {t('makePlayer')}
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUpdateRole(user.uid, 'admin')}
                                      disabled={updateRoleMutation.isPending}
                                      className="h-8 px-2.5 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                                    >
                                      <Shield className="w-3.5 h-3.5 me-1" />
                                      {t('makeAdmin')}
                                    </Button>
                                  )}

                                  <Button
                                    variant={user.isBlacklisted ? "default" : "destructive"}
                                    size="sm"
                                    onClick={() => handleUpdateBlacklist(user.uid, !user.isBlacklisted)}
                                    disabled={toggleBlacklistMutation.isPending}
                                    className="h-8 px-2.5 text-xs font-semibold rounded-xl cursor-pointer"
                                  >
                                    {user.isBlacklisted ? t('unblacklist') : t('blacklist')}
                                  </Button>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setUserToDelete({ id: user.uid, name: user.name })}
                                    disabled={deleteUserMutation.isPending}
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
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Responsive Cards View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                {users.map((user) => {
                  const hasFailedImg = failedImageUids[user.uid];
                  return (
                    <div key={user.uid} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {user.photoURL && !hasFailedImg ? (
                            <img
                              src={user.photoURL}
                              alt={user.name || 'User'}
                              className="w-10 h-10 rounded-full border border-primary/30 object-cover shrink-0"
                              referrerPolicy="no-referrer"
                              onError={() => setFailedImageUids((prev) => ({ ...prev, [user.uid]: true }))}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/30 font-bold text-sm shrink-0">
                              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-primary" />}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-foreground text-sm flex items-center gap-1">
                              <span>{user.name}</span>
                              {user.isVip && <span className="text-amber-400 text-xs">👑</span>}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{user.email || user.phone || '-'}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          user.role === 'owner' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          user.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/30' :
                          'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      {user.role !== 'owner' && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                          {/* VIP Toggle - Mobile */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const nextVip = !user.isVip;
                              await toggleVipMutation.mutateAsync({ userId: user.uid, isVip: nextVip });
                              toast.success(nextVip ? `👑 Gifted VIP to ${user.name}!` : `Revoked VIP from ${user.name}`);
                            }}
                            disabled={toggleVipMutation.isPending}
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
                              onClick={() => handleUpdateRole(user.uid, 'player')}
                              disabled={updateRoleMutation.isPending}
                              className="flex-1 h-8 text-xs rounded-xl"
                            >
                              {t('makePlayer')}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateRole(user.uid, 'admin')}
                              disabled={updateRoleMutation.isPending}
                              className="flex-1 h-8 text-xs rounded-xl border-primary/40 text-primary"
                            >
                              {t('makeAdmin')}
                            </Button>
                          )}
                          <Button
                            variant={user.isBlacklisted ? "default" : "destructive"}
                            size="sm"
                            onClick={() => handleUpdateBlacklist(user.uid, !user.isBlacklisted)}
                            disabled={toggleBlacklistMutation.isPending}
                            className="flex-1 h-8 text-xs rounded-xl"
                          >
                            {user.isBlacklisted ? t('unblacklist') : t('blacklist')}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="rounded-3xl border-border bg-card">
          <DialogHeader>
            <DialogTitle>{t('deleteUser')}</DialogTitle>
            <DialogDescription>
              {t('deleteConfirm', { name: userToDelete?.name || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUserToDelete(null)} className="rounded-xl cursor-pointer">
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUserMutation.isPending} className="rounded-xl font-bold cursor-pointer">
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
