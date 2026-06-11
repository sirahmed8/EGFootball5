import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-16 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href={`/${locale}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl md:text-5xl font-black">Privacy Policy</h1>
      </div>
      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-lg">
        <p>Last Updated: October 2026</p>
        <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or book a pitch.</p>
        
        <h2 className="text-2xl font-bold text-foreground">2. How We Use Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, as well as to process your bookings and transactions.</p>
        
        <h2 className="text-2xl font-bold text-foreground">3. Information Sharing</h2>
        <p>We may share your information with pitch owners and admins solely for the purpose of fulfilling your booking requests.</p>
        
        <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
        <p>We implement robust security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
      </div>
    </div>
  );
}
