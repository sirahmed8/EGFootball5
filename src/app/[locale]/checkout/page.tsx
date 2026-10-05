'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { Booking, Pitch } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { submitReceipt } from '@/lib/firebase/booking';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2, Lock } from 'lucide-react';
import { CheckoutPageSkeleton } from '@/components/skeletons/PageSkeletons';
import imageCompression from 'browser-image-compression';
import { CountdownTimer } from '@/components/CountdownTimer';

import { CheckoutQrModal } from './components/CheckoutQrModal';
import { CheckoutTicketCard } from './components/CheckoutTicketCard';
import { PaymentMethodsCard } from './components/PaymentMethodsCard';
import { ReceiptUploadForm } from './components/ReceiptUploadForm';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const typeParam = searchParams.get('type') || 'private';
  const peopleParam = parseInt(searchParams.get('people') || '10') || 10;

  const { firebaseUser, loading: authLoading } = useAuthStore();
  const t = useTranslations('Checkout');
  const tErrors = useTranslations('Errors');
  const tForm = useTranslations('FormConsent');
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
  const [agreedToSlotPolicy, setAgreedToSlotPolicy] = useState(false);
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

  const handleUpload = async () => {
    if (!file || !firebaseUser || !bookingId) return;

    if (!agreedToSlotPolicy) {
      toast.error(tForm('slotHoldNotice'));
      return;
    }

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
      <div className="p-4 rounded-3xl bg-card border border-border shadow-xl flex items-center justify-around text-xs font-bold">
        <Link
          href={`/book?pitchId=${booking.pitchId}`}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group"
          title="Click to revisit pitch selection (releases current hold)"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="group-hover:underline">{t('lockPitchStep')}</span>
        </Link>
        <span className="text-muted-foreground/40">→</span>
        <div className="flex items-center gap-2 text-primary font-black">
          <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px] shadow-sm font-black">
            2
          </span>
          <span>{t('payDepositStep')}</span>
        </div>
        <span className="text-muted-foreground/40">→</span>
        <div
          className="flex items-center gap-2 text-muted-foreground opacity-70 cursor-not-allowed"
          title="Locked: Upload receipt to confirm"
        >
          <span className="w-5 h-5 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center text-[10px]">
            <Lock className="w-3 h-3 text-muted-foreground" />
          </span>
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
          <CheckoutTicketCard
            booking={booking}
            pitch={pitch}
            bookingType={bookingType}
            numPeople={numPeople}
            formatTimeSlot={formatTimeSlot}
            onOpenQrModal={() => setShowQrModal(true)}
          />
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
              <PaymentMethodsCard
                vodafoneNum={vodafoneNum}
                instapayAddress={instapayAddress}
              />
              <ReceiptUploadForm
                file={file}
                setFile={setFile}
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
                uploading={uploading}
                progress={progress}
                agreedToSlotPolicy={agreedToSlotPolicy}
                setAgreedToSlotPolicy={setAgreedToSlotPolicy}
                onUpload={handleUpload}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dynamic SVG QR Pass Lightbox Modal */}
      <CheckoutQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        bookingId={booking.id}
      />
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
