"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Megaphone, Calendar, User, ChevronRight, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

type Category = "All" | "Tournaments" | "Stadium Maintenance" | "Special Offers" | "Platform Updates";

interface Announcement {
  id: string;
  category: Category;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  badgeColor: string;
}

const announcementsData: Announcement[] = [
  {
    id: "1",
    category: "Tournaments",
    title: "Summer League Registration Open",
    summary: "Sign up now for the upcoming Summer League. Limited slots available!",
    content: "The annual Summer League is back! Assemble your team and register before August 15th. We have exciting new prizes this year, including custom kits for the winning team and a grand cash prize. Don't miss out on the biggest tournament of the season.",
    date: "2026-07-25",
    author: "EG Football Team",
    badgeColor: "bg-blue-500",
  },
  {
    id: "2",
    category: "Stadium Maintenance",
    title: "Pitch 3 Turf Replacement",
    summary: "Pitch 3 will be closed for maintenance next weekend.",
    content: "To ensure the highest quality playing surface, Pitch 3 will undergo a full turf replacement starting this Friday. It will remain closed throughout the weekend and will reopen on Monday morning. We apologize for any inconvenience.",
    date: "2026-07-24",
    author: "EG Football Team",
    badgeColor: "bg-emerald-500",
  },
  {
    id: "3",
    category: "Special Offers",
    title: "Weekend Discount: 20% Off",
    summary: "Book any pitch this weekend and get a 20% discount.",
    content: "Celebrate the start of the new month with our special weekend discount. Use code WKND20 at checkout to receive 20% off any pitch booking for this upcoming Saturday or Sunday. Valid for all time slots.",
    date: "2026-07-22",
    author: "EG Football Team",
    badgeColor: "bg-amber-500",
  },
  {
    id: "4",
    category: "Platform Updates",
    title: "New Matchmaking Feature Live",
    summary: "Find opponents easier with our new matchmaking system.",
    content: "We're thrilled to announce the launch of our new matchmaking feature! You can now mark your team as 'Looking for Match' and our system will connect you with teams of similar skill levels. Try it out in the Teams tab.",
    date: "2026-07-20",
    author: "EG Football Team",
    badgeColor: "bg-purple-500",
  },
];

const categories: Category[] = ["All", "Tournaments", "Stadium Maintenance", "Special Offers", "Platform Updates"];

export default function AnnouncementsPage() {
  const t = useTranslations("Announcements");
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const filteredAnnouncements = announcementsData.filter(
    (a) => activeCategory === "All" || a.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 relative overflow-hidden flex flex-col items-center">
      {/* Premium Glassmorphic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('/stadium-lights.jpg')] bg-cover bg-center" />
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400">
              <Megaphone className="w-5 h-5" />
              <span className="font-semibold">{t("feedTitle", { defaultMessage: "Official Platform News" })}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">{t("announcements", { defaultMessage: "Updates & Announcements" })}</h1>
          </motion.div>

          {/* Subscribe Toggle */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSubscribed(!isSubscribed)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              isSubscribed
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
            }`}
          >
            {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            {isSubscribed ? t("subscribed", { defaultMessage: "Subscribed" }) : t("subscribe", { defaultMessage: "Subscribe to Updates" })}
          </motion.button>
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-white text-black font-semibold shadow-lg shadow-white/20"
                  : "bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Announcements Feed */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map((announcement, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                key={announcement.id}
                onClick={() => setSelectedAnnouncement(announcement)}
                className="group cursor-pointer rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-6 hover:bg-white/10 transition-colors relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-md ${announcement.badgeColor} text-white`}>
                        {announcement.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-neutral-400">
                        <Calendar className="w-4 h-4" />
                        {announcement.date}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{announcement.title}</h2>
                    <p className="text-neutral-300">{announcement.summary}</p>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <User className="w-4 h-4" />
                      {announcement.author}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredAnnouncements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-neutral-500"
            >
              {t("noAnnouncements", { defaultMessage: "No announcements in this category." })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
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
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-6 mt-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-md ${selectedAnnouncement.badgeColor} text-white inline-block`}>
                  {selectedAnnouncement.category}
                </span>
                <h2 className="text-3xl font-bold">{selectedAnnouncement.title}</h2>
                <div className="flex items-center gap-6 text-sm text-neutral-400 border-b border-white/10 pb-6">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{selectedAnnouncement.date}</span>
                  <span className="flex items-center gap-2"><User className="w-4 h-4" />{selectedAnnouncement.author}</span>
                </div>
                <div className="text-neutral-300 leading-relaxed space-y-4">
                  {selectedAnnouncement.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
