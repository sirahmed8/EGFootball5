'use client';

import * as React from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Trophy, Sparkles, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

// Custom Glass Dropdown Component (Replaces native browser <select> popup)
function GlassSelect({
  value,
  onChange,
  options,
  icon: Icon,
  iconColor,
}: {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  icon: React.ElementType;
  iconColor: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-3 bg-background/90 rounded-2xl border border-border hover:border-emerald-500/40 focus:border-emerald-500 focus:outline-none focus:ring-0 transition-all cursor-pointer text-start select-none"
        style={{ outline: 'none', border: '1px solid var(--border)', boxShadow: 'none' }}
      >
        <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
        <span className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[110px]">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Glass Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 start-0 min-w-[160px] w-full bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl z-[9999] p-1.5 space-y-0.5 overflow-hidden"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-start cursor-pointer ${
                    isSelected
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuickSearchHero() {
  const router = useRouter();
  const t = useTranslations('QuickSearch');

  const [searchTerm, setSearchTerm] = React.useState('');
  const [city, setCity] = React.useState('all');
  const [pitchSize, setPitchSize] = React.useState('all');

  const cityOptions: Option[] = [
    { value: 'all', label: t('allCities') },
    { value: 'obour', label: t('obour') },
    { value: 'new_cairo', label: t('newCairo') },
    { value: 'shorouk', label: t('shorouk') },
    { value: 'october', label: t('october') },
  ];

  const sizeOptions: Option[] = [
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
      className="w-full max-w-4xl mx-auto p-2.5 sm:p-3 rounded-3xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl hover:border-primary/40 transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5 relative"
    >
      {/* Search Text Input — zero focus outline box */}
      <div className="relative flex items-center gap-3 px-4 py-3 flex-1 bg-background/90 rounded-2xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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

      {/* City Glass Dropdown */}
      <GlassSelect
        value={city}
        onChange={setCity}
        options={cityOptions}
        icon={MapPin}
        iconColor="text-emerald-400"
      />

      {/* Size Glass Dropdown */}
      <GlassSelect
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
