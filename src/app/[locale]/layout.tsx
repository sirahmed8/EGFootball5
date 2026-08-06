import type { Metadata } from "next";
import { Geist, Cairo } from "next/font/google";
import "../globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { DesktopSidebar } from "@/components/SideMenu";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ClientChatWidget } from '@/components/ClientChatWidget';
import { MainContainer } from '@/components/MainContainer';
import { NextIntlClientProvider } from 'next-intl';

import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import ReactQueryProvider from '@/providers/ReactQueryProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const isArabic = locale === 'ar';
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
    title: t('title') || (isArabic ? 'EGFootball5 - حجز ملاعب خماسي بالعبور' : 'EGFootball5 - Pitch Booking Platform'),
    description: t('description') || (isArabic ? 'المنصة الأولى لحجز ملاعب الخماسي والمباريات العامة بمدينة العبور' : 'The #1 5-a-side football booking platform in Obour City'),
    manifest: '/manifest.json',
    icons: { icon: '/favicon.jpg' },
    openGraph: {
      title: 'EGFootball5 - 5-a-side Football Booking',
      description: 'Book turf pitches, organize public matches, and lock slots seamlessly in Obour City.',
      siteName: 'EGFootball5',
      images: [
        {
          url: '/favicon.jpg',
          width: 512,
          height: 512,
          alt: 'EGFootball5 Logo',
        },
      ],
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'EGFootball5 - Pitch Booking',
      description: 'The ultimate 5-a-side football platform in Obour City.',
      images: ['/favicon.jpg'],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'ar' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isRTL = locale === 'ar';
  const activeFontClass = isRTL ? cairo.className : geistSans.className;
  const fontVariables = `${geistSans.variable} ${cairo.variable}`;

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning className="bg-background text-foreground dark" style={{ backgroundColor: '#0b0f17' }}>
      <body className={`${fontVariables} ${activeFontClass} antialiased bg-background text-foreground min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <AuthProvider>
                {/* Top navbar */}
                <Navbar />

                {/* Main content area */}
                <MainContainer>
                  {children}
                  <Footer />
                </MainContainer>

                <Toaster />
                <ClientChatWidget />
              </AuthProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

