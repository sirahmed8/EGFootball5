import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-16 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href={`/${locale}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl md:text-5xl font-black">Cookie Policy</h1>
      </div>
      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-lg">
        <p>Last Updated: October 2026</p>
        <h2 className="text-2xl font-bold text-foreground">1. What are Cookies?</h2>
        <p>Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.</p>
        
        <h2 className="text-2xl font-bold text-foreground">2. How EGFootball5 Uses Cookies</h2>
        <p>When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies to enable certain functions of the Service, to provide analytics, to store your preferences, and to enable authenticated sessions.</p>
        
        <h2 className="text-2xl font-bold text-foreground">3. Essential Cookies</h2>
        <p>Some cookies are essential for the operation of our platform. For example, we use cookies to keep you logged in securely while you browse our site.</p>
        
        <h2 className="text-2xl font-bold text-foreground">4. Your Choices Regarding Cookies</h2>
        <p>{"If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer."}</p>
      </div>
    </div>
  );
}
