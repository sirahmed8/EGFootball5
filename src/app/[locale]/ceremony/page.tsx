"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Shield, Users, Timer, Sparkles, Settings, CheckCircle2, Save, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";

interface SeasonData {
  targetDate: string; // ISO string e.g. "2026-08-31T20:00:00Z"
  goldenBootWinner?: string;
  goldenBootGoals?: number;
  goldenGloveWinner?: string;
  goldenGloveSheets?: number;
  totsGk?: string;
  totsDef1?: string;
  totsDef2?: string;
  totsMid?: string;
  totsStr?: string;
}

const DEFAULT_TARGET = "2026-08-31T20:00:00Z";

export default function CeremonyPage() {
  const t = useTranslations("Ceremony");
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);
  const isAdminOrOwner = appUser?.role === "admin" || appUser?.role === "owner";

  const [seasonData, setSeasonData] = useState<SeasonData>({
    targetDate: DEFAULT_TARGET,
    goldenBootWinner: "Pending Season End",
    goldenBootGoals: 0,
    goldenGloveWinner: "Pending Season End",
    goldenGloveSheets: 0,
    totsGk: "Top GK",
    totsDef1: "Top DEF 1",
    totsDef2: "Top DEF 2",
    totsMid: "Top MID",
    totsStr: "Top STR",
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTargetDate, setEditTargetDate] = useState(DEFAULT_TARGET);
  const [editBootWinner, setEditBootWinner] = useState("");
  const [editBootGoals, setEditBootGoals] = useState(0);
  const [editGloveWinner, setEditGloveWinner] = useState("");
  const [editGloveSheets, setEditGloveSheets] = useState(0);
  const [editGk, setEditGk] = useState("");
  const [editDef1, setEditDef1] = useState("");
  const [editDef2, setEditDef2] = useState("");
  const [editMid, setEditMid] = useState("");
  const [editStr, setEditStr] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch Season Data & Compute Automatic Winners from Live Firestore Stats
  useEffect(() => {
    async function fetchSeasonDocAndStats() {
      try {
        const snap = await getDoc(doc(db, "system", "season"));
        let target = DEFAULT_TARGET;
        if (snap.exists()) {
          const data = snap.data() as SeasonData;
          target = data.targetDate || DEFAULT_TARGET;
        }

        // Query real top players from Firestore users collection
        const usersSnap = await getDocs(collection(db, "users"));
        if (!usersSnap.empty) {
          const allUsers = usersSnap.docs
            .map((d) => {
              const data = d.data();
              return {
                name: data.name || data.displayName || "Player",
                position: data.position || "MID",
                goals: Number(data.goals) || 0,
                saves: Number(data.saves) || 0,
                rating: Number(data.rating) || 0,
              };
            })
            .filter((u) => u.goals > 0 || u.saves > 0 || u.rating > 0);

          if (allUsers.length > 0) {
            // Compute Golden Boot
            const topScorer = [...allUsers].sort((a, b) => b.goals - a.goals)[0];
            // Compute Golden Glove
            const topGk = [...allUsers].filter((u) => u.position === 'GK').sort((a, b) => b.saves - a.saves)[0] || allUsers[0];
            // Compute TOTS
            const totsDef = allUsers.filter((u) => u.position === 'DEF').sort((a, b) => b.rating - a.rating);
            const totsMid = allUsers.filter((u) => u.position === 'MID').sort((a, b) => b.rating - a.rating)[0] || allUsers[0];

            setSeasonData({
              targetDate: target,
              goldenBootWinner: topScorer.goals > 0 ? topScorer.name : "Pending Season End",
              goldenBootGoals: topScorer.goals,
              goldenGloveWinner: topGk.saves > 0 ? topGk.name : "Pending Season End",
              goldenGloveSheets: topGk.saves,
              totsGk: topGk.name,
              totsDef1: totsDef[0]?.name || "Pending",
              totsDef2: totsDef[1]?.name || "Pending",
              totsMid: totsMid?.name || "Pending",
              totsStr: topScorer.name,
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchSeasonDocAndStats();
  }, []);

  // Live Fixed Date Countdown Calculation
  useEffect(() => {
    function updateCountdown() {
      const targetTime = new Date(seasonData.targetDate || DEFAULT_TARGET).getTime();
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [seasonData.targetDate]);

  const handleSaveSeasonSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: SeasonData = {
        targetDate: editTargetDate,
        goldenBootWinner: editBootWinner.trim() || "Pending Season End",
        goldenBootGoals: Number(editBootGoals) || 0,
        goldenGloveWinner: editGloveWinner.trim() || "Pending Season End",
        goldenGloveSheets: Number(editGloveSheets) || 0,
        totsGk: editGk.trim() || "Top GK",
        totsDef1: editDef1.trim() || "Top DEF 1",
        totsDef2: editDef2.trim() || "Top DEF 2",
        totsMid: editMid.trim() || "Top MID",
        totsStr: editStr.trim() || "Top STR",
      };
      await setDoc(doc(db, "system", "season"), updated, { merge: true });
      setSeasonData(updated);
      toast.success("Season ceremony settings updated!");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save ceremony settings");
    } finally {
      setSaving(false);
    }
  };

  const totsPlayers = [
    { position: "GK", top: "85%", left: "50%", name: seasonData.totsGk || "Top GK" },
    { position: "DEF", top: "65%", left: "25%", name: seasonData.totsDef1 || "Top DEF 1" },
    { position: "DEF", top: "65%", left: "75%", name: seasonData.totsDef2 || "Top DEF 2" },
    { position: "MID", top: "45%", left: "50%", name: seasonData.totsMid || "Top MID" },
    { position: "STR", top: "25%", left: "50%", name: seasonData.totsStr || "Top STR" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center">
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
              <span className="font-semibold">{t("galaTitle", { defaultMessage: "End-of-Season Ceremony & Trophy Gala" })}</span>
            </div>
            {isAdminOrOwner && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                size="sm"
                className="bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl text-xs ms-3 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 me-1" /> Edit Ceremony Settings
              </Button>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gradient-primary">
            {t("mainHeading", { defaultMessage: "Season Finale" })}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
            Official countdown to the Grand Season Ceremony, Trophy Distribution & Awards Gala.
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 md:gap-6"
        >
          {[
            { label: t("days"), value: timeLeft.days },
            { label: t("hours"), value: timeLeft.hours },
            { label: t("minutes"), value: timeLeft.minutes },
            { label: t("seconds"), value: timeLeft.seconds },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl global-box global-outline-glow min-w-[100px] md:min-w-[130px] shadow-xl">
              <span className="text-3xl md:text-5xl font-black text-primary mb-1 font-mono">{item.value.toString().padStart(2, "0")}</span>
              <span className="text-[11px] md:text-xs font-black text-muted-foreground uppercase tracking-widest text-center whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Awards Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Trophies Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-3xl p-6 md:p-8 bg-black border border-amber-500/20 global-box"
            >
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-400">{t("goldenBoot", { defaultMessage: "Golden Boot" })}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{t("goldenBootDesc", { defaultMessage: "Awarded to the top goalscorer of the season." })}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                      🏆 {seasonData.goldenBootWinner || "Pending Season End"}
                    </span>
                    {seasonData.goldenBootGoals ? (
                      <span className="text-xs font-bold text-emerald-400">⚽ {seasonData.goldenBootGoals} Goals</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative overflow-hidden rounded-3xl p-6 md:p-8 bg-black border border-white/10 global-box"
            >
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 rounded-2xl bg-slate-300/20 text-slate-300">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-300">{t("goldenGlove", { defaultMessage: "Golden Glove" })}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{t("goldenGloveDesc", { defaultMessage: "Awarded to the best goalkeeper with the most clean sheets." })}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-300 font-bold text-xs">
                      🧤 {seasonData.goldenGloveWinner || "Pending Season End"}
                    </span>
                    {seasonData.goldenGloveSheets ? (
                      <span className="text-xs font-bold text-cyan-400">🛡️ {seasonData.goldenGloveSheets} Clean Sheets</span>
                    ) : null}
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
            className="rounded-3xl p-6 bg-black border border-white/10 global-box relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-black text-foreground">{t("tots", { defaultMessage: "Team of the Season (5-a-side)" })}</h3>
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-white shadow-lg flex items-center justify-center font-black text-black group-hover:scale-110 transition-transform">
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

      {/* Admin Edit Season Ceremony Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="global-box border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" /> Admin Season Ceremony Settings
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSeasonSettings} className="space-y-4 text-xs font-bold">
              <div>
                <label className="text-muted-foreground uppercase block mb-1">Season End Target Date (ISO Format)</label>
                <input
                  type="text"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  placeholder="2026-08-31T20:00:00Z"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-amber-400 uppercase block mb-1">Golden Boot Winner</label>
                  <input
                    type="text"
                    value={editBootWinner}
                    onChange={(e) => setEditBootWinner(e.target.value)}
                    placeholder="Player Name"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-amber-400 uppercase block mb-1">Goals Scored</label>
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
                  <label className="text-slate-300 uppercase block mb-1">Golden Glove Winner</label>
                  <input
                    type="text"
                    value={editGloveWinner}
                    onChange={(e) => setEditGloveWinner(e.target.value)}
                    placeholder="Goalkeeper Name"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-slate-300 uppercase block mb-1">Clean Sheets</label>
                  <input
                    type="number"
                    value={editGloveSheets}
                    onChange={(e) => setEditGloveSheets(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-emerald-400 uppercase block">Team of the Season (TOTS 5-a-side)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Goalkeeper (GK)" value={editGk} onChange={(e) => setEditGk(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                  <input type="text" placeholder="Striker (STR)" value={editStr} onChange={(e) => setEditStr(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                  <input type="text" placeholder="Defender 1 (DEF)" value={editDef1} onChange={(e) => setEditDef1(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                  <input type="text" placeholder="Defender 2 (DEF)" value={editDef2} onChange={(e) => setEditDef2(e.target.value)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                  <input type="text" placeholder="Midfielder (MID)" value={editMid} onChange={(e) => setEditMid(e.target.value)} className="col-span-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground" />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-amber-500 text-black font-black rounded-xl">
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
