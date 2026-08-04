'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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
  Crown,
  Sparkles,
  MapPin,
  Award,
  Download,
  Zap,
  Activity,
  Bot,
  Gift,
  CreditCard,
  CalendarCheck,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardPageSkeleton } from '@/components/skeletons/PageSkeletons';

/* ─── helpers ─── */
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
    queryFn: async () => (await getDocs(collection(db, 'bookings'))).docs.map(d => d.data() as Booking),
    enabled: appUser?.role === 'owner',
  });

  const { data: pitches = [], isLoading: pL } = useQuery({
    queryKey: ['an_pitches'],
    queryFn: async () => (await getDocs(collection(db, 'pitches'))).docs.map(d => d.data() as Pitch),
    enabled: appUser?.role === 'owner',
  });

  const { data: users = [], isLoading: uL } = useQuery({
    queryKey: ['an_users'],
    queryFn: async () => (await getDocs(collection(db, 'users'))).docs.map(d => d.data() as AppUser),
    enabled: appUser?.role === 'owner',
  });

  const { data: aiLogs = [], isLoading: aiL } = useQuery({
    queryKey: ['an_ai_logs'],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'aiLogs'));
        return snap.docs.map(d => d.data()).sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
      } catch {
        return [];
      }
    },
    enabled: appUser?.role === 'owner',
    refetchInterval: 5000, // Live poll every 5s for real-time AI usage updates on analytics page
  });

  if (loading || appUser?.role !== 'owner' || bL || pL || uL || aiL) return <DashboardPageSkeleton />;

  /* ─── KPI Calculations ─── */
  const confirmed = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
  const pending = bookings.filter(b => b.status === BookingStatus.PENDING_REVIEW || b.status === BookingStatus.LOCKED_TEMPORARY);
  const cancelled = bookings.filter(b => b.status === BookingStatus.CANCELLED || b.status === BookingStatus.REJECTED);

  const grossRevenue = confirmed.reduce((s, b) => s + (b.totalAmount || 0), 0);

  // VIP breakdowns
  const paidVipUsers = users.filter(u => u.isVip && u.vipTier === 'Pitch Pass VIP');
  const giftedVipUsers = users.filter(u => u.isVip && u.vipTier && u.vipTier.includes('Granted'));
  const ownerAdminVip = users.filter(u => u.role === 'owner' || u.role === 'admin');
  const allVip = users.filter(u => u.isVip || u.role === 'owner' || u.role === 'admin');

  const paidMRR = paidVipUsers.length * 399;
  const giftedCostPerMonth = giftedVipUsers.length * 399; // opportunity cost
  const totalVipDiscounts = bookings.reduce((s, b) => s + (b.discountAmount || 0), 0);
  const pendingReimbursements = bookings.filter(b => b.reimbursementStatus === 'pending').reduce((s, b) => s + (b.discountAmount || 0), 0);
  const settledReimbursements = bookings.filter(b => b.reimbursementStatus === 'settled').reduce((s, b) => s + (b.discountAmount || 0), 0);
  const netProfit = grossRevenue + paidMRR - totalVipDiscounts;

  // Skill tier breakdown
  const tiers: Record<string, number> = { Legend: 0, Pro: 0, 'Semi-Pro': 0, Amateur: 0, Rookie: 0 };
  users.forEach(u => { const k = u.playerLevel as string; if (k && tiers[k] !== undefined) tiers[k]++; else tiers['Rookie']++; });

  // Peak time slots
  const slotMap: Record<number, number> = {};
  confirmed.forEach(b => { slotMap[b.timeSlot] = (slotMap[b.timeSlot] || 0) + 1; });
  const topSlots = Object.entries(slotMap).map(([s, c]) => ({ slot: Number(s), count: c })).sort((a, b) => b.count - a.count);

  const fmtSlot = (s: number) => {
    const h = Math.floor(s), ampm = h >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
    return `${h % 12 || 12}:00 ${ampm}`;
  };

  // AI usage stats
  const totalAiRequests = aiLogs.length;
  const totalAiTokens = aiLogs.reduce((s: number, l: Record<string, number>) => s + (l.tokens || 0), 0);
  const estimatedAiCost = (totalAiTokens / 1000) * 0.002; // $0.002/1k tokens approx

  // Booking trend (last 7 days)
  const now = Date.now();
  const day = 86400000;
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * day;
    const dayEnd = dayStart + day;
    const label = new Date(dayStart).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { weekday: 'short' });
    const count = confirmed.filter(b => {
      const t = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt as {seconds?: number})?.seconds ? (b.createdAt as {seconds: number}).seconds * 1000 : 0;
      return t >= dayStart && t < dayEnd;
    }).length;
    return { label, count };
  });
  const maxDay = Math.max(...last7.map(d => d.count), 1);

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
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `egfootball5_analytics_${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success(isArabic ? 'تم تصدير التقرير بنجاح' : 'Report exported successfully!');
  };

  /* ─── TAB DEFINITIONS ─── */
  const tabs = [
    { id: 'overview', label: isArabic ? 'نظرة عامة' : 'Overview' },
    { id: 'subscriptions', label: isArabic ? 'الاشتراكات والمدفوعات' : 'Subscriptions & Payments' },
    { id: 'vipgifts', label: isArabic ? 'VIP الهدايا' : 'Gifted VIPs' },
    { id: 'pitches', label: isArabic ? 'الملاعب' : 'Pitches' },
    { id: 'ai', label: isArabic ? 'استخدام AI' : 'AI Usage' },
  ] as const;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-black" dir={isArabic ? 'rtl' : 'ltr'}>

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
        <Button onClick={exportCSV} className="bg-primary text-black font-black rounded-2xl cursor-pointer flex items-center gap-2 shrink-0">
          <Download className="w-4 h-4" />
          {isArabic ? 'تصدير CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* Top 5 KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: isArabic ? 'إجمالي الإيرادات' : 'Gross Revenue', value: `EGP ${fmt(grossRevenue)}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-primary', border: 'border-primary/20' },
          { label: isArabic ? 'MRR (اشتراكات)' : 'Subscription MRR', value: `EGP ${fmt(paidMRR)}`, icon: <CreditCard className="w-4 h-4" />, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: isArabic ? 'صافي الأرباح' : 'Net Profit', value: `EGP ${fmt(netProfit)}`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: isArabic ? 'إجمالي اللاعبين' : 'Total Players', value: fmt(users.length), icon: <Users className="w-4 h-4" />, color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: isArabic ? 'حجوزات مؤكدة' : 'Confirmed Bookings', value: fmt(confirmed.length), icon: <CalendarCheck className="w-4 h-4" />, color: 'text-violet-400', border: 'border-violet-500/20' },
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
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === tab.id ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Trend — Last 7 Days */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-black text-foreground">{isArabic ? 'الحجوزات المؤكدة — آخر 7 أيام' : 'Confirmed Bookings — Last 7 Days'}</h3>
            </div>
            <div className="flex items-end gap-2 h-28">
              {last7.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-primary font-bold">{d.count}</span>
                  <div className="w-full rounded-t-lg bg-primary/80 transition-all" style={{ height: `${(d.count / maxDay) * 80}px`, minHeight: d.count ? 6 : 2 }} />
                  <span className="text-[9px] text-muted-foreground font-bold">{d.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Booking Status Breakdown */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-foreground">{isArabic ? 'حالة جميع الحجوزات' : 'Booking Status Breakdown'}</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: isArabic ? 'مؤكدة' : 'Confirmed', count: confirmed.length, color: 'bg-emerald-500', icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                { label: isArabic ? 'معلقة / في انتظار الدفع' : 'Pending Payment', count: pending.length, color: 'bg-amber-500', icon: <Clock className="w-4 h-4 text-amber-400" /> },
                { label: isArabic ? 'ملغية' : 'Cancelled', count: cancelled.length, color: 'bg-rose-500', icon: <AlertCircle className="w-4 h-4 text-rose-400" /> },
              ].map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">{s.icon} {s.label}</span>
                    <span className="font-mono text-foreground">{s.count} ({bookings.length ? Math.round((s.count / bookings.length) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${bookings.length ? (s.count / bookings.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Player Skill Tiers */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-black text-foreground">{isArabic ? 'توزيع مستويات اللاعبين' : 'Player Skill Tier Distribution'}</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(tiers).map(([tier, count]) => {
                const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                return (
                  <div key={tier} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground">{tier}</span>
                      <span className="font-mono text-primary">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Peak Booking Hours */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-foreground">{isArabic ? 'أوقات الذروة للحجوزات' : 'Peak Booking Time Slots'}</h3>
            </div>
            <div className="space-y-2.5">
              {topSlots.slice(0, 6).map(({ slot, count }) => (
                <div key={slot} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <span className="font-bold font-mono text-foreground">{fmtSlot(slot)}</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-black border border-amber-500/30 font-mono">
                    {count} {isArabic ? 'حجز' : 'bookings'}
                  </span>
                </div>
              ))}
              {topSlots.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{isArabic ? 'لا توجد بيانات' : 'No data yet'}</p>}
            </div>
          </Card>
        </div>
      )}

      {/* ─── SUBSCRIPTIONS & PAYMENTS TAB ─── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: isArabic ? 'اشتراكات مدفوعة (MRR)' : 'Paid VIP Subscriptions (MRR)', value: `EGP ${fmt(paidMRR)}`, sub: `${paidVipUsers.length} ${isArabic ? 'مشترك' : 'subscribers'}`, color: 'text-emerald-400', border: 'border-emerald-500/30' },
              { label: isArabic ? 'إجمالي إيرادات الحجوزات' : 'Total Booking Revenue', value: `EGP ${fmt(grossRevenue)}`, sub: `${confirmed.length} ${isArabic ? 'مباراة مؤكدة' : 'confirmed games'}`, color: 'text-primary', border: 'border-primary/30' },
              { label: isArabic ? 'خصومات VIP المدفوعة للملاعب' : 'VIP Discounts Paid to Pitches', value: `EGP ${fmt(totalVipDiscounts)}`, sub: isArabic ? 'يُدفع من المنصة' : 'Platform subsidy cost', color: 'text-rose-400', border: 'border-rose-500/30' },
              { label: isArabic ? 'صافي أرباح المنصة' : 'Net Platform Profit', value: `EGP ${fmt(netProfit)}`, sub: isArabic ? 'بعد سداد خصومات الملاعب' : 'After reimbursements', color: 'text-amber-400', border: 'border-amber-500/30' },
            ].map((k, i) => (
              <Card key={i} className={`stadium-glass ${k.border} rounded-2xl p-5 bg-black space-y-2`}>
                <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{k.label}</p>
                <p className={`text-2xl font-black font-mono ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{k.sub}</p>
              </Card>
            ))}
          </div>

          {/* Pitch Reimbursement Ledger */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-foreground">{isArabic ? 'مستحقات الملاعب من خصومات VIP' : 'Pitch VIP Discount Reimbursement Ledger'}</h3>
              </div>
              <div className="flex gap-3 text-xs font-bold">
                <span className="text-amber-400">{isArabic ? 'معلق:' : 'Pending:'} EGP {fmt(pendingReimbursements)}</span>
                <span className="text-emerald-400">{isArabic ? 'تم تسوية:' : 'Settled:'} EGP {fmt(settledReimbursements)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {pitches.map(p => {
                const pB = confirmed.filter(b => b.pitchId === p.id);
                const pRev = pB.reduce((s, b) => s + (b.totalAmount || 0), 0);
                const pDisc = pB.reduce((s, b) => s + (b.discountAmount || 0), 0);
                const pPend = pB.filter(b => b.reimbursementStatus === 'pending').reduce((s, b) => s + (b.discountAmount || 0), 0);
                return (
                  <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'الملعب' : 'Pitch'}</p><p className="font-black text-foreground">{p.name}</p></div>
                    <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'إجمالي الإيرادات' : 'Revenue'}</p><p className="font-mono font-black text-primary">EGP {fmt(pRev)}</p></div>
                    <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'خصومات VIP' : 'VIP Discounts'}</p><p className="font-mono font-black text-amber-400">EGP {fmt(pDisc)}</p></div>
                    <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'معلق للتسوية' : 'Pending Payout'}</p><p className="font-mono font-black text-rose-400">EGP {fmt(pPend)}</p></div>
                  </div>
                );
              })}
              {pitches.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">{isArabic ? 'لا توجد ملاعب مسجلة' : 'No pitches registered'}</p>}
            </div>
          </Card>

          {/* Paid Subscriber List */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-black text-foreground">{isArabic ? 'قائمة المشتركين المدفوعين' : 'Paid VIP Subscriber List'}</h3>
              <span className="ms-auto px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black">{paidVipUsers.length}</span>
            </div>
            {paidVipUsers.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">{isArabic ? 'لا يوجد مشتركون مدفوعون حتى الآن' : 'No paid subscribers yet'}</p>
            ) : (
              <div className="space-y-2">
                {paidVipUsers.map(u => (
                  <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <div>
                      <p className="font-black text-foreground">{u.name}</p>
                      <p className="text-muted-foreground font-mono">{u.email || u.phone || '—'}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-black text-emerald-400">EGP 399 / mo</p>
                      {u.vipExpiry && <p className="text-muted-foreground">{isArabic ? 'تنتهي:' : 'Expires:'} {new Date(u.vipExpiry).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ─── GIFTED VIPs TAB ─── */}
      {activeTab === 'vipgifts' && (
        <div className="space-y-6">
          {/* Gift Cost Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="stadium-glass border-amber-500/30 rounded-3xl p-6 bg-black space-y-2">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
                <span>{isArabic ? 'عدد هدايا VIP' : 'Gifted VIP Count'}</span>
                <Gift className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-400 font-mono">{giftedVipUsers.length}</p>
              <p className="text-[10px] text-muted-foreground">{isArabic ? 'أشخاص تم منحهم VIP مجاناً' : 'Users given free VIP by owner'}</p>
            </Card>
            <Card className="stadium-glass border-rose-500/30 rounded-3xl p-6 bg-black space-y-2">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
                <span>{isArabic ? 'تكلفة الفرصة الضائعة / شهر' : 'Opportunity Cost / Month'}</span>
                <DollarSign className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-3xl font-black text-rose-400 font-mono">EGP {fmt(giftedCostPerMonth)}</p>
              <p className="text-[10px] text-muted-foreground">{isArabic ? 'إيراد لو دفعوا بدل مجاناً' : 'Revenue foregone vs. paid plan'}</p>
            </Card>
            <Card className="stadium-glass border-violet-500/30 rounded-3xl p-6 bg-black space-y-2">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
                <span>{isArabic ? 'Owner & Admin (تلقائي VIP)' : 'Owner & Admin Auto-VIP'}</span>
                <Crown className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-3xl font-black text-violet-400 font-mono">{ownerAdminVip.length}</p>
              <p className="text-[10px] text-muted-foreground">{isArabic ? 'مجاني دائماً حسب الصلاحية' : 'Free permanently by role'}</p>
            </Card>
          </div>

          {/* Gifted VIP User List */}
          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Gift className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-foreground">{isArabic ? 'قائمة من مُنحوا VIP مجاناً من المالك' : 'Users Given Free VIP by Owner'}</h3>
            </div>
            {giftedVipUsers.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">{isArabic ? 'لم تمنح VIP مجاناً لأي شخص حتى الآن' : 'No gifted VIP members yet. Use Manage Players to grant free VIP to friends.'}</p>
            ) : (
              <div className="space-y-2">
                {giftedVipUsers.map(u => {
                  const expiry = u.vipExpiry ? new Date(u.vipExpiry) : null;
                  const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / 86400000) : null;
                  return (
                    <div key={u.uid} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                      <div>
                        <p className="font-black text-foreground flex items-center gap-1.5">
                          <Crown className="w-3 h-3 text-amber-400" /> {u.name}
                        </p>
                        <p className="text-muted-foreground font-mono">{u.email || u.phone || '—'}</p>
                      </div>
                      <div className="text-end">
                        <p className="text-amber-400 font-black">{isArabic ? 'مجاناً (هدية)' : 'Free Gift 👑'}</p>
                        <p className="text-muted-foreground">
                          {daysLeft !== null
                            ? daysLeft > 0 ? `${daysLeft} ${isArabic ? 'يوم متبقي' : 'days left'}` : (isArabic ? 'منتهية' : 'Expired')
                            : '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ─── PITCHES TAB ─── */}
      {activeTab === 'pitches' && (
        <div className="space-y-4">
          {pitches.map(p => {
            const pB = confirmed.filter(b => b.pitchId === p.id);
            const pRev = pB.reduce((s, b) => s + (b.totalAmount || 0), 0);
            const pDisc = pB.reduce((s, b) => s + (b.discountAmount || 0), 0);
            return (
              <Card key={p.id} className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-black text-foreground text-lg">{p.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{p.locationName} • {p.pricePerHour} EGP/hr • {isArabic ? 'مدير:' : 'Mgr:'} {p.managerName || p.adminEmail || '—'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black">
                    {pB.length} {isArabic ? 'حجوزات مؤكدة' : 'confirmed bookings'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'إيرادات الحجوزات' : 'Booking Revenue'}</p><p className="font-mono font-black text-primary text-base">EGP {fmt(pRev)}</p></div>
                  <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'خصومات VIP مستحقة' : 'VIP Discount Owed'}</p><p className="font-mono font-black text-amber-400 text-base">EGP {fmt(pDisc)}</p></div>
                  <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'متوسط الإيراد / حجز' : 'Avg Revenue / Booking'}</p><p className="font-mono font-black text-foreground text-base">EGP {pB.length ? fmt(Math.round(pRev / pB.length)) : 0}</p></div>
                  <div><p className="text-muted-foreground font-bold mb-1">{isArabic ? 'هامش بعد الخصومات' : 'Net After Discounts'}</p><p className="font-mono font-black text-emerald-400 text-base">EGP {fmt(pRev - pDisc)}</p></div>
                </div>
              </Card>
            );
          })}
          {pitches.length === 0 && <p className="text-center text-muted-foreground py-8">{isArabic ? 'لا توجد ملاعب مسجلة' : 'No pitches registered yet'}</p>}
        </div>
      )}

      {/* ─── AI USAGE TAB ─── */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="stadium-glass border-violet-500/30 rounded-3xl p-6 bg-black space-y-2">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
                <span>{isArabic ? 'طلبات AI (كوتشينج)' : 'AI Coach Requests'}</span>
                <Bot className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-3xl font-black text-violet-400 font-mono">{fmt(totalAiRequests)}</p>
              <p className="text-[10px] text-muted-foreground">{isArabic ? 'إجمالي المحادثات مع الكوتش' : 'Total AI coaching sessions'}</p>
            </Card>
            <Card className="stadium-glass border-blue-500/30 rounded-3xl p-6 bg-black space-y-2">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
                <span>{isArabic ? 'إجمالي الـ Tokens المستخدمة' : 'Total Tokens Consumed'}</span>
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-blue-400 font-mono">{fmt(totalAiTokens)}</p>
              <p className="text-[10px] text-muted-foreground">{isArabic ? 'تقريبي بناءً على سجلات الطلبات' : 'Approximate from logged requests'}</p>
            </Card>
            <Card className="stadium-glass border-rose-500/30 rounded-3xl p-6 bg-black space-y-2">
              <div className="flex justify-between items-center text-muted-foreground text-xs font-extrabold uppercase">
                <span>{isArabic ? 'التكلفة التقديرية للـ API' : 'Estimated API Cost'}</span>
                <DollarSign className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-3xl font-black text-rose-400 font-mono">${estimatedAiCost.toFixed(4)}</p>
              <p className="text-[10px] text-muted-foreground">≈ $0.002 / 1k tokens</p>
            </Card>
          </div>

          <Card className="stadium-glass border-white/10 rounded-3xl p-6 bg-black space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Bot className="w-5 h-5 text-violet-400" />
              <h3 className="font-black text-foreground">{isArabic ? 'ملاحظات حول تتبع تكاليف AI' : 'AI Cost Tracking Notes'}</h3>
            </div>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p className="p-3 rounded-xl bg-white/5 border border-white/10 leading-relaxed font-medium">
                {isArabic
                  ? 'يتم تتبع طلبات الكوتش عبر مجموعة aiLogs في Firestore. لكل طلب يُحفظ عدد الـ tokens المستهلكة مع وقت الطلب وهوية المستخدم. التكلفة محسوبة بناءً على معدل $0.002 لكل 1000 token كمرجع تقديري.'
                  : 'AI coaching requests are tracked via the aiLogs Firestore collection. Each request logs tokens consumed, timestamp, and user ID. Cost is estimated at $0.002/1k tokens as a reference rate for Google Gemini Flash API calls.'}
              </p>
              <p className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 leading-relaxed font-medium text-violet-300">
                {isArabic
                  ? 'لتفعيل التتبع الكامل: تأكد أن API endpoint الخاص بالكوتش يكتب مستنداً في aiLogs بحقل tokens لكل طلب.'
                  : 'To enable full tracking: ensure the AI coach API endpoint writes a document to aiLogs with a tokens field on every request.'}
              </p>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
