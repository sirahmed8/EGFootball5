"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Megaphone, Plus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  AnnouncementDetailsModal,
  Announcement,
  Category,
} from "./components/AnnouncementDetailsModal";
import { PublishAnnouncementModal } from "./components/PublishAnnouncementModal";

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
  const [submitting, setSubmitting] = useState(false);


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

  const handlePublish = async (data: { title: string; summary: string; category: Category }) => {
    setSubmitting(true);
    try {
      const newDoc = {
        title: data.title,
        summary: data.summary,
        content: data.summary,
        category: data.category,
        date: new Date().toLocaleDateString(isArabic ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" }),
        author: appUser?.name || "EGFootball5 Team",
        timestamp: Date.now(),
      };
      const ref = await addDoc(collection(db, "announcements"), newDoc);
      setAnnouncements((prev) => [{ id: ref.id, ...newDoc }, ...prev]);
      toast.success(isArabic ? "تم نشر الإعلان الرسمي مباشرة! 📢" : "Official Announcement published live! 📢");
      setIsPublishOpen(false);
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
      <PublishAnnouncementModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        categories={categories}
        onPublish={handlePublish}
        submitting={submitting}
        isArabic={isArabic}
      />

      <AnnouncementDetailsModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        isArabic={isArabic}
      />
    </div>
  );
}

