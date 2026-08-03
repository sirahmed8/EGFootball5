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
import { toast } from 'sonner';

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
                      <div className="font-extrabold text-foreground text-sm flex items-center gap-2">
                        <span>{pitches.find((p) => p.id === b.pitchId)?.name || 'Pitch'}</span>
                        {b.discountAmount && b.discountAmount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                            -10% VIP Discount
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono font-medium">
                        {b.date} • {b.duration}h
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-black text-primary font-mono text-base">EGP {b.totalAmount}</div>
                      {b.discountAmount && b.discountAmount > 0 ? (
                        <div className="text-[10px] text-amber-400 font-bold font-mono">
                          Subsidy Owed: EGP {b.discountAmount}
                        </div>
                      ) : null}
                    </div>
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

        {/* Pitch Owner VIP Discount Subsidy & Settlement Card */}
        <Card className="stadium-glass border-amber-500/30 rounded-3xl shadow-2xl bg-black/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black text-amber-400">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span>تسوية مستحقات الملاعب (VIP Discount Subsidies)</span>
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              يخصم النظام 10% للمشتركين الـ VIP. المنصة تسدد هذا الفارق لصاحب الملعب لضمان حصوله على حق الحجز كاملاً.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground block uppercase">إجمالي خصومات VIP</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  EGP {bookings.reduce((sum, b) => sum + (b.discountAmount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-muted-foreground block uppercase">مستحقات معلقة للملاعب</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  EGP {bookings.filter(b => b.reimbursementStatus === 'pending' || (b.discountAmount && b.discountAmount > 0 && !b.reimbursementStatus)).reduce((sum, b) => sum + (b.discountAmount || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">تفاصيل المستحقات حسب الملعب:</h4>
              {pitches.map((p) => {
                const pitchBookings = bookings.filter((b) => b.pitchId === p.id && (b.discountAmount || 0) > 0);
                const pendingBookings = pitchBookings.filter((b) => b.reimbursementStatus === 'pending' || !b.reimbursementStatus);
                const pendingSum = pendingBookings.reduce((sum, b) => sum + (b.discountAmount || 0), 0);

                return (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-foreground text-sm">{p.name}</div>
                      <div className="text-muted-foreground font-mono">
                        {pitchBookings.length} حجوزات VIP • مستحق: <strong className="text-amber-400 font-mono">EGP {pendingSum}</strong>
                      </div>
                    </div>
                    {pendingSum > 0 ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          const ids = pendingBookings.map((b) => b.id);
                          const { settlePitchReimbursements } = await import('@/lib/firebase/booking');
                          await settlePitchReimbursements(ids, appUser?.uid || 'owner');
                          toast.success(`تم سداد ومقاصة مبلغ EGP ${pendingSum} لـ ${p.name} بنجاح! 💸`);
                          window.location.reload();
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs cursor-pointer shadow-md shrink-0"
                      >
                        سداد المستحقات (EGP {pendingSum})
                      </Button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 shrink-0">
                        خالي من الديون ✓
                      </span>
                    )}
                  </div>
                );
              })}
              {pitches.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4">لا توجد ملاعب مسجلة حالياً</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
