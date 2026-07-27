"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Shield, Users, Timer, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function CeremonyPage() {
  const t = useTranslations("Ceremony");
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totsPlayers = [
    { position: "GK", top: "85%", left: "50%", name: "Oliver K." },
    { position: "DEF", top: "65%", left: "25%", name: "Virgil V." },
    { position: "DEF", top: "65%", left: "75%", name: "Ruben D." },
    { position: "MID", top: "45%", left: "50%", name: "Kevin D." },
    { position: "STR", top: "25%", left: "50%", name: "Erling H." },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center">
      {/* Stadium Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('/stadium-bg.jpg')] bg-cover bg-center" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/30 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-600/30 blur-[120px] rounded-full z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">{t("galaTitle", { defaultMessage: "End-of-Season Ceremony & Trophy Gala" })}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
            {t("mainHeading", { defaultMessage: "Season Finale" })}
          </h1>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8"
        >
          {[
            { label: t("days", { defaultMessage: "Days" }), value: timeLeft.days },
            { label: t("hours", { defaultMessage: "Hours" }), value: timeLeft.hours },
            { label: t("minutes", { defaultMessage: "Minutes" }), value: timeLeft.minutes },
            { label: t("seconds", { defaultMessage: "Seconds" }), value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl w-24 md:w-32 shadow-xl shadow-black/50">
              <span className="text-3xl md:text-5xl font-bold text-white mb-2">{item.value.toString().padStart(2, "0")}</span>
              <span className="text-xs md:text-sm text-neutral-400 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Awards Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          
          {/* Trophies Column */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 backdrop-blur-xl transition-all hover:border-amber-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-400">{t("goldenBoot", { defaultMessage: "Golden Boot" })}</h3>
                  <p className="text-neutral-300 mt-2">{t("goldenBootDesc", { defaultMessage: "Awarded to the top goalscorer of the season." })}</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>32 Goals</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-300/10 to-transparent border border-slate-300/20 backdrop-blur-xl transition-all hover:border-slate-300/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200/0 via-slate-200/5 to-slate-200/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-slate-300/20 text-slate-300">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-300">{t("goldenGlove", { defaultMessage: "Golden Glove" })}</h3>
                  <p className="text-neutral-300 mt-2">{t("goldenGloveDesc", { defaultMessage: "Awarded to the best goalkeeper with the most clean sheets." })}</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-sm">
                    <Shield className="w-4 h-4 text-slate-300" />
                    <span>15 Clean Sheets</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* TOTS Pitch */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl p-1 bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold">{t("tots", { defaultMessage: "Team of the Season (5-a-side)" })}</h3>
              </div>
              
              <div className="relative w-full aspect-[3/4] bg-emerald-900/40 rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-inner">
                {/* Pitch Lines */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-500/30" />
                <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full border-2 border-emerald-500/30 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-0 left-1/2 w-32 h-24 border-2 border-t-0 border-emerald-500/30 -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-32 h-24 border-2 border-b-0 border-emerald-500/30 -translate-x-1/2" />
                
                {/* Players */}
                {totsPlayers.map((player, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                    className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ top: player.top, left: player.left }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-white shadow-lg flex items-center justify-center font-bold text-black group-hover:scale-110 transition-transform">
                      {player.position}
                    </div>
                    <div className="mt-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {player.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
