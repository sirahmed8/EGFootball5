'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Booking, Pitch, User as AppUser } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, DollarSign, Users, CalendarCheck, MapPin, Sparkles } from 'lucide-react';
import { DashboardPageSkeleton } from '@/components/skeletons/PageSkeletons';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { appUser, loading } = useAuthStore();
  const t = useTranslations('Owner');

  useEffect(() => {
    if (!loading && appUser?.role !== 'owner') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['owner_bookings'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'bookings'));
      return snap.docs.map((doc) => doc.data() as Booking);
    },
    enabled: appUser?.role === 'owner',
  });

  const { data: pitches = [], isLoading: pitchesLoading } = useQuery({
    queryKey: ['owner_pitches'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'pitches'));
      return snap.docs.map((doc) => doc.data() as Pitch);
    },
    enabled: appUser?.role === 'owner',
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['owner_users'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map((doc) => doc.data() as AppUser);
    },
    enabled: appUser?.role === 'owner',
  });

  if (loading || appUser?.role !== 'owner' || bookingsLoading || pitchesLoading || usersLoading) {
    return <DashboardPageSkeleton />;
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-black">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('statsOverview')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-base max-w-xl font-medium">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="stadium-glass border-white/10 card-lift rounded-3xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('totalRevenue')}
            </CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary font-mono tracking-tight">EGP {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="stadium-glass border-white/10 card-lift rounded-3xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('totalBookings')}
            </CardTitle>
            <CalendarCheck className="w-5 h-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground font-mono">{confirmedBookings.length}</div>
            <p className="text-xs text-muted-foreground font-bold mt-1">
              {t('confirmedMatches')}
            </p>
          </CardContent>
        </Card>

        <Card className="stadium-glass border-white/10 card-lift rounded-3xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('registeredUsers')}
            </CardTitle>
            <Users className="w-5 h-5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground font-mono">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="stadium-glass border-white/10 card-lift rounded-3xl shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('activePitches')}
            </CardTitle>
            <MapPin className="w-5 h-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground font-mono">{pitches.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="stadium-glass border-white/10 rounded-3xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <Activity className="w-5 h-5 text-primary" />
              <span>{t('recentConfirmedBookings')}</span>
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {t('recentBookingsSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {confirmedBookings
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5)
                .map((b) => (
                  <div
                    key={b.id}
                    className="flex justify-between items-center pb-4 border-b border-white/10 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-extrabold text-foreground text-sm">
                        {pitches.find((p) => p.id === b.pitchId)?.name || 'Unknown Pitch'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono font-medium">
                        {b.date} • {b.duration}h
                      </div>
                    </div>
                    <div className="font-black text-primary font-mono text-base">EGP {b.totalAmount}</div>
                  </div>
                ))}
              {confirmedBookings.length === 0 && (
                <div className="text-center text-muted-foreground text-xs italic">
                  {t('noRecentBookings')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
