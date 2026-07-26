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
import { Input } from '@/components/ui/input';
import { Activity, DollarSign, Users, CalendarCheck, MapPin, Sparkles, Plus, Trash2 } from 'lucide-react';
import { DashboardPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { toast } from 'sonner';

interface CityItem {
  value: string;
  labelEn: string;
  labelAr: string;
}

const DEFAULT_CITIES: CityItem[] = [
  { value: 'obour', labelEn: 'Obour City', labelAr: 'مدينة العبور' },
  { value: 'new_cairo', labelEn: 'New Cairo', labelAr: 'القاهرة الجديدة' },
  { value: 'shorouk', labelEn: 'El Shorouk', labelAr: 'الشروق' },
  { value: 'october', labelEn: '6th October', labelAr: '6 أكتوبر' },
];

function CityManagementCard() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [cities, setCities] = useState<CityItem[]>(DEFAULT_CITIES);
  const [newEn, setNewEn] = useState('');
  const [newAr, setNewAr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCities() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'cities'));
        if (snap.exists() && snap.data().list) {
          setCities(snap.data().list);
        }
      } catch (err) {
        console.warn('Error fetching cities:', err);
      }
    }
    fetchCities();
  }, []);

  const handleAddCity = async () => {
    if (!newEn.trim() || !newAr.trim()) {
      toast.error(isArabic ? 'يرجى إدخال اسم المدينة بالإنجليزية والعربية' : 'Please enter city name in English & Arabic');
      return;
    }

    const valueKey = newEn.trim().toLowerCase().replace(/\s+/g, '_');
    if (cities.some((c) => c.value === valueKey)) {
      toast.error(isArabic ? 'هذه المدينة مضافة بالفعل' : 'This city is already added');
      return;
    }

    const updated = [...cities, { value: valueKey, labelEn: newEn.trim(), labelAr: newAr.trim() }];
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'cities'), { list: updated });
      setCities(updated);
      setNewEn('');
      setNewAr('');
      toast.success(isArabic ? 'تمت إضافة المدينة بنجاح!' : 'City added successfully!');
    } catch (err) {
      console.error('Failed to save city:', err);
      toast.error(isArabic ? 'فشل حفظ المدينة' : 'Failed to add city');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCity = async (value: string) => {
    const updated = cities.filter((c) => c.value !== value);
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'cities'), { list: updated });
      setCities(updated);
      toast.success(isArabic ? 'تم حذف المدينة' : 'City removed');
    } catch (err) {
      console.error('Failed to delete city:', err);
      toast.error(isArabic ? 'فشل حذف المدينة' : 'Failed to delete city');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-card border border-border rounded-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-black">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span>{isArabic ? 'إدارة المدن والمناطق (قائمة البحث)' : 'Manage Platform Cities (Search Dropdown)'}</span>
        </CardTitle>
        <CardDescription className="text-xs font-medium">
          {isArabic
            ? 'أضف أو احذف المدن المتاحة في فلاتر البحث للمستخدمين على الصفحة الرئيسية'
            : 'Add or remove available cities in the user search filter dropdown'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add City Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            placeholder={isArabic ? 'اسم المدينة (English)' : 'City Name (English)'}
            className="bg-background border-border text-xs rounded-xl"
          />
          <Input
            value={newAr}
            onChange={(e) => setNewAr(e.target.value)}
            placeholder={isArabic ? 'اسم المدينة (عربي)' : 'City Name (Arabic)'}
            className="bg-background border-border text-xs rounded-xl"
          />
          <Button
            onClick={handleAddCity}
            disabled={saving}
            className="bg-primary text-black font-extrabold hover:bg-primary/90 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة مدينة' : 'Add City'}</span>
          </Button>
        </div>

        {/* Existing Cities List */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {isArabic ? 'المدن الحالية في الفلتر:' : 'Active Cities in Filter:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cities.map((city) => (
              <div
                key={city.value}
                className="flex items-center justify-between p-3 rounded-2xl bg-background/80 border border-border text-xs font-bold"
              >
                <div>
                  <span className="text-foreground">{isArabic ? city.labelAr : city.labelEn}</span>
                  <span className="text-muted-foreground ms-2 text-[10px]">({city.value})</span>
                </div>
                <button
                  onClick={() => handleDeleteCity(city.value)}
                  disabled={saving}
                  className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete City"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
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
        <Card className="bg-card border border-border rounded-3xl shadow-xl hover:border-primary/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              {t('totalRevenue')}
            </CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary font-mono">EGP {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border rounded-3xl shadow-xl hover:border-primary/50 transition-all">
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

        <Card className="bg-card border border-border rounded-3xl shadow-xl hover:border-primary/50 transition-all">
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

        <Card className="bg-card border border-border rounded-3xl shadow-xl hover:border-primary/50 transition-all">
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
        <Card className="bg-card border border-border rounded-3xl shadow-xl">
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
                    className="flex justify-between items-center pb-4 border-b border-border/50 last:border-0 last:pb-0"
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

        {/* Dynamic City Management for Owner */}
        <CityManagementCard />
      </div>
    </div>
  );
}
