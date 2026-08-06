"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Trophy, Shield, Users, Timer, Sparkles, Settings, Star, Award, Crown, HeartHandshake, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Portal } from '@/components/Portal';
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";
import { CustomDarkDatePicker } from "@/components/ui/CustomDarkDatePicker";

interface SeasonData {
  targetDate: string; // ISO string e.g. "2026-08-31T20:00:00Z"
  goldenBootWinner?: string;
  goldenBootGoals?: number;
  goldenGloveWinner?: string;
  goldenGloveSheets?: number;
  playmakerWinner?: string;
  playmakerAssists?: number;
  mvpWinner?: string;
  mvpRating?: number;
  fairplayWinner?: string;
  championSquad?: string;
  totsGk?: string;
  totsDef1?: string;
  totsDef2?: string;
  totsMid?: string;
  totsStr?: string;
}

export default function CeremonyPage() {
  const t = useTranslations("Ceremony");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const appUser = useAuthStore((s) => s.appUser);
  const isAdminOrOwner = appUser?.role === "admin" || appUser?.role === "owner";

  const [seasonData, setSeasonData] = useState<SeasonData>({
    targetDate: "",
    goldenBootWinner: isArabic ? "في انتظار ختام الموسم" : "Pending Season End",
    goldenBootGoals: 0,
    goldenGloveWinner: isArabic ? "في انتظار ختام الموسم" : "Pending Season End",
    goldenGloveSheets: 0,
    playmakerWinner: isArabic ? "في انتظار ختام الموسم" : "Pending Season End",
    playmakerAssists: 0,
    mvpWinner: isArabic ? "في انتظار ختام الموسم" : "Pending Season End",
    mvpRating: 0,
    fairplayWinner: isArabic ? "في انتظار ختام الموسم" : "Pending Season End",
    championSquad: isArabic ? "في انتظار ختام الموسم" : "Pending Season End",
    totsGk: isArabic ? "حارس المرمى" : "Top GK",
    totsDef1: isArabic ? "مدافع 1" : "Top DEF 1",
    totsDef2: isArabic ? "مدافع 2" : "Top DEF 2",
    totsMid: isArabic ? "خط وسط" : "Top MID",
    totsStr: isArabic ? "مهاجم" : "Top STR",
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editBootWinner, setEditBootWinner] = useState("");
  const [editBootGoals, setEditBootGoals] = useState(0);
  const [editGloveWinner, setEditGloveWinner] = useState("");
  const [editGloveSheets, setEditGloveSheets] = useState(0);
  const [editPlaymaker, setEditPlaymaker] = useState("");
  const [editAssists, setEditAssists] = useState(0);
  const [editMvp, setEditMvp] = useState("");
  const [editMvpRating, setEditMvpRating] = useState(0);
  const [editFairplay, setEditFairplay] = useState("");
  const [editChampionSquad, setEditChampionSquad] = useState("");
  const [editGk, setEditGk] = useState("");
  const [editDef1, setEditDef1] = useState("");
  const [editDef2, setEditDef2] = useState("");
  const [editMid, setEditMid] = useState("");
  const [editStr, setEditStr] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch Season Data & Compute Automatic Winners from Live Firestore Stats
  useEffect(() => {
    async function fetchSeasonDocAndStats() {
      let target = "";
      let savedData: Partial<SeasonData> = {};

      try {
        const snap = await getDoc(doc(db, "system", "season"));
        if (snap.exists()) {
          const data = snap.data() as SeasonData;
          target = data.targetDate || "";
          savedData = data;
        }
      } catch {
        // Quiet fallback if system doc is missing or restricted
      }

      try {
        const usersSnap = await getDocs(collection(db, "users"));
        if (!usersSnap.empty) {
          const allUsers = usersSnap.docs
            .map((d) => {
              const data = d.data();
              return {
                name: data.name || data.displayName || (isArabic ? "لاعب" : "Player"),
                position: data.position || "MID",
                goals: Number(data.goals) || 0,
                assists: Number(data.assists) || 0,
                saves: Number(data.saves) || 0,
                rating: Number(data.rating) || 0,
              };
            })
            .filter((u) => u.goals > 0 || u.saves > 0 || u.rating > 0 || u.assists > 0);

          if (allUsers.length > 0) {
            const topScorer = [...allUsers].sort((a, b) => b.goals - a.goals)[0];
            const topGk = [...allUsers].filter((u) => u.position === 'GK').sort((a, b) => b.saves - a.saves)[0] || allUsers[0];
            const topAssister = [...allUsers].sort((a, b) => b.assists - a.assists)[0] || allUsers[0];
            const topMvp = [...allUsers].sort((a, b) => b.rating - a.rating)[0] || allUsers[0];
            const totsDef = allUsers.filter((u) => u.position === 'DEF').sort((a, b) => b.rating - a.rating);
            const totsMid = allUsers.filter((u) => u.position === 'MID').sort((a, b) => b.rating - a.rating)[0] || allUsers[0];

            setSeasonData({
              targetDate: target,
              goldenBootWinner: savedData.goldenBootWinner || (topScorer?.goals ? topScorer.name : (isArabic ? "في انتظار ختام الموسم" : "Pending Season End")),
              goldenBootGoals: savedData.goldenBootGoals ?? (topScorer?.goals || 0),
              goldenGloveWinner: savedData.goldenGloveWinner || (topGk?.saves ? topGk.name : (isArabic ? "في انتظار ختام الموسم" : "Pending Season End")),
              goldenGloveSheets: savedData.goldenGloveSheets ?? (topGk?.saves || 0),
              playmakerWinner: savedData.playmakerWinner || (topAssister?.assists ? topAssister.name : (isArabic ? "في انتظار ختام الموسم" : "Pending Season End")),
              playmakerAssists: savedData.playmakerAssists ?? (topAssister?.assists || 0),
              mvpWinner: savedData.mvpWinner || (topMvp?.rating ? topMvp.name : (isArabic ? "في انتظار ختام الموسم" : "Pending Season End")),
              mvpRating: savedData.mvpRating ?? (topMvp?.rating || 0),
              fairplayWinner: savedData.fairplayWinner || "Obour Eagles",
              championSquad: savedData.championSquad || "Obour Eagles 🦅",
              totsGk: savedData.totsGk || topGk?.name || (isArabic ? "حارس المرمى" : "Top GK"),
              totsDef1: savedData.totsDef1 || totsDef[0]?.name || (isArabic ? "مدافع 1" : "Top DEF 1"),
              totsDef2: savedData.totsDef2 || totsDef[1]?.name || (isArabic ? "مدافع 2" : "Top DEF 2"),
              totsMid: savedData.totsMid || totsMid?.name || (isArabic ? "خط وسط" : "Top MID"),
              totsStr: savedData.totsStr || topScorer?.name || (isArabic ? "مهاجم" : "Top STR"),
            });
            setEditTargetDate(target);
            return;
          }
        }
      } catch {
        // Quiet fallback if users query is restricted
      }

      setSeasonData((prev) => ({ ...prev, targetDate: target }));
      setEditTargetDate(target);
    }
    fetchSeasonDocAndStats();
  }, [isArabic]);

  useEffect(() => {
    if (!seasonData.targetDate || seasonData.targetDate.trim() === "") return;
    const interval = setInterval(() => {
      const target = new Date(seasonData.targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seasonData.targetDate]);

  const handleSaveSeasonSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updated: SeasonData = {
        targetDate: editTargetDate,
        goldenBootWinner: editBootWinner || seasonData.goldenBootWinner || "",
        goldenBootGoals: editBootGoals,
        goldenGloveWinner: editGloveWinner || seasonData.goldenGloveWinner || "",
        goldenGloveSheets: editGloveSheets,
        playmakerWinner: editPlaymaker || seasonData.playmakerWinner || "",
        playmakerAssists: editAssists,
        mvpWinner: editMvp || seasonData.mvpWinner || "",
        mvpRating: editMvpRating,
        fairplayWinner: editFairplay || seasonData.fairplayWinner || "",
        championSquad: editChampionSquad || seasonData.championSquad || "",
        totsGk: editGk || seasonData.totsGk || "",
        totsDef1: editDef1 || seasonData.totsDef1 || "",
        totsDef2: editDef2 || seasonData.totsDef2 || "",
        totsMid: editMid || seasonData.totsMid || "",
        totsStr: editStr || seasonData.totsStr || "",
      };

      await setDoc(doc(db, "system", "season"), updated, { merge: true });
      setSeasonData(updated);
      toast.success(isArabic ? "تم تحديث إعدادات حفل ختام الموسم!" : "Season Ceremony settings updated!");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(isArabic ? "فشل تحديث الإعدادات." : "Failed to update ceremony settings.");
    } finally {
      setSaving(false);
    }
  };

  const totsPlayers = [
    { position: isArabic ? "حارس" : "GK", top: "85%", left: "50%", name: seasonData.totsGk || "Top GK" },
    { position: isArabic ? "مدافع" : "DEF", top: "65%", left: "25%", name: seasonData.totsDef1 || "Top DEF 1" },
    { position: isArabic ? "مدافع" : "DEF", top: "65%", left: "75%", name: seasonData.totsDef2 || "Top DEF 2" },
    { position: isArabic ? "وسط" : "MID", top: "45%", left: "50%", name: seasonData.totsMid || "Top MID" },
    { position: isArabic ? "مهاجم" : "STR", top: "25%", left: "50%", name: seasonData.totsStr || "Top STR" },
  ];

  const hasActiveTimer = Boolean(seasonData.targetDate && seasonData.targetDate.trim() !== "");

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center" dir={isArabic ? "rtl" : "ltr"}>
      <div className="relative z-10 w-full max-w-6xl space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">{isArabic ? "حفل ختام الموسم وجوائز التكريم" : "End-of-Season Ceremony & Trophy Gala"}</span>
            </div>
            {isAdminOrOwner && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                size="sm"
                className="bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl text-xs ms-3 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 me-1" /> {isArabic ? "تعديل إعدادات الحفل" : "Edit Ceremony Settings"}
              </Button>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gradient-primary">
            {isArabic ? "نهائي الموسم الرياضي" : "Season Finale"}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
            {isArabic
              ? "العد التنازلي الرسمي لحفل ختام الموسم، توزيع الجوائز والكؤوس التكريمية."
              : "Official countdown to the Grand Season Ceremony, Trophy Distribution & Awards Gala."}
          </p>
        </motion.div>

        {/* Countdown Timer OR Season in Progress Banner */}
        {hasActiveTimer ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6"
          >
            {[
              { label: isArabic ? "أيام" : "Days", value: timeLeft.days },
              { label: isArabic ? "ساعات" : "Hours", value: timeLeft.hours },
              { label: isArabic ? "دقائق" : "Minutes", value: timeLeft.minutes },
              { label: isArabic ? "ثواني" : "Seconds", value: timeLeft.seconds },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl bg-black border border-white/10 min-w-[100px] md:min-w-[130px] shadow-xl">
                <span className="text-3xl md:text-5xl font-black text-primary mb-1 font-mono">{item.value.toString().padStart(2, "0")}</span>
                <span className="text-[11px] md:text-xs font-black text-muted-foreground uppercase tracking-widest text-center whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-black border border-white/10 max-w-2xl mx-auto text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Timer className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-amber-400">
                {isArabic ? "حالة الموسم: الموسم الرياضي مستمر" : "Season Status: Season in Progress"}
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isArabic
                  ? "سيتم الإعلان عن موعد حفل ختام الموسم، العد التنازلي، وتوزيع الكؤوس (الحذاء الذهبي، القفاز الذهبي، صانع الألعاب، أفضل لاعب، اللعب النظيف، وكأس الفرق) وتشكيلة الموسم المثالية (TOTS) فور تحديده من إدارة الإستاد."
                  : "The official season finale date, awards gala countdown, trophy honors (Golden Boot, Golden Glove, Playmaker, MVP, Fair Play, Champion Squad), and Team of the Season (TOTS) roster will be unveiled once scheduled by stadium management."}
              </p>
            </div>
            {isAdminOrOwner && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-amber-500 text-black hover:bg-amber-400 font-black rounded-2xl text-xs px-5 py-3 cursor-pointer glow-amber"
              >
                <Settings className="w-4 h-4 me-1.5" /> {isArabic ? "تحديد موعد ختام الموسم" : "Schedule Season Finale Date"}
              </Button>
            )}
          </div>
        )}

        {/* Awards Showcase — ONLY DISPLAYED WHEN A SEASON IS ACTIVE */}
        {hasActiveTimer && (
          <div className="space-y-8 mt-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-foreground flex items-center justify-center gap-2">
                <Trophy className="w-7 h-7 text-amber-400" /> {isArabic ? "معرض كؤوس وجوائز ختام الموسم" : "Season Trophy Gala & Awards Showcase"}
              </h2>
              <p className="text-xs text-muted-foreground">{isArabic ? "الجوائز والكؤوس الرسمية المقرر توزيعها في الحفل الختامي" : "Official honors to be awarded at the grand ceremony"}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trophies Column (6 Trophies) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Golden Boot */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-amber-500/30 global-box space-y-3"
                >
                  <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 w-fit">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-amber-400">{isArabic ? "جائزة الحذاء الذهبي" : "Golden Boot"}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{isArabic ? "أفضل هداف في الموسم الرياضي." : "Top goalscorer of the season."}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                        🏆 {seasonData.goldenBootWinner || (isArabic ? "قيد الانتظار" : "Pending")}
                      </span>
                      {seasonData.goldenBootGoals ? (
                        <span className="text-[11px] font-bold text-emerald-400">⚽ {seasonData.goldenBootGoals} {isArabic ? "هدف" : "Goals"}</span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>

                {/* 2. Golden Glove */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-slate-400/30 global-box space-y-3"
                >
                  <div className="p-3.5 rounded-2xl bg-slate-400/20 text-slate-300 w-fit">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-300">{isArabic ? "جائزة القفاز الذهبي" : "Golden Glove"}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{isArabic ? "أفضل حارس مرمى ونظافة شباك." : "Best goalkeeper clean sheets."}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-300 font-bold text-[11px]">
                        🧤 {seasonData.goldenGloveWinner || (isArabic ? "قيد الانتظار" : "Pending")}
                      </span>
                      {seasonData.goldenGloveSheets ? (
                        <span className="text-[11px] font-bold text-cyan-400">🛡️ {seasonData.goldenGloveSheets} {isArabic ? "كلين شيت" : "Clean Sheets"}</span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>

                {/* 3. Playmaker Award */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-emerald-500/30 global-box space-y-3"
                >
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-emerald-400">{isArabic ? "صانع ألعاب الموسم" : "Playmaker of the Season"}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{isArabic ? "اللاعب الأكثر صناعة للأهداف." : "Player with most goal assists."}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                        🅰️ {seasonData.playmakerWinner || (isArabic ? "قيد الانتظار" : "Pending")}
                      </span>
                      {seasonData.playmakerAssists ? (
                        <span className="text-[11px] font-bold text-emerald-400">🅰️ {seasonData.playmakerAssists} {isArabic ? "أسيست" : "Assists"}</span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>

                {/* 4. Season MVP */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-purple-500/30 global-box space-y-3"
                >
                  <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 w-fit">
                    <Star className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-purple-400">{isArabic ? "أفضل لاعب في الموسم (MVP)" : "Season MVP Award"}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{isArabic ? "صاحب أعلى متوسط تقييم بالمباريات." : "Highest average match rating."}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-[11px]">
                        ⭐ {seasonData.mvpWinner || (isArabic ? "قيد الانتظار" : "Pending")}
                      </span>
                      {seasonData.mvpRating ? (
                        <span className="text-[11px] font-bold text-purple-400">⭐ {seasonData.mvpRating} {isArabic ? "تقييم" : "Rating"}</span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>

                {/* 5. Fair Play Award */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-rose-500/30 global-box space-y-3"
                >
                  <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 w-fit">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-rose-400">{isArabic ? "اللعب النظيف والروح الرياضية" : "Fair Play & Conduct"}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{isArabic ? "أفضل سلوك وانضباط رياضي." : "Best sportsmanship & discipline."}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold text-[11px]">
                        🎖️ {seasonData.fairplayWinner || (isArabic ? "قيد الانتظار" : "Pending")}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* 6. Champion Squad Cup */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="group relative overflow-hidden rounded-3xl p-5 bg-black border border-yellow-500/30 global-box space-y-3"
                >
                  <div className="p-3.5 rounded-2xl bg-yellow-500/20 text-yellow-400 w-fit">
                    <Crown className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-yellow-400">{isArabic ? "كأس الفريق بطل الموسم" : "Champion Squad Cup"}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{isArabic ? "الفريق الأعلى تصنيفاً ومشاركة." : "Top ranked neighborhood team."}</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-bold text-[11px]">
                        👑 {seasonData.championSquad || (isArabic ? "قيد الانتظار" : "Pending")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* TOTS Pitch Column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl p-6 bg-black border border-white/10 global-box relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-black text-foreground">{isArabic ? "تشكيلة الموسم المثالية (خماسي)" : "Team of the Season (5-a-side)"}</h3>
                </div>
                
                <div className="relative w-full aspect-[3/4] bg-emerald-950/40 rounded-2xl border-2 border-emerald-500/30 overflow-hidden shadow-inner">
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-white shadow-lg flex items-center justify-center font-black text-black group-hover:scale-110 transition-transform text-xs">
                        {player.position}
                      </div>
                      <div className="mt-2 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-xs font-bold whitespace-nowrap border border-white/10">
                        {player.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Edit Season Ceremony Modal */}
      {isEditModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="global-box border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto" dir={isArabic ? "rtl" : "ltr"}>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-400" /> {isArabic ? "إعدادات حفل ختام الموسم" : "Admin Season Ceremony Settings"}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSeasonSettings} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="text-amber-400 uppercase block mb-1">{isArabic ? "تاريخ ختام الموسم" : "Season End Target Date & Time"}</label>
                  <CustomDarkDatePicker
                    value={editTargetDate}
                    onChange={(val) => setEditTargetDate(val)}
                    isArabic={isArabic}
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {isArabic ? "اختر التوقيت لإطلاق الحفل والعد التنازلي، أو اتركه فارغاً لإبقاء الموسم مستمراً." : "Select the target date & time to launch countdown, or clear to keep Season in Progress."}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-amber-400 uppercase block mb-1">{isArabic ? "الفائز بالحذاء الذهبي" : "Golden Boot Winner"}</label>
                    <input
                      type="text"
                      value={editBootWinner}
                      onChange={(e) => setEditBootWinner(e.target.value)}
                      placeholder={isArabic ? "اسم اللاعب" : "Player Name"}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-amber-400 uppercase block mb-1">{isArabic ? "عدد الأهداف" : "Goals Scored"}</label>
                    <input
                      type="number"
                      value={editBootGoals}
                      onChange={(e) => setEditBootGoals(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 uppercase block mb-1">{isArabic ? "الفائز بالقفاز الذهبي" : "Golden Glove Winner"}</label>
                    <input
                      type="text"
                      value={editGloveWinner}
                      onChange={(e) => setEditGloveWinner(e.target.value)}
                      placeholder={isArabic ? "اسم الحارس" : "Goalkeeper Name"}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 uppercase block mb-1">{isArabic ? "كلين شيت" : "Clean Sheets"}</label>
                    <input
                      type="number"
                      value={editGloveSheets}
                      onChange={(e) => setEditGloveSheets(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-emerald-400 uppercase block mb-1">{isArabic ? "صانع ألعاب الموسم" : "Playmaker Winner"}</label>
                    <input
                      type="text"
                      value={editPlaymaker}
                      onChange={(e) => setEditPlaymaker(e.target.value)}
                      placeholder={isArabic ? "اسم اللاعب" : "Assister Name"}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-purple-400 uppercase block mb-1">{isArabic ? "أفضل لاعب (MVP)" : "Season MVP"}</label>
                    <input
                      type="text"
                      value={editMvp}
                      onChange={(e) => setEditMvp(e.target.value)}
                      placeholder={isArabic ? "اسم اللاعب" : "MVP Player Name"}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-emerald-400 uppercase block">{isArabic ? "تشكيلة الموسم (TOTS خماسي)" : "Team of the Season (TOTS 5-a-side)"}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder={isArabic ? "حارس المرمى (GK)" : "Goalkeeper (GK)"} value={editGk} onChange={(e) => setEditGk(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                    <input type="text" placeholder={isArabic ? "المهاجم (STR)" : "Striker (STR)"} value={editStr} onChange={(e) => setEditStr(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                    <input type="text" placeholder={isArabic ? "مدافع 1 (DEF)" : "Defender 1 (DEF)"} value={editDef1} onChange={(e) => setEditDef1(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                    <input type="text" placeholder={isArabic ? "مدافع 2 (DEF)" : "Defender 2 (DEF)"} value={editDef2} onChange={(e) => setEditDef2(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                    <input type="text" placeholder={isArabic ? "لاعب وسط (MID)" : "Midfielder (MID)"} value={editMid} onChange={(e) => setEditMid(e.target.value)} className="col-span-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl">
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1 bg-amber-500 text-black font-black rounded-xl">
                    {saving ? (isArabic ? "جاري الحفظ..." : "Saving...") : (isArabic ? "حفظ الإعدادات" : "Save Settings")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </Portal>
      )}
    </div>
  );
}
