"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Megaphone, Calendar, User, ChevronRight, X, Plus, Sparkles, Undo2, Send, Tag } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SolidSelect } from "@/components/ui/SolidSelect";
import { toast } from "sonner";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { generateAIResponse } from "@/lib/aiService";

type Category = "All" | "Tournaments" | "Stadium Maintenance" | "Special Offers" | "Platform Updates";

interface Announcement {
  id: string;
  category: Category;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  badgeColor?: string;
}

export default function AnnouncementsPage() {
  const t = useTranslations("Announcements");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const appUser = useAuthStore((s) => s.appUser);
  const isOwnerOrAdmin = appUser?.role === 'admin' || appUser?.role === 'owner';

  const categories: { key: Category; label: string }[] = [
    { key: "All", label: isArabic ? "الكل" : "All" },
    { key: "Tournaments", label: isArabic ? "البطولات" : "Tournaments" },
    { key: "Stadium Maintenance", label: isArabic ? "صيانة الملاعب" : "Stadium Maintenance" },
    { key: "Special Offers", label: isArabic ? "العروض الخاصة" : "Special Offers" },
    { key: "Platform Updates", label: isArabic ? "تحديثات المنصة" : "Platform Updates" },
  ];

  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Owner Publisher State
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubSummary, setPubSummary] = useState("");
  const [pubCategory, setPubCategory] = useState<Category>("Platform Updates");
  const [prevTitle, setPrevTitle] = useState("");
  const [prevSummary, setPrevSummary] = useState("");
  const [isAiImproving, setIsAiImproving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'push' | 'chat'>('push');

  React.useEffect(() => {
    async function fetchAnnouncements() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "announcements"), orderBy("timestamp", "desc")));
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
          setAnnouncements(list);
        } else {
          setAnnouncements([]);
        }
      } catch (err) {
        console.error(err);
        toast.error(isArabic ? "حدث خطأ أثناء تحميل الإعلانات" : "Failed to load announcements");
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const handleAiImprove = async () => {
    if (!pubTitle.trim() && !pubSummary.trim()) {
      toast.error(isArabic ? "يرجى كتابة عنوان أو مسودة أولاً لتحسينها!" : "Please enter a title or summary draft to improve!");
      return;
    }
    setIsAiImproving(true);
    setPrevTitle(pubTitle);
    setPrevSummary(pubSummary);

    try {
      const prompt = `Improve this platform announcement draft to sound highly professional, energetic, and engaging for football players in Obour & Cairo:\nTitle: ${pubTitle}\nSummary: ${pubSummary}`;
      const res = await generateAIResponse(prompt, { locale: isArabic ? 'ar' : 'en' });
      const parts = res.text.split('\n');
      if (parts.length >= 2) {
        setPubTitle(parts[0].replace(/^Title:\s*/i, '').trim());
        setPubSummary(parts.slice(1).join(' ').replace(/^Summary:\s*/i, '').trim());
      } else {
        setPubSummary(res.text.trim());
      }
      toast.success(isArabic ? "تم تطبيق التحسين الذكي! يمكنك التراجع في أي وقت ✨" : "AI Polish applied! Revert anytime with Undo 🪄");
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? "فشل التحسين بالذكاء الاصطناعي" : "AI improvement failed");
    } finally {
      setIsAiImproving(false);
    }
  };

  const handleUndo = () => {
    if (prevTitle || prevSummary) {
      setPubTitle(prevTitle);
      setPubSummary(prevSummary);
      toast.info(isArabic ? "تم التراجع للمسودة السابقة" : "Reverted to previous draft!");
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim() || !pubSummary.trim()) {
      toast.error(isArabic ? "يرجى ملء العنوان والتفاصيل" : "Please fill in both title and summary");
      return;
    }
    setSubmitting(true);
    try {
      const newDoc = {
        title: pubTitle.trim(),
        summary: pubSummary.trim(),
        content: pubSummary.trim(),
        category: pubCategory,
        date: new Date().toLocaleDateString(isArabic ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" }),
        author: appUser?.name || "EGFootball5 Team",
        timestamp: Date.now(),
      };
      const ref = await addDoc(collection(db, "announcements"), newDoc);
      setAnnouncements((prev) => [{ id: ref.id, ...newDoc }, ...prev]);
      toast.success(isArabic ? "تم نشر الإعلان الرسمي مباشرة! 📢" : "Official Announcement published live! 📢");
      setIsPublishOpen(false);
      setPubTitle("");
      setPubSummary("");
    } catch (err) {
      console.error(err);
      toast.error(isArabic ? "فشل نشر الإعلان" : "Failed to publish announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) => activeCategory === "All" || a.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center" dir={isArabic ? "rtl" : "ltr"}>
      <div className="relative z-10 w-full max-w-5xl space-y-8">
        {/* Header section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-black uppercase">
              <Megaphone className="w-4 h-4 shrink-0" /> <span>{isArabic ? "موجز الأخبار والتحديثات الرسمية" : "Official News Feed"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight leading-tight">
              {isArabic ? "الإعلانات والتحديثات الرسمية" : "Announcements & Updates"}
            </h1>
          </motion.div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isOwnerOrAdmin && (
              <Button
                onClick={() => setIsPublishOpen(true)}
                size="lg"
                className="bg-primary text-black font-black rounded-2xl glow-primary cursor-pointer flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm shrink-0"
              >
                <Plus className="w-5 h-5 shrink-0" /> <span>{isArabic ? "نشر إعلان جديد" : "Push Announcement"}</span>
              </Button>
            )}

          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.key
                  ? "bg-primary text-black shadow-lg glow-primary"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Announcements Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="global-box border-white/10 rounded-3xl p-12 text-center text-muted-foreground font-bold bg-black">
                {isArabic ? "لا توجد إعلانات رسمية منشورة حالياً." : "No official announcements published yet."}
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden" 
              animate="show" 
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="space-y-4"
            >
              {filteredAnnouncements.map((a) => (
                <motion.div 
                  key={a.id} 
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                >
                  <Card
                    onClick={() => setSelectedAnnouncement(a)}
                    className="global-box border-white/10 rounded-3xl p-6 shadow-xl cursor-pointer hover:border-emerald-500/40 transition-all space-y-3 bg-black"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                        {a.category}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{a.date}</span>
                    </div>
                    <h3 className="text-xl font-black text-foreground">{a.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{a.summary}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal Details & Publisher Modal */}
      <AnimatePresence>
        {isPublishOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPublishOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xl bg-black border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" /> {isArabic ? "نشر إعلان جديد" : "Push New Announcement"}
                </h2>
                <button onClick={() => setIsPublishOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{isArabic ? "العنوان" : "Title"}</label>
                  <input
                    type="text"
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    placeholder={isArabic ? "مثال: الإعلان عن بطولة صيف العبور!" : "e.g. Obour Summer Cup Gala Announced!"}
                    className="w-full bg-black border border-white/15 rounded-2xl p-3 text-sm text-foreground focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">{isArabic ? "الفئة" : "Category"}</label>
                  <SolidSelect
                    value={pubCategory}
                    onChange={(val) => setPubCategory(val as Category)}
                    options={categories.filter((c) => c.key !== 'All').map((c) => ({ value: c.key, label: c.label }))}
                    icon={Tag}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground">{isArabic ? "التفاصيل والمحتوى" : "Summary & Content"}</label>
                    <div className="flex items-center gap-2">
                      {prevSummary && (
                        <button
                          onClick={handleUndo}
                          className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Undo2 className="w-3 h-3" /> {isArabic ? "تراجع" : "Undo AI"}
                        </button>
                      )}
                      <button
                        onClick={handleAiImprove}
                        disabled={isAiImproving}
                        className="text-[11px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> {isAiImproving ? (isArabic ? "جاري التحسين..." : "AI Improving...") : (isArabic ? "✨ تحسين بالذكاء الاصطناعي" : "✨ AI Improve Text")}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={pubSummary}
                    onChange={(e) => setPubSummary(e.target.value)}
                    placeholder={isArabic ? "اكتب تفاصيل الإعلان..." : "Write announcement details..."}
                    className="w-full bg-black border border-white/15 rounded-2xl p-3 text-sm text-foreground focus:border-primary outline-none"
                  />
                </div>

                <Button
                  onClick={handlePublish}
                  disabled={submitting}
                  className="w-full bg-primary text-black font-black rounded-2xl py-6 glow-primary cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> {submitting ? (isArabic ? "جاري النشر..." : "Publishing...") : (isArabic ? "نشر الإعلان الرسمي" : "Publish Official Announcement")}
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {selectedAnnouncement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-black border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-6 start-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-6 mt-2">
                <span className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block">
                  {selectedAnnouncement.category}
                </span>
                <h2 className="text-3xl font-bold">{selectedAnnouncement.title}</h2>
                <div className="flex items-center gap-6 text-sm text-neutral-400 border-b border-white/10 pb-6">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{selectedAnnouncement.date}</span>
                  <span className="flex items-center gap-2"><User className="w-4 h-4" />{selectedAnnouncement.author}</span>
                </div>
                <div className="text-neutral-300 leading-relaxed space-y-4">
                  {selectedAnnouncement.summary}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
