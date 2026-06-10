import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowDown, CheckCircle, Trophy, Users, Star, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Landing' });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background z-0" />
        <div className="z-10 space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            EGFootball5
          </h1>
          <p className="text-xl md:text-3xl text-foreground font-semibold">
            {t('heroSubtitle') || 'The Ultimate Football Booking Platform in Obour'}
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('heroDescription') || 'Book pitches, organize matches, and manage your stadiums with unparalleled ease and flawless design.'}
          </p>
          
          <div className="pt-8 animate-bounce">
            <ArrowDown className="mx-auto w-8 h-8 text-primary opacity-70" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4 text-center">
                <Globe className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Seamless Booking</h3>
                <p className="text-muted-foreground">Book any pitch with a few taps. Secure your slot and ensure fairness for everyone.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Tournaments & Leagues</h3>
                <p className="text-muted-foreground">Join local leagues, track top scorers, and compete for glory. (Coming Soon)</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Fair & Transparent</h3>
                <p className="text-muted-foreground">Automated slot locking prevents double bookings. Pay exactly what is required based on group size.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fake Stats Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-16">Trusted by the Community</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-5xl font-black text-primary">12k+</p>
              <p className="text-muted-foreground font-semibold uppercase tracking-wider">Players</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-primary">45</p>
              <p className="text-muted-foreground font-semibold uppercase tracking-wider">Stadiums</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-primary">8.5k</p>
              <p className="text-muted-foreground font-semibold uppercase tracking-wider">Matches Played</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-black text-primary">4.9</p>
              <div className="flex justify-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-muted-foreground font-semibold uppercase tracking-wider">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action & Login */}
      <section className="py-32 px-4 text-center bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] z-0" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-foreground">Ready to Kick Off?</h2>
          <p className="text-xl text-muted-foreground">Join the best platform and start playing your favorite sport today.</p>
          <div className="pt-8">
            <Link href={`/${locale}/login`}>
              <Button size="lg" className="text-xl px-12 py-8 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-full shadow-[0_0_40px_rgba(57,255,20,0.4)] hover:shadow-[0_0_60px_rgba(57,255,20,0.6)] hover:scale-105 transition-all">
                Get Started / Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="py-12 px-4 border-t border-border bg-muted/10 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground font-medium">
            <Link href={`/${locale}/privacy`} className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href={`/${locale}/terms`} className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href={`/${locale}/cookies`} className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; 2026 EGFootball5. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
