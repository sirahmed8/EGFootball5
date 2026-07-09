'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Booking, Pitch, User as AppUser } from '@/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, DollarSign, Users, CalendarCheck, MapPin } from 'lucide-react';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { appUser, loading } = useAuthStore();
  const t = useTranslations('OwnerUsers'); // Fallback to OwnerUsers translations for now

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && appUser?.role !== 'owner') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    if (appUser?.role !== 'owner') return;

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(doc => doc.data() as Booking));
    });

    const unsubPitches = onSnapshot(collection(db, 'pitches'), (snapshot) => {
      setPitches(snapshot.docs.map(doc => doc.data() as Pitch));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as AppUser));
      setFetching(false);
    });

    return () => {
      unsubBookings();
      unsubPitches();
      unsubUsers();
    };
  }, [appUser]);

  if (loading || appUser?.role !== 'owner' || fetching) {
    return <div className="p-8 text-center text-foreground">Loading...</div>;
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12">
      <div>
        <h1 className="text-4xl font-black text-foreground">Global Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of all pitches, users, and system revenue.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">EGP {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            <CalendarCheck className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{confirmedBookings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Users</CardTitle>
            <Users className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pitches</CardTitle>
            <MapPin className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{pitches.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-xl border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest confirmed matches across all pitches.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {confirmedBookings.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5).map(b => (
                <div key={b.id} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <div className="font-semibold text-foreground">{pitches.find(p => p.id === b.pitchId)?.name || 'Unknown Pitch'}</div>
                    <div className="text-sm text-muted-foreground">{b.date} • {b.duration}h</div>
                  </div>
                  <div className="font-bold text-primary">EGP {b.totalAmount}</div>
                </div>
              ))}
              {confirmedBookings.length === 0 && (
                <div className="text-center text-muted-foreground">No recent bookings</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
