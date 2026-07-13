'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { Booking, Pitch } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { submitReceipt } from '@/lib/firebase/booking';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { MapPin, Calendar, Clock, CreditCard, Shield, Users, FileText } from 'lucide-react';
import { CheckoutPageSkeleton } from '@/components/skeletons/PageSkeletons';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const typeParam = searchParams.get('type') || 'private';
  const peopleParam = parseInt(searchParams.get('people') || '10') || 10;
  
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const t = useTranslations('Checkout');
  const tBook = useTranslations('Book');
  const tErrors = useTranslations('Errors');
  const locale = useLocale();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const bookingType = booking?.bookingType || typeParam;
  const numPeople = booking?.numPeople || peopleParam;
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); 

  useEffect(() => {
    if (!bookingId) {
      router.push('/book');
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'bookings', bookingId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Booking;
        
        // Security Check: Ensure booking belongs to the current logged-in user
        if (firebaseUser && data.userId !== firebaseUser.uid) {
          toast.error(locale === 'ar' ? 'وصول غير مصرح به لهذا الحجز' : 'Unauthorized access to this booking');
          router.push('/book');
          return;
        }

        setBooking(data);
        if (data.status !== 'locked_temporary') {
          if (data.status === 'pending_review' || data.status === 'confirmed') {
            router.push('/book'); 
          }
        }
      } else {
        toast.error(locale === 'ar' ? 'الحجز غير موجود أو منتهي الصلاحية' : 'Booking not found or expired');
        router.push('/book');
      }
    });

    return () => unsubscribe();
  }, [bookingId, router, firebaseUser, locale]);

  useEffect(() => {
    if (!booking) return;

    const fetchPitch = async () => {
      try {
        const pitchSnap = await getDoc(doc(db, 'pitches', booking.pitchId));
        if (pitchSnap.exists()) {
          setPitch(pitchSnap.data() as Pitch);
        }
      } catch (err) {
        console.error("Error fetching pitch:", err);
      }
    };

    fetchPitch();
  }, [booking]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!booking || !booking.lockedUntil) return;
    
    const lockedUntil = booking.lockedUntil;
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((lockedUntil - now) / 1000);
      if (diff <= 0) {
        clearInterval(timer);
        toast.error(locale === 'ar' ? 'انتهت صلاحية الحجز المؤقت الخاص بك.' : 'Your temporary lock has expired.');
        router.push('/book');
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking?.lockedUntil, router, locale]);

  const handleUpload = async () => {
    if (!file || !firebaseUser || !bookingId) return;

    setUploading(true);
    setProgress(0);

    try {
      // 1. Create a unique path in Firebase Storage
      const storageRef = ref(storage, `receipts/${bookingId}_${file.name}`);
      
      // 2. Start upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(prog);
        }, 
        (error) => {
          toast.error((locale === 'ar' ? 'فشل الرفع: ' : 'Upload failed: ') + error.message);
          setUploading(false);
        }, 
        async () => {
          try {
            // 3. Get download URL and update booking
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await submitReceipt(bookingId, downloadURL, firebaseUser.uid);
            toast.success(locale === 'ar' ? 'تم رفع الإيصال بنجاح! بانتظار مراجعة المسؤول.' : 'Receipt uploaded successfully! Awaiting admin review.');
            router.push('/profile');
          } catch (compErr: unknown) {
            const err = compErr as Error;
            toast.error((locale === 'ar' ? 'خطأ في حفظ الإيصال: ' : 'Error saving receipt: ') + err.message);
            setUploading(false);
          }
        }
      );
    } catch (error: unknown) {
      const err = error as Error;
      let errMsg = err.message;
      if (err.message && err.message.startsWith('ERROR_')) {
        try {
          errMsg = tErrors(err.message);
        } catch {
          // fallback
        }
      } else {
        errMsg = (locale === 'ar' ? 'فشل إرسال الإيصال: ' : 'Failed to submit receipt: ') + err.message;
      }
      toast.error(errMsg);
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimeSlot = (slot: number) => {
    const hour = Math.floor(slot);
    const mins = slot % 1 === 0 ? '00' : '30';
    const ampm = hour >= 12 && hour < 24 ? (locale === 'ar' ? 'م' : 'PM') : (locale === 'ar' ? 'ص' : 'AM');
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  if (authLoading || !booking) {
    return <CheckoutPageSkeleton />;
  }

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
      
      {/* Left Panel: Booking & Pitch Summary */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="bg-card border-border backdrop-blur-xl shadow-xl overflow-hidden hover:border-primary/20 transition-all duration-300">
          <CardHeader className="bg-primary/5 border-b border-border p-5">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <span>🏟️</span> {pitch?.name || tBook('title')}
            </CardTitle>
            {pitch?.locationName && (
              <CardDescription className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                <MapPin className="w-4 h-4 text-primary" /> {pitch.locationName}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-6 text-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Date</span>
                </div>
                <strong className="text-foreground">{booking.date}</strong>
              </div>

              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Time & Duration</span>
                </div>
                <strong className="text-foreground">
                  {formatTimeSlot(booking.timeSlot)} ({booking.duration} hr)
                </strong>
              </div>

              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Booking Type</span>
                </div>
                <strong className="text-foreground capitalize">
                  {bookingType} ({numPeople} Players)
                </strong>
              </div>

              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Estimated / Player</span>
                </div>
                <strong className="text-primary font-black">
                  {(booking.totalAmount / numPeople).toFixed(2)} EGP
                </strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Total Amount:</span>
                <span className="font-semibold text-foreground">{booking.totalAmount} EGP</span>
              </div>
              <div className="flex justify-between items-center text-foreground font-bold text-lg pt-1 border-t border-border/30">
                <span>Required Deposit:</span>
                <span className="text-primary">{booking.depositAmount} EGP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security / Expiration Warning */}
        <Card className="bg-destructive/5 border-destructive/20 text-destructive-foreground p-4 flex gap-3 rounded-xl animate-pulse">
          <Shield className="w-6 h-6 text-destructive flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-destructive">Secure Lock Policy</h4>
            <p className="opacity-85 mt-1 leading-relaxed">
              This slot is temporarily locked exclusively for you. You must upload a payment receipt within the timer or the slot will be auto-released for other players.
            </p>
          </div>
        </Card>
      </div>

      {/* Right Panel: Payment Upload Form */}
      <div className="lg:col-span-7">
        <Card className="w-full bg-card border-border backdrop-blur-xl shadow-xl hover:border-primary/20 transition-all duration-300">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-card-foreground font-black">{t('title')}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              {t('timerInfo')} <span className="text-primary font-black text-lg bg-primary/10 px-3 py-1 rounded-full ml-1 border border-primary/20 shadow-[0_0_15px_rgba(57,255,20,0.15)]">{formatTime(timeLeft)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-3">
              <h3 className="text-foreground font-bold flex items-center gap-1.5">
                <span>💰</span> {t('paymentDetails')}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('transferInfo')} <strong className="text-primary">{booking.depositAmount} EGP</strong> {t('secureInfo')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-background/50 border border-border/50 rounded-lg text-xs space-y-1">
                  <span className="text-muted-foreground block font-semibold">Vodafone Cash</span>
                  <strong className="text-foreground text-sm font-mono">{pitch?.recipient || "01012345678"}</strong>
                </div>
                <div className="p-3 bg-background/50 border border-border/50 rounded-lg text-xs space-y-1">
                  <span className="text-muted-foreground block font-semibold">Instapay Address</span>
                  <strong className="text-foreground text-sm font-mono">egfootball5@instapay</strong>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-foreground font-bold text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> {t('uploadLabel')}
              </label>
              
              <div className="flex flex-col gap-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    setFile(selected);
                    if (selected) {
                      const objectUrl = URL.createObjectURL(selected);
                      setPreviewUrl(objectUrl);
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                  disabled={uploading}
                  className="w-full text-foreground file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer border border-dashed border-border p-3 rounded-xl hover:border-primary/50 transition-colors bg-background/20"
                />

                {/* File Preview */}
                {previewUrl && (
                  <div className="relative border border-border rounded-xl p-2 bg-background/40 max-w-xs mx-auto animate-in zoom-in-95 duration-300">
                    <p className="text-xs text-muted-foreground mb-1 text-center font-semibold">Selected Receipt Preview</p>
                    <div className="aspect-[3/4] relative w-full h-64 rounded-lg overflow-hidden">
                      <Image 
                        src={previewUrl} 
                        alt="Receipt Preview" 
                        fill 
                        sizes="(max-width: 500px) 100vw, 320px" 
                        className="object-cover" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground font-bold">
                    <span>Uploading receipt screenshot...</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.5)]" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button 
              className="w-full bg-primary text-black font-extrabold hover:bg-primary/90 shadow-[0_0_20px_rgba(57,255,20,0.25)] hover:shadow-[0_0_35px_rgba(57,255,20,0.4)] text-lg h-14 rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:scale-100 cursor-pointer" 
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? t('uploading') : t('submitBtn')}
            </Button>
          </CardFooter>
        </Card>
      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 mt-12">
      <Suspense fallback={<CheckoutPageSkeleton />}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
