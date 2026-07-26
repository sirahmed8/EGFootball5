'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickSearchHero() {
  const router = useRouter();
  const t = useTranslations('QuickSearch');

  const [searchTerm, setSearchTerm] = React.useState('');
  const [city, setCity] = React.useState('all');
  const [pitchSize, setPitchSize] = React.useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm.trim());
    if (city !== 'all') params.set('city', city);
    if (pitchSize !== 'all') params.set('size', pitchSize);

    router.push(`/home?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto p-2.5 sm:p-3 rounded-3xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl hover:border-primary/40 transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5"
    >
      {/* Sleek Search Input */}
      <div className="relative flex items-center gap-3 px-4 py-3 flex-1 bg-background/90 rounded-2xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-5 h-5 text-primary shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('placeholder')}
          className="w-full bg-transparent text-foreground text-sm font-medium focus:outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      {/* City Select Filter */}
      <div className="flex items-center gap-2 px-3.5 py-3 bg-background/90 rounded-2xl border border-border hover:border-emerald-500/40 transition-all shrink-0">
        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-transparent text-xs sm:text-sm font-bold text-foreground focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-card text-foreground">{t('allCities')}</option>
          <option value="obour" className="bg-card text-foreground">{t('obour')}</option>
          <option value="new_cairo" className="bg-card text-foreground">{t('newCairo')}</option>
          <option value="shorouk" className="bg-card text-foreground">{t('shorouk')}</option>
          <option value="october" className="bg-card text-foreground">{t('october')}</option>
        </select>
      </div>

      {/* Size Select Filter */}
      <div className="flex items-center gap-2 px-3.5 py-3 bg-background/90 rounded-2xl border border-border hover:border-amber-500/40 transition-all shrink-0">
        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
        <select
          value={pitchSize}
          onChange={(e) => setPitchSize(e.target.value)}
          className="bg-transparent text-xs sm:text-sm font-bold text-foreground focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-card text-foreground">{t('allSizes')}</option>
          <option value="5v5" className="bg-card text-foreground">{t('fiveVsFive')}</option>
          <option value="7v7" className="bg-card text-foreground">{t('sevenVsSeven')}</option>
          <option value="11v11" className="bg-card text-foreground">{t('fullPitch')}</option>
        </select>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto bg-primary text-black font-black hover:bg-primary/90 rounded-2xl px-6 py-6 shadow-md hover:scale-105 transition-all cursor-pointer text-sm shrink-0 gap-2"
      >
        <Sparkles className="w-4 h-4 text-black" />
        <span>{t('findBtn')}</span>
      </Button>
    </form>
  );
}
