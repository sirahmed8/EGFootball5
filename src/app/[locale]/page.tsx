import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArrowDown, CheckCircle, Trophy, Globe, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LandingStats } from '@/components/LandingStats';
import { LandingRedirect } from '@/components/LandingRedirect';

function FeatureCard({ title, desc, Icon }: { title: string, desc: string, Icon: LucideIcon }) {
  return (
    <Card className="bg-background/60 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_-15px_rgba(57,255,20,0.3)] group">
      <CardContent className="pt-8 space-y-4 text-center">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function FaqCard({ question, answer }: { question: string, answer: string }) {
  return (
    <Card className="bg-card/30 backdrop-blur-md border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{question}</h3>
        <p className="text-muted-foreground leading-relaxed">{answer}</p>
      </CardContent>
    </Card>
  );
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Landing' });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <LandingRedirect />
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4 relative overflow-hidden">
        {/* Refined subtle background glow instead of harsh gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[150px] z-0 rounded-full pointer-events-none" />
        
        <div className="z-10 space-y-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground drop-shadow-sm">
            EGFootball5
          </h1>
          <p className="text-2xl md:text-4xl text-primary font-bold tracking-tight">
            {t('heroSubtitle')}
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            {t('heroDescription')}
          </p>
          
          <div className="pt-12 animate-bounce flex justify-center">
            <ArrowDown className="w-10 h-10 text-primary opacity-80" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-card/30 border-y border-border/50 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[100px] z-0 rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight">
            {t('whyChooseUs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard title={t('features.turf.title')} desc={t('features.turf.desc')} Icon={Globe} />
            <FeatureCard title={t('features.booking.title')} desc={t('features.booking.desc')} Icon={Trophy} />
            <FeatureCard title={t('features.payment.title')} desc={t('features.payment.desc')} Icon={CheckCircle} />
          </div>
        </div>
      </section>

      {/* Fake Stats Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] z-0 rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-16 tracking-tight">{t('trustedBy')}</h2>
          <LandingStats />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-background relative overflow-hidden border-t border-border/50">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight">
            {t('faqTitle')}
          </h2>
          <div className="space-y-6">
            <FaqCard question={t('faq1Q')} answer={t('faq1A')} />
            <FaqCard question={t('faq2Q')} answer={t('faq2A')} />
            <FaqCard question={t('faq3Q')} answer={t('faq3A')} />
          </div>
        </div>
      </section>

      {/* Call to Action & Login */}
      <section className="py-32 px-4 text-center bg-card/30 border-t border-border/50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-[100%] blur-[120px] z-0 pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-foreground tracking-tight">{t('ready')}</h2>
          <p className="text-xl text-muted-foreground leading-relaxed">{t('readyDesc')}</p>
          <div className="pt-8">
            <Link href="/login">
              <Button size="lg" className="text-xl px-12 py-8 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-full shadow-[0_0_40px_rgba(57,255,20,0.3)] hover:shadow-[0_0_60px_rgba(57,255,20,0.5)] hover:scale-105 transition-all duration-300">
                {t('getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
