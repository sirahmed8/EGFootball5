'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { User as AppUser } from '@/types';
import { useUsers, useUpdateUserRole, useToggleBlacklist, useDeleteUser } from '@/hooks/useUserRoles';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { User, Shield, ShieldAlert, Ban, CheckCircle, Mail, Trash2 } from 'lucide-react';
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
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12">
      <div>
        <h1 className="text-4xl font-black text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <Card className="bg-card border border-border rounded-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {users.length} {t('title')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 font-medium">
              {t('noUsers')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-start">{t('name')}</th>
                    <th className="px-4 py-3 text-start">{t('email')}</th>
                    <th className="px-4 py-3 text-start">{t('role')}</th>
                    <th className="px-4 py-3 text-start">{t('status')}</th>
                    <th className="px-4 py-3 text-start">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => {
                    const hasFailedImg = failedImageUids[user.uid];
                    return (
                      <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 font-medium text-foreground flex items-center gap-3">
                          {user.photoURL && !hasFailedImg ? (
                            <img
                              src={user.photoURL}
                              alt={user.name || 'User'}
                              className="w-9 h-9 rounded-full border border-primary/30 object-cover shrink-0"
                              referrerPolicy="no-referrer"
                              onError={() => {
                                setFailedImageUids((prev) => ({ ...prev, [user.uid]: true }));
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs shrink-0">
                              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-primary" />}
                            </div>
                          )}
                          <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground hidden md:table-cell">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <Mail className="w-4 h-4 text-primary" />
                            {user.email || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            user.role === 'owner' ? 'bg-primary/20 text-primary border border-primary/30' :
                            user.role === 'admin' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                            'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {user.role === 'owner' ? t('owner') :
                             user.role === 'admin' ? t('admin') :
                             t('player')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                            user.isBlacklisted ? 'bg-destructive/20 text-destructive' : 'bg-emerald-500/20 text-emerald-500'
                          }`}>
                            {user.isBlacklisted ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {user.isBlacklisted ? t('blacklisted') : t('active')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {user.role !== 'owner' && (
                              <>
                                {user.role === 'admin' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateRole(user.uid, 'player')}
                                    disabled={updateRoleMutation.isPending}
                                    className="border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl cursor-pointer"
                                  >
                                    <ShieldAlert className="w-4 h-4 me-1" />
                                    {t('makePlayer')}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateRole(user.uid, 'admin')}
                                    disabled={updateRoleMutation.isPending}
                                    className="border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl cursor-pointer"
                                  >
                                    <Shield className="w-4 h-4 me-1" />
                                    {t('makeAdmin')}
                                  </Button>
                                )}

                                <Button
                                  variant={user.isBlacklisted ? "default" : "destructive"}
                                  size="sm"
                                  onClick={() => handleUpdateBlacklist(user.uid, !user.isBlacklisted)}
                                  disabled={toggleBlacklistMutation.isPending}
                                  className="font-semibold rounded-xl cursor-pointer"
                                >
                                  {user.isBlacklisted ? t('unblacklist') : t('blacklist')}
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setUserToDelete({ id: user.uid, name: user.name })}
                                  disabled={deleteUserMutation.isPending}
                                  className="font-semibold bg-red-600/80 hover:bg-red-600 text-white flex items-center rounded-xl cursor-pointer"
                                  title={t('deleteUser')}
                                >
                                  <Trash2 className="w-4 h-4 me-1" />
                                  {t('delete')}
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
