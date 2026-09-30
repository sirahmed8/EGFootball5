'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { addDays, isBefore, startOfDay } from 'date-fns';

interface BookingCalendarPickerProps {
  date: Date | undefined;
  onDateChange: (date: Date) => void;
}

export function BookingCalendarPicker({ date, onDateChange }: BookingCalendarPickerProps) {
  return (
    <Card className="stadium-glass p-4 rounded-3xl border-border/40 shadow-xl">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(d) => {
          if (d) onDateChange(d);
        }}
        disabled={(day) =>
          isBefore(startOfDay(day), startOfDay(new Date())) ||
          isBefore(addDays(new Date(), 14), day)
        }
        className="rounded-2xl mx-auto"
      />
    </Card>
  );
}
