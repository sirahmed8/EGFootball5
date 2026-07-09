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
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

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
      <head>
        {/* Prevent white flash on theme/language change by applying dark bg before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.style.backgroundColor='oklch(0.12 0.01 250)';}else{document.documentElement.style.backgroundColor='oklch(0.985 0 0)';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
              {/* Always-visible desktop sidebar */}
              <DesktopSidebar />

              {/* Top navbar (mobile bar + desktop bell bar) */}
              <Navbar />

              {/* Main content area:
                  - Mobile: below 56px (h-14) top bar
                  - Desktop: shifted right/left by sidebar (16rem) AND below 56px top bar */}
              <main
                className={`min-h-screen flex flex-col
                  pt-14
                  ${isRTL ? 'md:mr-64' : 'md:ml-64'}
                  md:pt-14`}
              >
                {children}
                <Footer />
              </main>

              <Toaster theme="system" />
              <ScrollToTop />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
