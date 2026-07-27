import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Trophy, ExternalLink } from 'lucide-react';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="w-full py-12 mt-auto border-t border-white/10 stadium-glass relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image src="/favicon.jpg" alt="Logo" width={36} height={36} className="rounded-full object-cover shadow-md" priority />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-foreground block">
                EG<span className="text-gradient-primary">Football5</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium">Egypt Premier Football Booking & Match Lobby Platform</span>
            </div>
          </div>

          <a 
            href="https://linktr.ee/sir.ahmed" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black hover:bg-primary/20 transition-all hover:scale-105 shadow-sm"
          >
            <span>{t('connectDeveloper')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">{t('privacyPolicy')}</Link>
            <span className="opacity-30">•</span>
            <Link href="/terms" className="hover:text-primary transition-colors">{t('termsOfService')}</Link>
            <span className="opacity-30">•</span>
            <Link href="/cookies" className="hover:text-primary transition-colors">{t('cookiePolicy')}</Link>
          </div>

          <div className="text-center sm:text-end text-muted-foreground font-mono">
            {t('rightsReserved')}
          </div>
        </div>
      </div>
    </footer>
  );
}
