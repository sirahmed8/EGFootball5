'use client';

import * as React from 'react';
import { getUserByUsername } from '@/lib/username';
import { User as AppUser } from '@/types';
import { ProfilePageSkeleton } from '@/components/skeletons/PageSkeletons';
import { Button } from '@/components/ui/button';
import { Crown, Star, Shield, AtSign, ArrowLeft, Share2 } from 'lucide-react';
import { isUserVip } from '@/lib/vip';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';

export function UserProfileView({ username }: { username: string }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [targetUser, setTargetUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    async function loadUser() {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const user = await getUserByUsername(username);
        if (user) {
          setTargetUser(user);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [username]);

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(isArabic ? 'تم نسخ رابط الملف الشخصي!' : 'Profile link copied to clipboard!');
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (notFound || !targetUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
          <AtSign className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-black text-foreground">
            {isArabic ? 'لم يتم العثور على اللاعب' : 'Player Not Found'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? `لا يوجد حساب مسجل باسم المستخدم @${username}.`
              : `No registered player account found with handle @${username}.`}
          </p>
        </div>
        <Link href="/home">
          <Button className="rounded-2xl font-bold bg-primary text-black hover:bg-primary/90 cursor-pointer">
            <ArrowLeft className="w-4 h-4 me-2" />
            <span>{isArabic ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </Button>
        </Link>
      </div>
    );
  }

  const isVip = isUserVip(targetUser);

  return (
    <div className="min-h-screen bg-black text-foreground py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header Back & Share Bar */}
      <div className="flex items-center justify-between">
        <Link href="/home">
          <Button variant="ghost" className="rounded-xl hover:bg-white/10 cursor-pointer">
            <ArrowLeft className="w-4 h-4 me-2" />
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </Button>
        </Link>

        <Button onClick={handleShareProfile} variant="outline" className="rounded-2xl border-white/10 hover:bg-white/10 gap-2">
          <Share2 className="w-4 h-4 text-primary" />
          <span>{isArabic ? 'مشاركة الملف' : 'Share Profile'}</span>
        </Button>
      </div>

      {/* Main Profile Header Card */}
      <div className={`rounded-3xl border p-6 md:p-8 shadow-2xl relative overflow-hidden bg-black/60 backdrop-blur-2xl ${isVip ? 'border-amber-500/40 glow-amber' : 'border-white/10'}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-emerald-600/20 border-2 border-primary flex items-center justify-center text-4xl font-black text-primary shadow-xl">
              {targetUser.photoURL ? (
                <img src={targetUser.photoURL} alt={targetUser.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                targetUser.name.charAt(0).toUpperCase()
              )}
            </div>
            {isVip && (
              <div className="absolute -top-2 -end-2 w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg animate-bounce">
                <Crown className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-start flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl font-black text-foreground">{targetUser.name}</h1>
              {isVip && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> VIP Member 👑
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-amber-400 font-mono flex items-center justify-center sm:justify-start gap-1">
              <AtSign className="w-4 h-4" />
              <span>{targetUser.username || username}</span>
            </p>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" /> {targetUser.position || 'MID'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" /> Level {targetUser.skillLevel || 3}/5
              </span>
              {targetUser.favoriteTeam && (
                <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground">
                  ❤️ {targetUser.favoriteTeam}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1">
          <span className="text-2xl font-black text-primary block">{targetUser.matchesPlayed || 0}</span>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{isArabic ? 'المباريات' : 'Matches'}</span>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1">
          <span className="text-2xl font-black text-amber-400 block">{targetUser.goalsCount || 0}</span>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{isArabic ? 'الأهداف' : 'Goals'}</span>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1">
          <span className="text-2xl font-black text-emerald-400 block">{targetUser.mvpBadges || 0}</span>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{isArabic ? 'جوائز MVP' : 'MVP Awards'}</span>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1">
          <span className="text-2xl font-black text-purple-400 block">{targetUser.playerLevel || 'Rookie'}</span>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{isArabic ? 'المستوى' : 'Rank'}</span>
        </div>
      </div>
    </div>
  );
}
