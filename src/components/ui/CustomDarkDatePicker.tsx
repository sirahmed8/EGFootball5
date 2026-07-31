'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Check, X } from 'lucide-react';

interface CustomDarkDatePickerProps {
  value: string; // ISO or "YYYY-MM-DDTHH:mm"
  onChange: (newValue: string) => void;
  isArabic?: boolean;
}

export function CustomDarkDatePicker({ value, onChange, isArabic = false }: CustomDarkDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleConfirm = () => {
    const d = new Date(currentYear, currentMonth, selectedDay, selectedHour, selectedMinute);
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const hourStr = String(d.getHours()).padStart(2, '0');
    const minStr = String(d.getMinutes()).padStart(2, '0');
    
    // Format YYYY-MM-DDTHH:mm
    const formatted = `${d.getFullYear()}-${monthStr}-${dayStr}T${hourStr}:${minStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const blankDays = Array.from({ length: firstDay });
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const displayDateStr = value
    ? new Date(value).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : (isArabic ? 'لم يتم تحديد موعد (TBD)' : 'No date set (TBD)');

  return (
    <div className="relative w-full">
      {/* Trigger Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black border border-white/15 hover:border-emerald-500/50 rounded-2xl p-3.5 text-sm text-foreground flex items-center justify-between transition-colors cursor-pointer group shadow-lg"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className={`font-mono font-bold ${value ? 'text-emerald-300' : 'text-muted-foreground'}`}>
            {displayDateStr}
          </span>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          {isOpen ? (isArabic ? 'إغلاق' : 'Close') : (isArabic ? 'تغيير' : 'Select Date')}
        </span>
      </button>

      {/* Custom Pitch Black Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute z-50 mt-2 top-full start-0 w-full max-w-md bg-black border border-emerald-500/30 rounded-3xl p-5 shadow-2xl space-y-5"
            >
              {/* Header Navigation */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-black text-sm text-foreground tracking-wide">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map((day) => (
                  <span key={day} className="text-[11px] font-black text-muted-foreground uppercase">
                    {day}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {blankDays.map((_, i) => (
                  <div key={`blank-${i}`} className="h-9" />
                ))}
                {monthDays.map((day) => {
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`h-9 w-full rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500 text-black font-black shadow-lg glow-primary scale-105'
                          : 'bg-white/5 hover:bg-white/15 text-foreground'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Time Selector */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Time (24h):</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                    className="bg-black border border-white/15 rounded-xl p-2 text-xs font-mono font-bold text-foreground focus:border-emerald-400 outline-none"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(Number(e.target.value))}
                    className="bg-black border border-white/15 rounded-xl p-2 text-xs font-mono font-bold text-foreground focus:border-emerald-400 outline-none"
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>
                        :{String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs glow-primary hover:bg-emerald-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Confirm Date
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
