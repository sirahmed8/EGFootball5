'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Wind, CheckCircle2, CloudRain, Sparkles, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SolidSelect, SelectOption } from '@/components/ui/SolidSelect';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const KNOWN_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  obour: { lat: 30.14, lon: 31.48, name: 'Obour City' },
  cairo: { lat: 30.04, lon: 31.23, name: 'Cairo' },
  giza: { lat: 30.01, lon: 31.21, name: 'Giza' },
  alexandria: { lat: 31.20, lon: 29.91, name: 'Alexandria' },
};

export function StadiumWeatherCard() {
  const [selectedCityKey, setSelectedCityKey] = React.useState('obour');
  const [loading, setLoading] = React.useState(true);
  const [cityOptions, setCityOptions] = React.useState<SelectOption[]>([
    { value: 'obour', label: 'Obour City' },
    { value: 'cairo', label: 'Cairo' },
    { value: 'giza', label: 'Giza' },
    { value: 'alexandria', label: 'Alexandria' },
  ]);

  const [weather, setWeather] = React.useState<{
    temp: number;
    wind: number;
    humidity: number;
    weatherCode: number;
    pitchStatus: string;
    conditionText: string;
    iconEmoji: string;
  }>({
    temp: 27,
    wind: 12,
    humidity: 45,
    weatherCode: 0,
    pitchStatus: 'Optimum (100% Dry 🟢)',
    conditionText: 'Clear Sky & Perfect Turf',
    iconEmoji: '☀️',
  });

  // Query cities from pitch listings added by owners
  React.useEffect(() => {
    async function fetchOwnerCities() {
      try {
        const snap = await getDocs(collection(db, 'pitches'));
        if (!snap.empty) {
          const citiesSet = new Set<string>();
          snap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.locationName) citiesSet.add(data.locationName);
            if (data.city) citiesSet.add(data.city);
          });
          const fetchedCities = Array.from(citiesSet);
          if (fetchedCities.length > 0) {
            const options: SelectOption[] = fetchedCities.map((c) => ({
              value: c.toLowerCase().replace(/\s+/g, ''),
              label: c,
            }));
            setCityOptions(options);
            setSelectedCityKey(options[0].value);
          }
        }
      } catch (err) {
        console.warn('Pitch cities query fallback:', err);
      }
    }
    fetchOwnerCities();
  }, []);

  const activeCity = KNOWN_COORDS[selectedCityKey] || {
    lat: 30.14,
    lon: 31.48,
    name: cityOptions.find((o) => o.value === selectedCityKey)?.label || 'Stadium Turf',
  };

  React.useEffect(() => {
    async function fetchRealWeather() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${activeCity.lat}&longitude=${activeCity.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );
        if (!res.ok) throw new Error('Failed to fetch weather');
        const data = await res.json();
        const current = data.current;
        if (!current) throw new Error('Invalid weather payload');

        const temp = Math.round(current.temperature_2m);
        const wind = Math.round(current.wind_speed_10m);
        const humidity = current.relative_humidity_2m;
        const code = current.weather_code;

        let icon = '☀️';
        let condition = 'Clear Sky & Perfect Turf';
        let status = 'Optimum (100% Dry 🟢)';

        if (code >= 51 || code === 61 || code === 80) {
          icon = '🌧️';
          condition = 'Rain & Wet Conditions';
          status = 'Wet & Slippery Turf (Caution ⚠️)';
        } else if (code >= 1 && code <= 3) {
          icon = '⛅';
          condition = 'Partly Cloudy & Cool Breeze';
          status = 'Great Playing Pitch 🟢';
        } else if (humidity > 75) {
          icon = '💧';
          condition = 'High Humidity Dew';
          status = 'Damp Pitch (High Traction)';
        }

        setWeather({
          temp,
          wind,
          humidity,
          weatherCode: code,
          pitchStatus: status,
          conditionText: condition,
          iconEmoji: icon,
        });
      } catch (err) {
        console.warn('Weather API fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRealWeather();
  }, [activeCity.lat, activeCity.lon]);

  return (
    <Card className="stadium-glass bg-black border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-visible z-20 global-box global-outline-glow max-w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 max-w-full">
        {/* City & Condition Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-start min-w-0 w-full lg:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shadow-inner shrink-0">
            {weather.iconEmoji}
          </div>
          <div className="space-y-1 min-w-0 w-full sm:w-auto">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-1 max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> Live Satellite Weather & Pitch Status
            </div>
            <div className="flex flex-col xl:flex-row xl:items-center gap-2 sm:gap-3 max-w-full">
              <h3 className="text-xl md:text-2xl font-black text-foreground break-words leading-tight">{activeCity.name} Turf</h3>
              <SolidSelect
                value={selectedCityKey}
                onChange={(val) => setSelectedCityKey(val)}
                options={cityOptions}
                icon={MapPin}
                iconColor="text-emerald-400"
                className="w-full sm:w-48 shrink-0"
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{weather.conditionText}</p>
          </div>
        </div>

        {/* Live Weather Metrics */}
        <div className="flex items-center gap-4 sm:gap-6 text-center border-t lg:border-t-0 lg:border-s border-white/10 pt-4 lg:pt-0 lg:ps-6 shrink-0 w-full sm:w-auto justify-around sm:justify-start">
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground flex items-center justify-center gap-1 whitespace-nowrap">
              <Thermometer className="w-4 h-4 text-rose-400 shrink-0" /> {loading ? '--' : `${weather.temp}°C`}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap">Temperature</div>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 flex items-center justify-center gap-1 whitespace-nowrap">
              <Wind className="w-4 h-4 text-cyan-400 shrink-0" /> {loading ? '--' : `${weather.wind} km/h`}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap">Wind Speed</div>
          </div>

          <div className="hidden sm:block">
            <div className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1 whitespace-nowrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {loading ? 'Checking...' : weather.pitchStatus}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap">Pitch Status</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
