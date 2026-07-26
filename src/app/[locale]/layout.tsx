import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { DesktopSidebar } from "@/components/SideMenu";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import ReactQueryProvider from '@/providers/ReactQueryProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('title'),
    description: t('description'),
    manifest: '/manifest.json',
    icons: { icon: '/favicon.jpg' },
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

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
              <AuthProvider>
              {/* Always-visible desktop sidebar */}
              <DesktopSidebar />

              {/* Top navbar (mobile bar + desktop bell bar) */}
              <Navbar />

              {/* Main content area: below 64px (h-16) top bar */}
              <main
                className={`min-h-screen flex flex-col
                  pt-16
                  ${isRTL ? 'md:mr-64' : 'md:ml-64'}
                  md:pt-16`}
              >
                {children}
                <Footer />
              </main>

              <Toaster theme="system" />
              <ScrollToTop />
              <FloatingChatWidget />
            </AuthProvider>
          </ThemeProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
