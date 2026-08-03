'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Booking, Pitch, User as AppUser } from '@/types';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  DollarSign,
  Users,
  CalendarCheck,
  Crown,
  Sparkles,
  MapPin,
  Award,
  Download,
  ShieldCheck,
  Zap,
  Activity,
  ArrowUpRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardPageSkeleton } from '@/components/skeletons/PageSkeletons';

export default function MasterAnalyticsPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { appUser, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && appUser?.role !== 'owner') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['analytics_bookings'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'bookings'));
      return snap.docs.map((doc) => doc.data() as Booking);
    },
    enabled: appUser?.role === 'owner',
  });

  const { data: pitches = [], isLoading: pitchesLoading } = useQuery({
    queryKey: ['analytics_pitches'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'pitches'));
      return snap.docs.map((doc) => doc.data() as Pitch);
    },
    enabled: appUser?.role === 'owner',
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['analytics_users'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map((doc) => doc.data() as AppUser);
    },
    enabled: appUser?.role === 'owner',
  });

  if (loading || appUser?.role !== 'owner' || bookingsLoading || pitchesLoading || usersLoading) {
    return <DashboardPageSkeleton />;
  }

  // --- KPI Calculations ---
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalGrossRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  
  const vipUsers = users.filter((u) => u.isVip || u.role === 'owner' || u.role === 'admin');
  const regularVipSubscribers = users.filter((u) => u.isVip && u.role !== 'owner' && u.role !== 'admin');
  const vipMRR = regularVipSubscribers.length * 399; // 399 EGP / mo

  const totalVipDiscountsGranted = bookings.reduce((sum, b) => sum + (b.discountAmount || 0), 0);
  const pendingReimbursements = bookings
    .filter((b) => b.reimbursementStatus === 'pending' || (b.discountAmount && b.discountAmount > 0 && !b.reimbursementStatus))
    .reduce((sum, b) => sum + (b.discountAmount || 0), 0);
  const settledReimbursements = bookings
    .filter((b) => b.reimbursementStatus === 'settled')
    .reduce((sum, b) => sum + (b.discountAmount || 0), 0);

  const netPlatformProfit = totalGrossRevenue + vipMRR - totalVipDiscountsGranted;

  // Level Breakdown
  const levelCounts = {
    Legend: users.filter((u) => u.playerLevel === 'Legend').length,
    Pro: users.filter((u) => u.playerLevel === 'Pro').length,
    'Semi-Pro': users.filter((u) => u.playerLevel === 'Semi-Pro').length,
    Amateur: users.filter((u) => u.playerLevel === 'Amateur').length,
    Rookie: users.filter((u) => !u.playerLevel || u.playerLevel === 'Rookie').length,
  };

  // Peak time slots
  const slotCounts: Record<number, number> = {};
  confirmedBookings.forEach((b) => {
    slotCounts[b.timeSlot] = (slotCounts[b.timeSlot] || 0) + 1;
  });
  const sortedSlots = Object.entries(slotCounts)
    .map(([slot, count]) => ({ slot: Number(slot), count }))
    .sort((a, b) => b.count - a.count);

  const formatSlotTime = (slot: number) => {
    const hour = Math.floor(slot);
    const mins = slot % 1 === 0 ? '00' : '30';
    const ampm = hour >= 12 && hour < 24 ? (isArabic ? 'مساءً' : 'PM') : (isArabic ? 'صباحاً' : 'AM');
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  const exportMasterCSV = () => {
    try {
      const header = 'Metric,Value\n';
      const rows = [
        `Gross Booking Revenue,EGP ${totalGrossRevenue}`,
        `VIP Subscriptions MRR,EGP ${vipMRR}`,
        `Total Subsidized VIP Discounts,EGP ${totalVipDiscountsGranted}`,
        `Net Platform Profit,EGP ${netPlatformProfit}`,
        `Total Registered Players,${users.length}`,
        `Active VIP Members,${vipUsers.length}`,
        `Confirmed Matches Played,${confirmedBookings.length}`,
        `Active Pitches,${pitches.length}`,
      ].join('\n');

      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `egfootball5_master_analytics_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(isArabic ? 'تم تصدير تقرير التحليلات الشامل بنجاح! 📊' : 'Master analytics report exported successfully!');
    } catch {
      toast.error(isArabic ? 'فشل تصدير التقرير' : 'Failed to export analytics report');
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-black" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مركز تحليلات المنصة والأرباح Master Analytics' : 'Owner Master Analytics & Intelligence'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-3">
            <span>{isArabic ? 'لوحة تحليلات وإحصائيات المنصة' : 'Platform Master Analytics'}</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl font-medium">
            {isArabic
              ? 'نظرة شاملة ودقيقة على أداء جميع الملاعب، إيرادات الحجوزات، اشتراكات VIP، ومستحقات الملاعب في مكان واحد.'
              : 'Complete financial overview, player insights, subscription metrics, and pitch owner settlement ledgers.'}
          </p>
        </div>

        <Button
          onClick={exportMasterCSV}
          size="lg"
          className="bg-primary text-black font-black rounded-2xl glow-primary cursor-pointer flex items-center gap-2 shadow-lg shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isArabic ? 'تصدير التقرير المالي (CSV)' : 'Export CSV Report'}</span>
        </Button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-2xl space-y-2 bg-black">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase tracking-wider">
            <span>{isArabic ? 'إجمالي إيرادات الحجوزات' : 'Gross Booking Revenue'}</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-primary font-mono">EGP {totalGrossRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> {confirmedBookings.length} {isArabic ? 'مباراة مؤكدة' : 'confirmed games'}
          </div>
        </Card>

        <Card className="stadium-glass border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-2 bg-black">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase tracking-wider">
            <span>{isArabic ? 'إيرادات اشتراكات VIP (MRR)' : 'VIP Pass Monthly Revenue'}</span>
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">EGP {vipMRR.toLocaleString()}</div>
          <div className="text-[11px] text-amber-400/80 font-bold">
            👑 {vipUsers.length} {isArabic ? 'مشترك VIP نشط' : 'active VIP passholders'}
          </div>
        </Card>

        <Card className="stadium-glass border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-2 bg-black">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase tracking-wider">
            <span>{isArabic ? 'صافي أرباح المنصة' : 'Net Platform Profit'}</span>
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">EGP {netPlatformProfit.toLocaleString()}</div>
          <div className="text-[11px] text-muted-foreground font-medium">
            {isArabic ? 'بعد سداد خصومات الملاعب' : 'After pitch subsidy reimbursements'}
          </div>
        </Card>

        <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-2xl space-y-2 bg-black">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase tracking-wider">
            <span>{isArabic ? 'إجمالي اللاعبين المسجلين' : 'Total Players'}</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-foreground font-mono">{users.length}</div>
          <div className="text-[11px] text-muted-foreground font-medium">
            {isArabic ? `عبر العبور والقاهرة` : 'Across Obour & Cairo'}
          </div>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pitch Performance Matrix */}
        <Card className="stadium-glass border-white/10 rounded-3xl shadow-2xl lg:col-span-2 bg-black/90 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>{isArabic ? 'أداء إيرادات وحجوزات الملاعب' : 'Pitch Revenue & Utilization Matrix'}</span>
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {isArabic ? 'تفاصيل إيرادات كل ملعب على حدة، عدد الحجوزات، والخصومات المستحقة.' : 'Individual pitch booking volume, revenue breakdown, and subsidy payouts.'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              {pitches.length} {isArabic ? 'ملعب نشط' : 'Pitches'}
            </span>
          </div>

          <div className="space-y-4">
            {pitches.map((p) => {
              const pBookings = confirmedBookings.filter((b) => b.pitchId === p.id);
              const pRevenue = pBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
              const pDiscounts = pBookings.reduce((sum, b) => sum + (b.discountAmount || 0), 0);

              return (
                <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-foreground text-base">{p.name}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{p.locationName} • {p.pricePerHour} EGP/hr</p>
                    </div>
                    <div className="text-end">
                      <div className="text-xl font-black text-primary font-mono">EGP {pRevenue.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground font-bold">{pBookings.length} {isArabic ? 'مباراة حجز' : 'bookings'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-muted-foreground font-bold block text-[10px]">{isArabic ? 'خصومات VIP المستحقة للملعب:' : 'VIP Subsidy Owed:'}</span>
                      <span className="font-mono font-black text-amber-400">EGP {pDiscounts}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-muted-foreground font-bold block text-[10px]">{isArabic ? 'إداري الملعب:' : 'Manager:'}</span>
                      <span className="font-bold text-foreground">{p.managerName || p.adminEmail}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {pitches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm font-medium">
                {isArabic ? 'لا توجد ملاعب مضافة حالياً' : 'No registered pitches found.'}
              </div>
            )}
          </div>
        </Card>

        {/* Peak Hours & Player Tiers Breakdown */}
        <div className="space-y-6">
          {/* Peak Hours */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 bg-black">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>{isArabic ? 'أوقات الحجز الأكثر إقبالاً (Peak Slots)' : 'Peak Booking Hours'}</span>
            </h3>
            <div className="space-y-2.5">
              {sortedSlots.slice(0, 5).map(({ slot, count }) => (
                <div key={slot} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <span className="font-bold font-mono text-foreground text-sm">{formatSlotTime(slot)}</span>
                  <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary font-black border border-primary/30">
                    {count} {isArabic ? 'حجوزات' : 'bookings'}
                  </span>
                </div>
              ))}
              {sortedSlots.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-4">
                  {isArabic ? 'لا توجد إحصائيات أوقات حجز بعد' : 'No booking time data yet'}
                </div>
              )}
            </div>
          </Card>

          {/* Player Skill Tier Breakdown */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 bg-black">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span>{isArabic ? 'توزيع مستويات اللاعبين (Skill Tiers)' : 'Player Skill Tier Breakdown'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              {Object.entries(levelCounts).map(([tier, count]) => {
                const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                return (
                  <div key={tier} className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">{tier}</span>
                      <span className="font-mono text-primary">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
