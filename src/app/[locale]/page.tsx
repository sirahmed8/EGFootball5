import { Link } from '@/i18n/routing';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Landing');

  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="relative z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white">
            {t('title')}<br />
            <span className="text-primary drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">{t('highlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light">
            {t('subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/book" className={cn(buttonVariants({ size: 'lg' }), "bg-primary text-black hover:bg-primary/90 text-xl px-10 py-8 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_30px_rgba(57,255,20,0.4)] w-full sm:w-auto")}>
              {t('bookBtn')}
            </Link>
            <Link href="/login" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), "text-xl px-10 py-8 rounded-full font-bold border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all w-full sm:w-auto")}>
              {t('signInBtn')}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-32 bg-black relative z-10 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: t('features.turf.title'), desc: t('features.turf.desc') },
            { title: t('features.booking.title'), desc: t('features.booking.desc') },
            { title: t('features.payment.title'), desc: t('features.payment.desc') }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-card text-card-foreground border border-border backdrop-blur-xl hover:border-primary/50 transition-colors group animate-in fade-in zoom-in duration-700 delay-100 fill-mode-both">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-6 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(57,255,20,1)]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
