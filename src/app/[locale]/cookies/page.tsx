import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Cookies' });

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-16 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href={`/${locale}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </Button>
        </Link>
        <h1 className="text-3xl md:text-5xl font-black">{t('title')}</h1>
      </div>
      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-lg">
        <p>{t('lastUpdated')}</p>
        <h2 className="text-2xl font-bold text-foreground">{t('sec1Title')}</h2>
        <p>{t('sec1Desc')}</p>
        
        <h2 className="text-2xl font-bold text-foreground">{t('sec2Title')}</h2>
        <p>{t('sec2Desc')}</p>
        
        <h2 className="text-2xl font-bold text-foreground">{t('sec3Title')}</h2>
        <p>{t('sec3Desc')}</p>
        
        <h2 className="text-2xl font-bold text-foreground">{t('sec4Title')}</h2>
        <p>{t('sec4Desc')}</p>
      </div>
    </div>
  );
}
