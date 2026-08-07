'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
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
import {
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Users,
  FileText,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { CheckoutPageSkeleton } from '@/components/skeletons/PageSkeletons';
import imageCompression from 'browser-image-compression';
import { CountdownTimer } from '@/components/CountdownTimer';

function DynamicMatchQrCode({ value }: { value: string }) {
  return (
    <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border border-border shadow-inner flex items-center justify-center">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(value)}&color=090d16`}
        alt="Match QR Code"
        width={150}
        height={150}
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      />
    </div>
  );
}

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
  const isArabic = locale === 'ar';

  const [booking, setBooking] = useState<Booking | null>(null);
  const bookingType = booking?.bookingType || typeParam;
  const numPeople = booking?.numPeople || peopleParam;
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [copiedVodafone, setCopiedVodafone] = useState(false);
  const [copiedInstapay, setCopiedInstapay] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      router.push('/book');
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'bookings', bookingId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Booking;

        if (firebaseUser && data.userId !== firebaseUser.uid) {
          toast.error(t('unauthorized'));
          router.push('/book');
          return;
        }

        setBooking(data);
        if (data.status !== 'locked_temporary') {
          if (data.status === 'pending_review' || data.status === 'confirmed') {
            router.push('/profile');
          }
        }
      } else {
        toast.error(t('bookingNotFound'));
        router.push('/book');
      }
    });

    return () => unsubscribe();
  }, [bookingId, router, firebaseUser, isArabic, t]);


  useEffect(() => {
    if (!booking) return;

    const fetchPitch = async () => {
      try {
        const pitchSnap = await getDoc(doc(db, 'pitches', booking.pitchId));
        if (pitchSnap.exists()) {
          setPitch(pitchSnap.data() as Pitch);
        }
      } catch (err) {
        console.error('Error fetching pitch:', err);
      }
    };

    fetchPitch();
  }, [booking]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const copyToClipboard = (text: string, type: 'vodafone' | 'instapay') => {
    navigator.clipboard.writeText(text);
    if (type === 'vodafone') {
      setCopiedVodafone(true);
      setTimeout(() => setCopiedVodafone(false), 2000);
    } else {
      setCopiedInstapay(true);
      setTimeout(() => setCopiedInstapay(false), 2000);
    }
    toast.success(t('copiedText', { text }));
  };

  const handleUpload = async () => {
    if (!file || !firebaseUser || !bookingId) return;

    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `receipts/${bookingId}_${file.name}`);

      let uploadFile = file;
      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        uploadFile = await imageCompression(file, options);
      }

      const uploadTask = uploadBytesResumable(storageRef, uploadFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(prog);
        },
        (error) => {
          toast.error(t('uploadFailed') + error.message);
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await submitReceipt(bookingId, downloadURL, firebaseUser.uid);
            toast.success(t('receiptSuccess'));
            router.push('/profile');
          } catch (compErr: unknown) {
            const err = compErr as Error;
            toast.error(t('receiptSaveError') + err.message);
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
        errMsg = t('receiptSubmitFailed') + err.message;
      }
      toast.error(errMsg);
      setUploading(false);
    }
  };

  const formatTimeSlot = (slot: number) => {
    const hour = Math.floor(slot);
    const mins = slot % 1 === 0 ? '00' : '30';
    const ampm = hour >= 12 && hour < 24 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
    const modHour = hour % 12 || 12;
    return `${modHour}:${mins} ${ampm}`;
  };

  if (authLoading || !booking) {
    return <CheckoutPageSkeleton />;
  }

  const vodafoneNum = pitch?.recipient || '01012345678';
  const instapayAddress = 'egfootball5@instapay';

  return (
    <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Checkout Progress Stepper */}
      <div className="p-4 rounded-3xl stadium-glass border-white/10 shadow-xl flex items-center justify-around text-xs font-bold">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t('lockPitchStep')}</span>
        </div>
        <span className="text-white/20">→</span>
        <div className="flex items-center gap-2 text-primary font-black">
          <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px] shadow-sm">2</span>
          <span>{t('payDepositStep')}</span>
        </div>
        <span className="text-white/20">→</span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-5 h-5 rounded-full bg-white/10 text-muted-foreground flex items-center justify-center text-[10px]">3</span>
          <span>{t('instantConfirmStep')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Booking Ticket & Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 space-y-6"
        >
          <Card className="stadium-glass border-white/10 shadow-2xl overflow-hidden rounded-3xl">
            <CardHeader className="bg-primary/10 border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
                  <span>🏟️</span> {pitch?.name || tBook('title')}
                </CardTitle>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-mono font-black bg-primary text-black flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer shadow-lg glow-primary-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR PASS</span>
                </button>
              </div>
              {pitch?.locationName && (
                <CardDescription className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {pitch.locationName}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{t('dateLabel')}</span>
                  </div>
                  <strong className="text-foreground font-mono">{booking.date}</strong>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{t('timeSlotLabel')}</span>
                  </div>
                  <strong className="text-foreground font-bold">
                    {formatTimeSlot(booking.timeSlot)} ({booking.duration} hr)
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{t('matchTypeLabel')}</span>
                  </div>
                  <strong className="text-foreground capitalize font-bold">
                    {bookingType} ({numPeople} {t('players')})
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>{t('costPerPlayerLabel')}</span>
                  </div>
                  <strong className="text-primary font-black font-mono text-base">
                    {(booking.totalAmount / numPeople).toFixed(2)} EGP
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-muted-foreground text-xs">
                  <span>{t('totalPitchPriceLabel')}</span>
                  <span className="font-bold text-foreground font-mono">{booking.totalAmount} EGP</span>
                </div>
                <div className="flex justify-between items-center text-foreground font-bold text-base pt-2 border-t border-white/10">
                  <span>{t('requiredDepositLabel')}</span>
                  <span className="text-primary font-black font-mono text-xl">{booking.depositAmount} EGP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Panel: Payment Upload Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7"
        >
          <Card className="w-full bg-card border-border backdrop-blur-xl shadow-xl rounded-3xl">
            <CardHeader className="text-center pb-2 space-y-2">
              <CardTitle className="text-2xl font-black text-foreground">{t('title')}</CardTitle>
              <CardDescription className="text-muted-foreground text-sm font-medium">
                {t('timerInfo')} <CountdownTimer lockedUntil={booking.lockedUntil} />
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="bg-muted/30 p-5 rounded-2xl border border-border space-y-4">
                <h3 className="text-foreground font-extrabold flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>💰</span> {t('paymentDetails')}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('secureTransfer')}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Vodafone Cash */}
                  <div className="p-4 bg-background/70 border border-border rounded-2xl text-xs space-y-2">
                    <span className="text-muted-foreground block font-bold">Vodafone Cash (فودافون كاش)</span>
                    <div className="flex items-center justify-between">
                      <strong className="text-foreground text-base font-mono font-black" dir="ltr">{vodafoneNum}</strong>
                      <button
                        onClick={() => copyToClipboard(vodafoneNum, 'vodafone')}
                        className="p-2 rounded-xl bg-muted/60 hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Copy Number"
                      >
                        {copiedVodafone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* InstaPay */}
                  <div className="p-4 bg-background/70 border border-border rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground block font-bold">InstaPay (إنستا باي)</span>
                      <a
                        href="instapay://"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <span>{t('openApp')}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <strong className="text-foreground text-xs font-mono font-bold truncate" dir="ltr">{instapayAddress}</strong>
                      <button
                        onClick={() => copyToClipboard(instapayAddress, 'instapay')}
                        className="p-2 rounded-xl bg-muted/60 hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 transition-colors cursor-pointer shrink-0 ms-1"
                        title="Copy Address"
                      >
                        {copiedInstapay ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload Box */}
              <div className="space-y-3">
                <label className="block text-foreground font-extrabold text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> {t('uploadLabel')}
                </label>

                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const selected = e.target.files?.[0] || null;
                      setFile(selected);
                      if (selected && selected.type.startsWith('image/')) {
                        setPreviewUrl(URL.createObjectURL(selected));
                      } else {
                        setPreviewUrl(null);
                      }
                    }}
                    disabled={uploading}
                    className="w-full text-foreground file:me-4 file:py-2.5 file:px-5 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-black hover:file:bg-primary/90 cursor-pointer border border-dashed border-border p-4 rounded-3xl hover:border-primary/50 transition-colors bg-background/20"
                  />

                  {previewUrl && (
                    <div className="border border-border rounded-2xl p-3 bg-background/40 max-w-xs mx-auto text-center space-y-2">
                      <p className="text-xs text-muted-foreground font-bold">
                        {t('receiptPreview')}
                      </p>
                      <div className="aspect-[3/4] relative w-full h-60 rounded-xl overflow-hidden border border-border">
                        <Image src={previewUrl} alt="Receipt Preview" fill className="object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground font-bold">
                      <span>{t('uploadingReceipt')}</span>
                      <span className="font-mono">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <Button
                className="w-full bg-primary text-black font-black hover:bg-primary/90 shadow-[0_0_25px_rgba(57,255,20,0.3)] text-lg h-14 rounded-2xl transition-all cursor-pointer"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? t('uploading') : t('submitBtn')}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Dynamic SVG QR Pass Lightbox Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto">
              <QrCode className="w-8 h-8 text-primary" />
            </div>

            <h3 className="text-xl font-black text-foreground">
              {t('digitalPassTitle')}
            </h3>

            <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
              <DynamicMatchQrCode value={booking.id} />
              <p className="font-bold text-xs font-mono text-primary pt-1">MATCH PASS ID: #{booking.id.toUpperCase().slice(0, 10)}</p>
            </div>

            <p className="text-xs text-muted-foreground font-medium">
              {t('printPassInstructions')}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 border-border rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('printPass')}</span>
              </Button>
              <Button
                onClick={() => setShowQrModal(false)}
                className="flex-1 bg-primary text-black font-bold rounded-xl text-xs cursor-pointer"
              >
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 mt-10">
      <Suspense fallback={<CheckoutPageSkeleton />}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
