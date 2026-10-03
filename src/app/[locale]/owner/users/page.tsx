'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { User as AppUser } from '@/types';
import { useUsers, useUpdateUserRole, useToggleBlacklist, useDeleteUser, useToggleVipStatus } from '@/hooks/useUserRoles';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UsersPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { UserMobileCard } from './components/UserMobileCard';
import { UserTableRow } from './components/UserTableRow';

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

  const handleToggleVip = async (user: AppUser) => {
    try {
      const nextVip = !user.isVip;
      await toggleVipMutation.mutateAsync({ userId: user.uid, isVip: nextVip });
      toast.success(nextVip ? `👑 Gifted VIP to ${user.name}!` : `Revoked VIP from ${user.name}`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update VIP status');
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
                    {users.map((user) => (
                      <UserTableRow
                        key={user.uid}
                        user={user}
                        hasFailedImg={Boolean(failedImageUids[user.uid])}
                        onImageError={(uid) => setFailedImageUids((prev) => ({ ...prev, [uid]: true }))}
                        onToggleVip={handleToggleVip}
                        onUpdateRole={handleUpdateRole}
                        onToggleBlacklist={handleUpdateBlacklist}
                        onDeleteClick={(u) => setUserToDelete(u)}
                        t={t}
                        isVipPending={toggleVipMutation.isPending}
                        isRolePending={updateRoleMutation.isPending}
                        isBlacklistPending={toggleBlacklistMutation.isPending}
                        isDeletePending={deleteUserMutation.isPending}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Responsive Cards View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                {users.map((user) => (
                  <UserMobileCard
                    key={user.uid}
                    user={user}
                    hasFailedImg={Boolean(failedImageUids[user.uid])}
                    onImageError={(uid) => setFailedImageUids((prev) => ({ ...prev, [uid]: true }))}
                    onToggleVip={handleToggleVip}
                    onUpdateRole={handleUpdateRole}
                    onToggleBlacklist={handleUpdateBlacklist}
                    t={t}
                    isVipPending={toggleVipMutation.isPending}
                    isRolePending={updateRoleMutation.isPending}
                    isBlacklistPending={toggleBlacklistMutation.isPending}
                  />
                ))}
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
