import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function RefundPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Refund' });

  const sections = [
    { title: t('sec1Title'), desc: t('sec1Desc') },
    { title: t('sec2Title'), desc: t('sec2Desc') },
    { title: t('sec3Title'), desc: t('sec3Desc') },
    { title: t('sec4Title'), desc: t('sec4Desc') },
    { title: t('sec5Title'), desc: t('sec5Desc') },
    { title: t('sec6Title'), desc: t('sec6Desc') },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-6 animate-in fade-in zoom-in-95 duration-500 bg-mesh">
      <div className="stadium-glass border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`}>
              <Button variant="outline" size="icon" className="rounded-2xl border-white/10 hover:bg-white/10 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                <ArrowLeft className="w-5 h-5 rtl:rotate-180 text-primary" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">{t('title')}</h1>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1.5">{t('lastUpdated')}</p>
            </div>
          </div>

          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              Law No. 181 of 2018
            </span>
          </div>
        </div>

        <div className="space-y-6 text-sm md:text-base leading-relaxed font-medium">
          {sections.map((section, i) => (
            <section
              key={i}
              className="p-6 md:p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/[0.07] transition-all duration-300 space-y-2.5 shadow-lg group"
            >
              <h2 className="text-lg md:text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {section.desc}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
