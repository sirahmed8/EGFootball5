'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Check, ChevronDown } from 'lucide-react';
import { Portal } from '@/components/Portal';

interface CustomTimeDropdownProps {
  value: number;
  options: { label: string; value: number }[];
  onChange: (val: number) => void;
  width?: string;
}

function CustomTimeDropdown({ value, options, onChange, width = "w-20" }: CustomTimeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`relative ${width}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black text-emerald-400 font-mono text-xs font-black px-2.5 py-1 rounded-xl border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between transition-all cursor-pointer shadow-md group"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-3 h-3 text-emerald-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="absolute z-[100] bottom-full mb-1 start-0 w-full bg-[#0b0f17] border border-emerald-500/40 rounded-2xl p-1 shadow-[0_10px_30px_rgba(0,0,0,0.9)] max-h-36 overflow-y-auto overflow-x-hidden space-y-0.5 [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-center px-2 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  opt.value === value
                    ? 'bg-emerald-500 text-black font-black shadow-md'
                    : 'text-white hover:bg-emerald-500/20 hover:text-emerald-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CustomDarkDatePickerProps {
  value: string; // ISO or "YYYY-MM-DDTHH:mm"
  onChange: (newValue: string) => void;
  isArabic?: boolean;
}

export function CustomDarkDatePicker({ value, onChange, isArabic = false }: CustomDarkDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = Math.min(290, window.innerWidth - 24);
      const expectedHeight = 280;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const placeAbove = spaceBelow < expectedHeight && spaceAbove > spaceBelow;

      let top = placeAbove ? rect.top - expectedHeight - 6 : rect.bottom + 6;
      top = Math.max(12, Math.min(top, window.innerHeight - expectedHeight - 12));

      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      left = Math.max(12, left);

      setCoords({ top, left, placeAbove });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    }
  }, [isOpen, updateCoords]);

  // Parse current initial value or default to today + 30 days
  const initialDate = value ? new Date(value) : new Date(Date.now() + 30 * 86400000);

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedHour, setSelectedHour] = useState(initialDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState(Math.floor(initialDate.getMinutes() / 15) * 15);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleConfirm = () => {
    const d = new Date(currentYear, currentMonth, selectedDay, selectedHour, selectedMinute);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const blankDays = Array.from({ length: firstDay });
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const displayDateStr = value
    ? new Date(value).toLocaleString(isArabic ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : (isArabic ? 'لم يتم تحديد موعد (TBD)' : 'No date set (TBD)');

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative w-full" ref={triggerRef}>
      {/* Trigger Field */}
      <button
        type="button"
        onClick={() => {
          updateCoords();
          setIsOpen(!isOpen);
        }}
        className="w-full bg-black border border-white/15 hover:border-emerald-500/50 rounded-2xl p-3 text-sm text-foreground flex items-center justify-between transition-colors cursor-pointer group shadow-lg"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className={`font-mono font-bold text-xs ${value ? 'text-emerald-300' : 'text-muted-foreground'}`}>
            {displayDateStr}
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
          {isOpen ? (isArabic ? 'إغلاق' : 'Close') : (isArabic ? 'تغيير' : 'Pick Date')}
        </span>
      </button>

      {/* Custom Pitch Black Popover via Portal */}
      <AnimatePresence>
        {isOpen && (
          <Portal>
            <motion.div
              ref={popoverRef}
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: '290px',
                maxWidth: 'calc(100vw - 24px)',
                maxHeight: 'calc(100vh - 24px)',
                zIndex: 999999,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              initial={{ opacity: 0, scale: 0.96, y: coords.placeAbove ? -8 : 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: coords.placeAbove ? -8 : 8 }}
              transition={{ duration: 0.15 }}
              className="bg-[#0b0f17] border border-white/20 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] space-y-2.5 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <button type="button" onClick={handlePrevMonth} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-xs text-foreground tracking-wide">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button type="button" onClick={handleNextMonth} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {daysOfWeek.map((day) => (
                  <span key={day} className="text-[9px] font-black text-muted-foreground uppercase pb-0.5">{day}</span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {blankDays.map((_, i) => <div key={`blank-${i}`} className="h-6" />)}
                {monthDays.map((day) => {
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`h-6 w-full rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500 text-black font-black shadow-lg scale-105'
                          : 'bg-white/5 hover:bg-white/15 text-foreground'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Sleek Custom Dark Time Selector with Animated Dropdowns */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{isArabic ? 'التوقيت (24h):' : 'Time (24h):'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CustomTimeDropdown
                    value={selectedHour}
                    options={Array.from({ length: 24 }, (_, i) => ({ label: `${pad(i)}:00`, value: i }))}
                    onChange={(val) => setSelectedHour(val)}
                    width="w-24"
                  />

                  <span className="text-emerald-400 font-mono font-bold text-xs">:</span>

                  <CustomTimeDropdown
                    value={selectedMinute}
                    options={[0, 15, 30, 45].map((m) => ({ label: `:${pad(m)}`, value: m }))}
                    onChange={(val) => setSelectedMinute(val)}
                    width="w-16"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-muted-foreground cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-3.5 py-1 rounded-xl bg-emerald-500 text-black font-black text-[10px] hover:bg-emerald-400 flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Check className="w-3 h-3" /> {isArabic ? 'تأكيد' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
