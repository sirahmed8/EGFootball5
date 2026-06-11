import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-16 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href={`/${locale}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl md:text-5xl font-black">Terms of Service</h1>
      </div>
      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-lg">
        <p>Last Updated: October 2026</p>
        <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing or using EGFootball5, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
        
        <h2 className="text-2xl font-bold text-foreground">2. User Accounts</h2>
        <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</p>
        
        <h2 className="text-2xl font-bold text-foreground">3. Bookings and Payments</h2>
        <p>All bookings are subject to availability and confirmation by the pitch owner. Deposits must be paid as specified, and failure to do so may result in cancellation of your booking.</p>
        
        <h2 className="text-2xl font-bold text-foreground">4. Platform Rules</h2>
        <p>Users must conduct themselves respectfully. Any abuse of the booking system, including creating fake bookings, will result in account termination.</p>
      </div>
    </div>
  );
}
