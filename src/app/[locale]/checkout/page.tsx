'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Booking } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { submitReceipt } from '@/lib/firebase/booking';
import { useTranslations } from 'next-intl';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { firebaseUser } = useAuthStore();
  const t = useTranslations('Checkout');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [file, setFile] = useState<File | null>(null);
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
        setBooking(data);
        if (data.status !== 'locked_temporary') {
           if (data.status === 'pending_review' || data.status === 'confirmed') {
             router.push('/book'); 
           }
        }
      } else {
        toast.error('Booking not found or expired');
        router.push('/book');
      }
    });

    return () => unsubscribe();
  }, [bookingId, router]);

  useEffect(() => {
    if (!booking || !booking.lockedUntil) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((booking.lockedUntil! - now) / 1000);
      if (diff <= 0) {
        clearInterval(timer);
        toast.error('Your temporary lock has expired.');
        router.push('/book');
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking, router]);

  const handleUpload = async () => {
    if (!file || !firebaseUser || !bookingId) return;

    setUploading(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      if (!cloudName || cloudName === 'your-cloud-name') {
         throw new Error("Please set your NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local");
      }

      // 2. Upload to Cloudinary using FormData and XMLHttpRequest for progress
      // USING UNSIGNED UPLOAD FOR STATIC SITE
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'kickoff_preset');
      formData.append('folder', 'receipts');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const prog = (e.loaded / e.total) * 100;
          setProgress(prog);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          await submitReceipt(bookingId, response.secure_url);
          toast.success('Receipt uploaded successfully! Awaiting admin review.');
          router.push('/book');
        } else {
          toast.error('Failed to upload to Cloudinary. Make sure "kickoff_preset" exists and is unsigned.');
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        toast.error('Network error during upload');
        setUploading(false);
      };

      xhr.send(formData);

    } catch (error: any) {
      toast.error('Failed to submit receipt: ' + error.message);
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!booking) return <div className="p-8 text-center text-white">{t('loading')}</div>;

  return (
    <Card className="w-full max-w-lg bg-zinc-900/80 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-white text-center">{t('title')}</CardTitle>
        <CardDescription className="text-zinc-400 text-center">
          {t('timerInfo')} <span className="text-primary font-bold">{formatTime(timeLeft)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 space-y-2">
          <h3 className="text-white font-bold">{t('paymentDetails')}</h3>
          <p className="text-zinc-300 text-sm">{t('transferInfo')} <strong className="text-primary">{booking.depositAmount} EGP</strong> {t('secureInfo')}</p>
          <ul className="text-zinc-400 text-sm list-disc rtl:pr-4 ltr:pl-4 space-y-1 mt-2">
            <li>فودافون كاش: 01012345678</li>
            <li>إنستاباي: kickoff@instapay</li>
          </ul>
        </div>

        <div className="space-y-4">
          <label className="block text-zinc-300 font-medium">{t('uploadLabel')}</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
          />
          {uploading && (
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary text-black font-bold hover:bg-primary/90 shadow-[0_0_15px_rgba(57,255,20,0.3)]" 
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? t('uploading') : t('submitBtn')}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
