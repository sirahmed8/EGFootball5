'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { User as AppUser } from '@/types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { User, Shield, ShieldAlert, Ban, CheckCircle, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { UsersPageSkeleton } from '@/components/skeletons/PageSkeletons';

export default function OwnerUsersPage() {
  const router = useRouter();
  const { appUser, loading } = useAuthStore();
  const t = useTranslations('OwnerUsers');
  
  const [users, setUsers] = useState<AppUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    if (!loading && appUser?.role !== 'owner') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    if (appUser?.role !== 'owner') return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map(d => d.data() as AppUser);
      setUsers(allUsers);
      setFetching(false);
    });

    return () => unsubscribe();
  }, [appUser]);

  if (loading || appUser?.role !== 'owner' || fetching) {
    return <UsersPageSkeleton />;
  }

  const handleUpdateRole = async (userId: string, newRole: AppUser['role']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('Role updated successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleUpdateBlacklist = async (userId: string, isBlacklisted: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isBlacklisted });
      toast.success(isBlacklisted ? 'User blacklisted' : 'User unblacklisted');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update blacklist status');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
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

      <Card className="bg-card/50 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {users.length} {t('title')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('noUsers')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">{t('name')}</th>
                    <th className="px-4 py-3">{t('email')}</th>
                    <th className="px-4 py-3">{t('role')}</th>
                    <th className="px-4 py-3">{t('status')}</th>
                    <th className="px-4 py-3">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(user => (
                    <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground flex items-center gap-3">
                        {user.photoURL ? (
                          <Image src={user.photoURL} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full border border-border" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div>{user.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'owner' ? 'bg-primary/20 text-primary' :
                          user.role === 'admin' ? 'bg-secondary/20 text-secondary' :
                          'bg-muted text-muted-foreground'
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
                                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                  <ShieldAlert className="w-4 h-4 mr-1" />
                                  {t('makePlayer')}
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleUpdateRole(user.uid, 'admin')}
                                  className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                  <Shield className="w-4 h-4 mr-1" />
                                  {t('makeAdmin')}
                                </Button>
                              )}
                              
                              <Button 
                                variant={user.isBlacklisted ? "default" : "destructive"}
                                size="sm" 
                                onClick={() => handleUpdateBlacklist(user.uid, !user.isBlacklisted)}
                                className="font-semibold"
                              >
                                {user.isBlacklisted ? t('unblacklist') : t('blacklist')}
                              </Button>

                                <Button 
                                  variant="destructive"
                                  size="sm" 
                                  onClick={() => setUserToDelete({ id: user.uid, name: user.name })}
                                  className="font-semibold bg-red-600/80 hover:bg-red-600 text-white flex items-center"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete user &quot;{userToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
