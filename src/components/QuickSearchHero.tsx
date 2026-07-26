'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Search, MapPin, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolidSelect, SelectOption } from '@/components/ui/SolidSelect';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function QuickSearchHero() {
  const router = useRouter();
  const t = useTranslations('QuickSearch');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [searchTerm, setSearchTerm] = React.useState('');
  const [city, setCity] = React.useState('all');
  const [pitchSize, setPitchSize] = React.useState('all');
  const [dynamicCities, setDynamicCities] = React.useState<SelectOption[]>([]);

  // Fetch dynamic cities configured by Owner
  React.useEffect(() => {
    async function loadCities() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'cities'));
        if (snap.exists() && snap.data().list) {
          const list = snap.data().list as Array<{ value: string; labelEn: string; labelAr: string }>;
          setDynamicCities(
            list.map((c) => ({
              value: c.value,
              label: isArabic ? c.labelAr : c.labelEn,
            }))
          );
        }
      } catch (e) {
        console.warn('Error loading dynamic cities:', e);
      }
    }
    loadCities();
  }, [isArabic]);

  const defaultCityOptions: SelectOption[] = [
    { value: 'all', label: t('allCities') },
    { value: 'obour', label: t('obour') },
    { value: 'new_cairo', label: t('newCairo') },
    { value: 'shorouk', label: t('shorouk') },
    { value: 'october', label: t('october') },
  ];

  const cityOptions: SelectOption[] =
    dynamicCities.length > 0
      ? [{ value: 'all', label: t('allCities') }, ...dynamicCities]
      : defaultCityOptions;

  const sizeOptions: SelectOption[] = [
    { value: 'all', label: t('allSizes') },
    { value: '5v5', label: t('fiveVsFive') },
    { value: '7v7', label: t('sevenVsSeven') },
    { value: '11v11', label: t('fullPitch') },
  ];

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
      className="w-full max-w-4xl mx-auto p-2.5 sm:p-3 rounded-3xl bg-card border border-border shadow-2xl hover:border-primary/40 transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5 relative z-30"
    >
      {/* Search Text Input — zero focus outline box */}
      <div className="relative flex items-center gap-3 px-4 py-3 flex-1 bg-background rounded-2xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-5 h-5 text-primary shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('placeholder')}
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          className="w-full bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none ring-0 appearance-none text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground/70"
        />
      </div>

      {/* City Solid Non-Transparent Dropdown */}
      <SolidSelect
        value={city}
        onChange={setCity}
        options={cityOptions}
        icon={MapPin}
        iconColor="text-emerald-400"
      />

      {/* Size Solid Non-Transparent Dropdown */}
      <SolidSelect
        value={pitchSize}
        onChange={setPitchSize}
        options={sizeOptions}
        icon={Trophy}
        iconColor="text-amber-400"
      />

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto bg-primary text-black font-black hover:bg-primary/90 rounded-2xl px-6 py-6 shadow-md hover:scale-105 transition-all cursor-pointer text-sm shrink-0 gap-2"
      >
        <Sparkles className="w-4 h-4 text-black shrink-0" />
        <span>{t('findBtn')}</span>
      </Button>
    </form>
  );
}
