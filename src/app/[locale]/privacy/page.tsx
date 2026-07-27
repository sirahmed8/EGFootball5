import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-mesh">
      <div className="stadium-glass border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl space-y-8">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <Link href={`/${locale}`}>
            <Button variant="outline" size="icon" className="rounded-2xl border-white/10 hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-primary" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">{t('title')}</h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">{t('lastUpdated')}</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6 text-sm md:text-base leading-relaxed font-medium">
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h2 className="text-xl font-black text-foreground">{t('sec1Title')}</h2>
            <p className="text-muted-foreground">{t('sec1Desc')}</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h2 className="text-xl font-black text-foreground">{t('sec2Title')}</h2>
            <p className="text-muted-foreground">{t('sec2Desc')}</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h2 className="text-xl font-black text-foreground">{t('sec3Title')}</h2>
            <p className="text-muted-foreground">{t('sec3Desc')}</p>
          </section>

          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h2 className="text-xl font-black text-foreground">{t('sec4Title')}</h2>
            <p className="text-muted-foreground">{t('sec4Desc')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
