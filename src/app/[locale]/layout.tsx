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
import { SkipLink } from "@/components/SkipLink";
import { GlobalCommandMenu } from "@/components/GlobalCommandMenu";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { ClientChatWidget } from '@/components/ClientChatWidget';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { OwnerOpToolbar } from '@/components/owner/OwnerOpToolbar';
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
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://egfootball5.web.app'),
    title: t('title') || (isArabic ? 'EGFootball5 - حجز ملاعب خماسي بالعبور' : 'EGFootball5 - Pitch Booking Platform'),
    description: t('description') || (isArabic ? 'منصة حجز ملاعب الخماسي والمباريات العامة بمدينة العبور' : 'Premier 5-a-side football pitch booking and match lobbies in Obour City'),
    manifest: '/manifest.json',
    icons: { icon: '/favicon.jpg' },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ar-EG': '/ar',
        'en-US': '/en',
      },
    },
    openGraph: {
      title: 'EGFootball5 - 5-a-side Football Booking',
      description: 'Book turf pitches, organize public matches, and lock slots seamlessly in Obour City.',
      siteName: 'EGFootball5',
      images: [
        {
          url: '/favicon.jpg',
          width: 512,
          height: 512,
          alt: 'EGFootball5 Platform Emblem',
        },
      ],
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'EGFootball5 - Pitch Booking',
      description: '5-a-side football platform in Obour City.',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsActivityLocation',
        '@id': 'https://egfootball5.web.app/#location',
        name: 'EGFootball5',
        alternateName: 'Kickoff',
        description: isRTL
          ? 'منصة حجز ملاعب الخماسي والمباريات العامة بمدينة العبور'
          : '5-a-side football pitch booking platform and match lobbies in Obour City, Egypt',
        url: 'https://egfootball5.web.app',
        logo: 'https://egfootball5.web.app/favicon.jpg',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Building 14, Youth Avenue, 9th District',
          addressLocality: 'Obour City',
          addressRegion: 'Qalyubia',
          addressCountry: 'EG',
        },
        priceRange: 'EGP 300 - EGP 600',
        telephone: '+201001234567',
      },
      {
        '@type': 'Organization',
        '@id': 'https://egfootball5.web.app/#organization',
        name: 'EGFootball Sports Tech LLC',
        legalName: 'شركة إيجي فوتبول لخدمات تكنولوجيا الرياضة وحجز الملاعب ش.م.م',
        taxID: '712-492-301',
        vatID: '194820',
        url: 'https://egfootball5.web.app',
        logo: 'https://egfootball5.web.app/favicon.jpg',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+201001234567',
            contactType: 'customer service',
            email: 'support@egfootball5.com',
            availableLanguage: ['Arabic', 'English'],
          },
          {
            '@type': 'ContactPoint',
            contactType: 'data protection officer',
            email: 'dpo@egfootball5.com',
            availableLanguage: ['Arabic', 'English'],
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://egfootball5.web.app/#website',
        url: 'https://egfootball5.web.app',
        name: 'EGFootball5',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://egfootball5.web.app/home?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning className="bg-background text-foreground dark" style={{ backgroundColor: '#0b0f17' }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${fontVariables} ${activeFontClass} antialiased bg-background text-foreground min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <AuthProvider>
                <SkipLink />
                <ReadingProgressBar />
                <GlobalCommandMenu />

                {/* Top navbar */}
                <Navbar />

                {/* Main content area */}
                <MainContainer>
                  {children}
                  <Footer />
                </MainContainer>

                <ScrollToTop />
                <MobileStickyCta />
                <Toaster />
                <ClientChatWidget />
                <CookieConsentBanner />
                <OwnerOpToolbar />
              </AuthProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

