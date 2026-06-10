'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { collection, query, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Booking, User as AppUser } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { confirmBooking, rejectBooking } from '@/lib/firebase/booking';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

const formatTime = (block: number) => {
  const hour = Math.floor(block);
  const mins = block % 1 === 0 ? '00' : '30';
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const modHour = hour % 12 || 12;
  return `${modHour}:${mins} ${ampm}`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { appUser, firebaseUser, loading } = useAuthStore();
  const t = useTranslations('Admin');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersCache, setUsersCache] = useState<Record<string, AppUser>>({});
  const [pitch, setPitch] = useState<any>(null);
  const [editingPitch, setEditingPitch] = useState<any>(null);
  const [savingPitch, setSavingPitch] = useState(false);

  useEffect(() => {
    if (!loading && appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, loading, router]);

  useEffect(() => {
    if (appUser?.role !== 'admin' || !firebaseUser?.email) return;

    const fetchPitchAndBookings = async () => {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const pitchQ = query(collection(db, 'pitches'), where('adminEmail', '==', firebaseUser.email));
      const pitchSnap = await getDocs(pitchQ);
      
      if (pitchSnap.empty) {
        toast.error('No pitch assigned to this admin.');
        return;
      }
      
      const pitchData = pitchSnap.docs[0].data();
      setPitch(pitchData);
      setEditingPitch(pitchData);

      const q = query(collection(db, 'bookings'), where('pitchId', '==', pitchData.id));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const bks = snapshot.docs.map(doc => doc.data() as Booking);
        setBookings(bks);
        
        // Fetch user data for new users
        const newUsers = { ...usersCache };
        let updated = false;
        for (const bk of bks) {
          if (!newUsers[bk.userId]) {
            const userSnap = await getDoc(doc(db, 'users', bk.userId));
            if (userSnap.exists()) {
              newUsers[bk.userId] = userSnap.data() as AppUser;
              updated = true;
            }
          }
        }
        if (updated) setUsersCache(newUsers);
      });

      return unsubscribe;
    };

    let unsub: any;
    fetchPitchAndBookings().then(u => unsub = u);
    
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [appUser, firebaseUser]);

  if (loading || appUser?.role !== 'admin') {
    return <div className="p-8 text-center text-white">Authenticating...</div>;
  }

  const pendingReview = bookings.filter(b => b.status === 'pending_review');
  const revenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0);

  const handleApprove = async (booking: Booking) => {
    try {
      await confirmBooking(booking.id);
      
      // Update the day_schedule status
      const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
      const scheduleSnap = await getDoc(scheduleRef);
      if (scheduleSnap.exists()) {
        const slots = scheduleSnap.data().slots;
        const numBlocks = booking.duration * 2;
        for (let i = 0; i < numBlocks; i++) {
          const b = booking.timeSlot + (i * 0.5);
          if (slots[b.toString()]) {
             slots[b.toString()].status = 'confirmed';
          }
        }
        await updateDoc(scheduleRef, { slots });
      }
      toast.success('Booking confirmed');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleReject = async (booking: Booking) => {
    try {
      await rejectBooking(booking.id);

      // Free the slot in day_schedule
      const scheduleRef = doc(db, 'day_schedules', `${booking.pitchId}_${booking.date}`);
      const scheduleSnap = await getDoc(scheduleRef);
      if (scheduleSnap.exists()) {
        const slots = scheduleSnap.data().slots;
        const numBlocks = booking.duration * 2;
        for (let i = 0; i < numBlocks; i++) {
          const b = booking.timeSlot + (i * 0.5);
          if (slots[b.toString()] && slots[b.toString()].bookingId === booking.id) {
             delete slots[b.toString()];
          }
        }
        await updateDoc(scheduleRef, { slots });
      }

      toast.success('Booking rejected and slot freed');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getUserLoyalty = (userId: string) => {
    return bookings.filter(b => b.userId === userId && b.status === 'confirmed').length;
  };

  const handleUpdatePitch = async () => {
    if (!pitch) return;
    setSavingPitch(true);
    try {
      await updateDoc(doc(db, 'pitches', pitch.id), {
        name: editingPitch.name,
        pricePerHour: Number(editingPitch.pricePerHour),
        imagePreviewUrl: editingPitch.imagePreviewUrl,
        locationName: editingPitch.locationName,
        mapLink: editingPitch.mapLink
      });
      setPitch(editingPitch);
      toast.success('Pitch details updated successfully');
    } catch (e: any) {
      toast.error('Failed to update: ' + e.message);
    } finally {
      setSavingPitch(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-muted-foreground">{t('revenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">{revenue} EGP</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-muted-foreground">{t('pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">{pendingReview.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="bg-muted/50 border border-border mb-4 p-1 rounded-xl">
          <TabsTrigger value="verification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold rounded-lg">{t('verificationQueue')}</TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold rounded-lg">{t('liveSchedule')}</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold rounded-lg">Pitch Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verification">
          <Card className="bg-card/50 border-border backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('pendingReceipts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingReview.length === 0 ? (
                <p className="text-muted-foreground">{t('noPending')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingReview.map(booking => {
                    const user = usersCache[booking.userId];
                    const loyalty = getUserLoyalty(booking.userId);
                    return (
                    <div key={booking.id} className="border border-border rounded-xl p-4 bg-muted/30 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground text-lg">{booking.date}</p>
                          <p className="text-sm text-primary font-medium">{formatTime(booking.timeSlot)} ({booking.duration} hr)</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('amount')} {booking.totalAmount} EGP</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{user?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{user?.phone || 'No phone'}</p>
                          <p className="text-xs text-secondary font-bold mt-1">Loyalty: {loyalty} bookings</p>
                        </div>
                      </div>
                      {booking.receiptUrl ? (
                        <div className="aspect-[3/4] w-full relative rounded-lg overflow-hidden border border-border">
                          {/* We use standard img to avoid next.config remotePattern issues if not configured, or if configured, Image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={booking.receiptUrl} alt="Receipt" className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="h-48 bg-muted flex items-center justify-center rounded-lg text-muted-foreground">{t('noImage')}</div>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold" onClick={() => handleApprove(booking)}>{t('approve')}</Button>
                        <Button variant="destructive" onClick={() => handleReject(booking)} className="font-bold">{t('reject')}</Button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="bg-card/50 border-border backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('liveSchedule')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Player</TableHead>
                    <TableHead className="text-muted-foreground">{t('date')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('time')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const user = usersCache[booking.userId];
                    return (
                    <TableRow key={booking.id} className="border-border hover:bg-muted/50 text-foreground">
                      <TableCell className="font-medium">
                        {user?.name || 'Player'}
                        <div className="text-xs text-muted-foreground">{user?.phone}</div>
                      </TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{formatTime(booking.timeSlot)} ({booking.duration}h)</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'confirmed' ? 'bg-primary/20 text-primary border border-primary/20' :
                          booking.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                          'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {booking.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-card/50 border-border backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-card-foreground">Edit Pitch Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingPitch && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <Label>Pitch Name</Label>
                    <Input 
                      value={editingPitch.name} 
                      onChange={e => setEditingPitch({...editingPitch, name: e.target.value})} 
                      className="bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <Label>Price Per Hour (EGP)</Label>
                    <Input 
                      type="number"
                      value={editingPitch.pricePerHour} 
                      onChange={e => setEditingPitch({...editingPitch, pricePerHour: e.target.value})} 
                      className="bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <Label>Location Name</Label>
                    <Input 
                      value={editingPitch.locationName} 
                      onChange={e => setEditingPitch({...editingPitch, locationName: e.target.value})} 
                      className="bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <Label>Google Maps Link</Label>
                    <Input 
                      value={editingPitch.mapLink} 
                      onChange={e => setEditingPitch({...editingPitch, mapLink: e.target.value})} 
                      className="bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <Label>Profile Picture URL</Label>
                    <div className="flex gap-4 items-center">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            setSavingPitch(true);
                            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                            if (!cloudName) throw new Error("Cloudinary not configured");
                            
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('upload_preset', 'kickoff_preset');
                            formData.append('folder', 'pitches');

                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                              method: 'POST',
                              body: formData
                            });
                            
                            if (!res.ok) throw new Error("Upload failed");
                            const data = await res.json();
                            setEditingPitch({...editingPitch, imagePreviewUrl: data.secure_url});
                            toast.success('Image uploaded successfully');
                          } catch (err: any) {
                            toast.error(err.message);
                          } finally {
                            setSavingPitch(false);
                          }
                        }}
                        className="bg-card text-foreground flex-1 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                      />
                      {editingPitch.imagePreviewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editingPitch.imagePreviewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdatePitch} 
                    disabled={savingPitch}
                    className="w-full font-bold bg-primary text-primary-foreground"
                  >
                    {savingPitch ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
