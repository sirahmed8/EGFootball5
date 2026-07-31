'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';

interface CustomDarkDatePickerProps {
  value: string; // ISO or "YYYY-MM-DDTHH:mm"
  onChange: (newValue: string) => void;
  isArabic?: boolean;
}

export function CustomDarkDatePicker({ value, onChange, isArabic = false }: CustomDarkDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
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

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="relative w-full" ref={popoverRef}>
      {/* Trigger Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Custom Pitch Black Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 top-full start-0 w-full max-w-xs bg-[#0d0d0d] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-3"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-xs text-foreground tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground transition-colors cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {daysOfWeek.map((day) => (
                <span key={day} className="text-[9px] font-black text-muted-foreground uppercase pb-1">{day}</span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {blankDays.map((_, i) => <div key={`blank-${i}`} className="h-7" />)}
              {monthDays.map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`h-7 w-full rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center ${
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

            {/* Time Selector — custom inline scroll lists */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Time (24h):</span>
              </div>
              <div className="flex gap-2">
                {/* Hour picker */}
                <div className="flex-1 overflow-y-auto max-h-[100px] rounded-xl bg-white/5 border border-white/10 space-y-0.5 p-1 scrollbar-hide">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHour(h)}
                      className={`w-full text-center text-[10px] font-mono font-bold py-1 rounded-lg transition-all cursor-pointer ${
                        selectedHour === h
                          ? 'bg-emerald-500 text-black'
                          : 'hover:bg-white/10 text-foreground'
                      }`}
                    >
                      {String(h).padStart(2, '0')}:00
                    </button>
                  ))}
                </div>
                {/* Minute picker */}
                <div className="w-16 overflow-y-auto max-h-[100px] rounded-xl bg-white/5 border border-white/10 space-y-0.5 p-1 scrollbar-hide">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMinute(m)}
                      className={`w-full text-center text-[10px] font-mono font-bold py-1 rounded-lg transition-all cursor-pointer ${
                        selectedMinute === m
                          ? 'bg-emerald-500 text-black'
                          : 'hover:bg-white/10 text-foreground'
                      }`}
                    >
                      :{String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-muted-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-[10px] hover:bg-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" /> Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
