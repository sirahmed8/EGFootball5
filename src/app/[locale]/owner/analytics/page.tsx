'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useQuery } from '@tanstack/react-query';
import { Booking, Pitch, User as AppUser, BookingStatus } from '@/types';
import { useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  Download,
  CreditCard,
  CalendarCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { AnalyticsOverviewTab } from './components/AnalyticsOverviewTab';
import { SubscriptionsTab } from './components/SubscriptionsTab';
import { VipGiftsTab } from './components/VipGiftsTab';
import { PitchesAnalyticsTab } from './components/PitchesAnalyticsTab';
import { AiUsageTab } from './components/AiUsageTab';

const fmt = (n: number) => n.toLocaleString();

export default function MasterAnalyticsPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { appUser, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'vipgifts' | 'pitches' | 'ai'>('overview');

  useEffect(() => {
    if (!loading && appUser?.role !== 'owner') router.push('/');
  }, [appUser, loading, router]);

  const { data: bookings = [], isLoading: bL } = useQuery({
    queryKey: ['an_bookings'],
    queryFn: async () => (await getDocs(collection(db, 'bookings'))).docs.map((d) => d.data() as Booking),
    enabled: appUser?.role === 'owner',
  });

  const { data: pitches = [], isLoading: pL } = useQuery({
    queryKey: ['an_pitches'],
    queryFn: async () => (await getDocs(collection(db, 'pitches'))).docs.map((d) => d.data() as Pitch),
    enabled: appUser?.role === 'owner',
  });

  const { data: users = [], isLoading: uL } = useQuery({
    queryKey: ['an_users'],
    queryFn: async () => (await getDocs(collection(db, 'users'))).docs.map((d) => d.data() as AppUser),
    enabled: appUser?.role === 'owner',
  });

  const { data: aiLogs = [], isLoading: aiL } = useQuery({
    queryKey: ['an_ai_logs'],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'aiLogs'));
        return snap.docs.map((d) => d.data()).sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
      } catch {
        return [];
      }
    },
    enabled: appUser?.role === 'owner',
    refetchInterval: 5000,
  });

  if (loading || !appUser || appUser.role !== 'owner' || bL || pL || uL || aiL) {
    return <DashboardPageSkeleton />;
  }

  /* ─── KPI Calculations ─── */
  const confirmed = bookings.filter((b) => b.status === BookingStatus.CONFIRMED);
  const pending = bookings.filter(
    (b) => b.status === BookingStatus.PENDING_REVIEW || b.status === BookingStatus.LOCKED_TEMPORARY
  );
  const cancelled = bookings.filter(
    (b) => b.status === BookingStatus.CANCELLED || b.status === BookingStatus.REJECTED
  );

  const grossRevenue = confirmed.reduce((s, b) => s + (b.totalAmount || 0), 0);

  const paidVipUsers = users.filter((u) => u.isVip && u.vipTier === 'Pitch Pass VIP');
  const giftedVipUsers = users.filter((u) => u.isVip && u.vipTier && u.vipTier.includes('Granted'));
  const ownerAdminVip = users.filter((u) => u.role === 'owner' || u.role === 'admin');
  const allVip = users.filter((u) => u.isVip || u.role === 'owner' || u.role === 'admin');

  const paidMRR = paidVipUsers.length * 399;
  const giftedCostPerMonth = giftedVipUsers.length * 399;
  const totalVipDiscounts = bookings.reduce((s, b) => s + (b.discountAmount || 0), 0);
  const pendingReimbursements = bookings
    .filter((b) => b.reimbursementStatus === 'pending')
    .reduce((s, b) => s + (b.discountAmount || 0), 0);
  const settledReimbursements = bookings
    .filter((b) => b.reimbursementStatus === 'settled')
    .reduce((s, b) => s + (b.discountAmount || 0), 0);
  const netProfit = grossRevenue + paidMRR - totalVipDiscounts;

  const tiers: Record<string, number> = { Legend: 0, Pro: 0, 'Semi-Pro': 0, Amateur: 0, Rookie: 0 };
  users.forEach((u) => {
    const k = u.playerLevel as string;
    if (k && tiers[k] !== undefined) tiers[k]++;
    else tiers['Rookie']++;
  });

  const slotMap: Record<number, number> = {};
  confirmed.forEach((b) => {
    slotMap[b.timeSlot] = (slotMap[b.timeSlot] || 0) + 1;
  });
  const topSlots = Object.entries(slotMap)
    .map(([s, c]) => ({ slot: Number(s), count: c }))
    .sort((a, b) => b.count - a.count);

  const fmtSlot = (s: number) => {
    const h = Math.floor(s),
      ampm = h >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
    return `${h % 12 || 12}:00 ${ampm}`;
  };

  const totalAiRequests = aiLogs.length;
  const totalAiTokens = aiLogs.reduce((s: number, l: Record<string, unknown>) => s + ((l.tokens as number) || 0), 0);
  const estimatedAiCost = (totalAiTokens / 1000) * 0.002;

  const now = Date.now();
  const day = 86400000;
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * day;
    const dayEnd = dayStart + day;
    const label = new Date(dayStart).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { weekday: 'short' });
    const count = confirmed.filter((b) => {
      const t =
        typeof b.createdAt === 'number'
          ? b.createdAt
          : (b.createdAt as { seconds?: number })?.seconds
          ? (b.createdAt as { seconds: number }).seconds * 1000
          : 0;
      return t >= dayStart && t < dayEnd;
    }).length;
    return { label, count };
  });
  const maxDay = Math.max(...last7.map((d) => d.count), 1);

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Gross Booking Revenue', `EGP ${grossRevenue}`],
      ['Paid VIP Subscribers', paidVipUsers.length],
      ['Paid VIP MRR', `EGP ${paidMRR}`],
      ['Gifted VIP Members', giftedVipUsers.length],
      ['Gifted VIP Opportunity Cost / mo', `EGP ${giftedCostPerMonth}`],
      ['Total VIP Discounts Granted', `EGP ${totalVipDiscounts}`],
      ['Pending Pitch Reimbursements', `EGP ${pendingReimbursements}`],
      ['Settled Pitch Reimbursements', `EGP ${settledReimbursements}`],
      ['Net Platform Profit', `EGP ${netProfit}`],
      ['Total Registered Players', users.length],
      ['Active VIP Members (all)', allVip.length],
      ['Confirmed Bookings', confirmed.length],
      ['Cancelled Bookings', cancelled.length],
      ['Total AI Requests', totalAiRequests],
      ['Total AI Tokens Used', totalAiTokens],
      ['Estimated AI API Cost', `$${estimatedAiCost.toFixed(4)}`],
    ]
      .map((r) => r.join(','))
      .join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `egfootball5_analytics_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(isArabic ? 'تم تصدير التقرير بنجاح' : 'Report exported successfully!');
  };

  const tabs = [
    { id: 'overview', label: isArabic ? 'نظرة عامة' : 'Overview' },
    { id: 'subscriptions', label: isArabic ? 'الاشتراكات والمدفوعات' : 'Subscriptions & Payments' },
    { id: 'vipgifts', label: isArabic ? 'VIP الهدايا' : 'Gifted VIPs' },
    { id: 'pitches', label: isArabic ? 'الملاعب' : 'Pitches' },
    { id: 'ai', label: isArabic ? 'استخدام AI' : 'AI Usage' },
  ] as const;

  return (
    <div
      className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-black"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مركز تحليلات المنصة - Owner Only' : 'Owner Intelligence Center'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            {isArabic ? 'لوحة التحليلات الشاملة' : 'Master Analytics Dashboard'}
          </h1>
          <p className="text-muted-foreground text-xs font-medium max-w-2xl">
            {isArabic
              ? 'نظرة كاملة على كل ما يحدث في المنصة — الإيرادات، الاشتراكات، هدايا VIP، أداء الملاعب، وتكاليف الذكاء الاصطناعي.'
              : 'Full visibility into everything happening on the platform — revenue, subscriptions, VIP gifts, pitch performance, and AI costs.'}
          </p>
        </div>
        <Button
          onClick={exportCSV}
          className="bg-primary text-black font-black rounded-2xl cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          {isArabic ? 'تصدير CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* Top 5 KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: isArabic ? 'إجمالي الإيرادات' : 'Gross Revenue',
            value: `EGP ${fmt(grossRevenue)}`,
            icon: <DollarSign className="w-4 h-4" />,
            color: 'text-primary',
            border: 'border-primary/20',
          },
          {
            label: isArabic ? 'MRR (اشتراكات)' : 'Subscription MRR',
            value: `EGP ${fmt(paidMRR)}`,
            icon: <CreditCard className="w-4 h-4" />,
            color: 'text-amber-400',
            border: 'border-amber-500/20',
          },
          {
            label: isArabic ? 'صافي الأرباح' : 'Net Profit',
            value: `EGP ${fmt(netProfit)}`,
            icon: <TrendingUp className="w-4 h-4" />,
            color: 'text-emerald-400',
            border: 'border-emerald-500/20',
          },
          {
            label: isArabic ? 'إجمالي اللاعبين' : 'Total Players',
            value: fmt(users.length),
            icon: <Users className="w-4 h-4" />,
            color: 'text-blue-400',
            border: 'border-blue-500/20',
          },
          {
            label: isArabic ? 'حجوزات مؤكدة' : 'Confirmed Bookings',
            value: fmt(confirmed.length),
            icon: <CalendarCheck className="w-4 h-4" />,
            color: 'text-violet-400',
            border: 'border-violet-500/20',
          },
        ].map((k, i) => (
          <Card key={i} className={`stadium-glass ${k.border} rounded-2xl p-4 bg-black space-y-2`}>
            <div className={`flex justify-between items-center ${k.color}`}>
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground">{k.label}</span>
              {k.icon}
            </div>
            <div className={`text-xl font-black font-mono ${k.color}`}>{k.value}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-white/10 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <AnalyticsOverviewTab
          isArabic={isArabic}
          last7={last7}
          maxDay={maxDay}
          confirmedCount={confirmed.length}
          pendingCount={pending.length}
          cancelledCount={cancelled.length}
          totalBookings={bookings.length}
          tiers={tiers}
          totalUsers={users.length}
          topSlots={topSlots}
          fmtSlot={fmtSlot}
        />
      )}

      {activeTab === 'subscriptions' && (
        <SubscriptionsTab
          isArabic={isArabic}
          paidMRR={paidMRR}
          grossRevenue={grossRevenue}
          totalVipDiscounts={totalVipDiscounts}
          netProfit={netProfit}
          paidVipUsers={paidVipUsers}
          confirmed={confirmed}
          pendingReimbursements={pendingReimbursements}
          settledReimbursements={settledReimbursements}
          pitches={pitches}
          fmt={fmt}
        />
      )}

      {activeTab === 'vipgifts' && (
        <VipGiftsTab
          isArabic={isArabic}
          giftedVipUsers={giftedVipUsers}
          giftedCostPerMonth={giftedCostPerMonth}
          ownerAdminVip={ownerAdminVip}
          fmt={fmt}
        />
      )}

      {activeTab === 'pitches' && (
        <PitchesAnalyticsTab
          isArabic={isArabic}
          pitches={pitches}
          confirmed={confirmed}
          fmt={fmt}
        />
      )}

      {activeTab === 'ai' && (
        <AiUsageTab
          isArabic={isArabic}
          totalAiRequests={totalAiRequests}
          totalAiTokens={totalAiTokens}
          estimatedAiCost={estimatedAiCost}
          fmt={fmt}
        />
      )}
    </div>
  );
}
