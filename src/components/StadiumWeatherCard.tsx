'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sun, CloudRain, Wind, Thermometer, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StadiumWeatherCard() {
  const [city, setCity] = React.useState('Obour City');

  const weatherData = {
    temp: 27,
    condition: 'Clear Sky & Perfect Turf',
    humidity: '42%',
    wind: '12 km/h',
    turfQuality: 'Optimum (100% Dry)',
  };

  return (
    <Card className="stadium-glass border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-start">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shadow-inner">
            ☀️
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5" /> Live Turf Conditions
            </div>
            <h3 className="text-xl font-black text-foreground">{city} Stadiums</h3>
            <p className="text-xs text-muted-foreground">{weatherData.condition}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center border-t sm:border-t-0 sm:border-s border-white/10 pt-3 sm:pt-0 sm:ps-6">
          <div>
            <div className="text-2xl font-black text-foreground flex items-center justify-center gap-1">
              <Thermometer className="w-4 h-4 text-rose-400" /> {weatherData.temp}°C
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase">Temperature</div>
          </div>

          <div>
            <div className="text-2xl font-black text-cyan-400 flex items-center justify-center gap-1">
              <Wind className="w-4 h-4 text-cyan-400" /> {weatherData.wind}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase">Wind Speed</div>
          </div>

          <div className="hidden md:block">
            <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {weatherData.turfQuality}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase">Pitch Status</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
