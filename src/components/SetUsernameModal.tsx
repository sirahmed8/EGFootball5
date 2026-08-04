'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, Loader2, AtSign, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import {
  validateUsernameFormat,
  checkUsernameAvailable,
  generateSuggestedUsernames,
  claimUsername,
  normalizeUsername,
} from '@/lib/username';

export function SetUsernameModal() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const appUser = useAuthStore((s) => s.appUser);
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [inputVal, setInputVal] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Show modal if user is logged in, appUser exists, but username is missing
  const isOpen = Boolean(firebaseUser && appUser && !appUser.username);

  // Generate handle suggestions based on user name/email
  const suggestions = React.useMemo(() => {
    if (!appUser?.name) return [];
    return generateSuggestedUsernames(appUser.name, appUser.email);
  }, [appUser?.name, appUser?.email]);

  // Debounced real-time username availability check
  React.useEffect(() => {
    const handle = inputVal.trim().replace(/^@/, '');
    if (!handle) {
      setIsAvailable(null);
      setErrorMsg(null);
      setChecking(false);
      return;
    }

    const validation = validateUsernameFormat(handle);
    if (!validation.valid) {
      setIsAvailable(false);
      setErrorMsg(validation.error || 'Invalid format');
      setChecking(false);
      return;
    }

    setChecking(true);
    setErrorMsg(null);

    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(handle);
      setChecking(false);
      setIsAvailable(available);
      if (!available) {
        setErrorMsg(isArabic ? 'هذا الاسم مستخدم بالفعل' : 'Username is already taken');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputVal, isArabic]);

  const handleSelectSuggestion = (suggested: string) => {
    setInputVal(suggested);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    const handle = normalizeUsername(inputVal);
    const validation = validateUsernameFormat(handle);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    if (isAvailable === false) {
      toast.error(isArabic ? 'الرجاء اختيار اسم مستخدم متاح' : 'Please choose an available username');
      return;
    }

    setSubmitting(true);
    try {
      const res = await claimUsername(firebaseUser.uid, handle);
      toast.success(
        isArabic
          ? `تم حجز اسم المستخدم الخاص بك: @${res.username} 🎉`
          : `Your handle @${res.username} has been claimed! 🎉`
      );
    } catch (err: any) {
      console.error(err);
      if (err.message === 'ERROR_USERNAME_TAKEN') {
        toast.error(isArabic ? 'هذا الاسم مستخدم بالفعل' : 'Username is already taken');
      } else {
        toast.error(err.message || (isArabic ? 'فشل حفظ اسم المستخدم' : 'Failed to save username'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-6 bg-[#0c1219] dark:bg-[#070b10] border border-amber-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5 backdrop-blur-2xl"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg glow-amber">
            <AtSign className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl font-black text-foreground flex items-center justify-center gap-2">
            <span>{isArabic ? 'اختر اسم المستخدم الخاص بك' : 'Claim Your @Username'}</span>
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isArabic
              ? 'مرحباً بك! اختر اسم مستخدم فريد ليتمكن أصدقاؤك من البحث عنك والوصول لملفك الشخصي بسهولة.'
              : 'Welcome! Choose a unique handle so players can search for you and visit your profile link easily.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
              {isArabic ? 'اسم المستخدم (@)' : 'Your Handle (@)'}
            </label>
            <div className="relative flex items-center">
              <span className="absolute start-4 text-muted-foreground font-black text-sm select-none">
                @
              </span>
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value.replace(/\s+/g, ''))}
                placeholder={isArabic ? 'مثال: ahmed_10' : 'e.g. ahmed_10'}
                className="ps-9 pe-10 h-12 bg-white/5 border-white/10 rounded-2xl font-bold text-foreground focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                maxLength={20}
                autoFocus
              />
              <div className="absolute end-3 flex items-center">
                {checking && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
                {!checking && isAvailable === true && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {!checking && isAvailable === false && (
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Validation message */}
            {errorMsg && (
              <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 pt-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
            {!errorMsg && isAvailable === true && (
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 pt-1">
                <Check className="w-3.5 h-3.5" />
                <span>{isArabic ? 'اسم المستخدم متاح!' : 'Username is available!'}</span>
              </p>
            )}
          </div>

          {/* Handle Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">
                {isArabic ? 'مقترحات سريعة:' : 'Suggested Handles:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-xs font-bold text-foreground transition-all cursor-pointer"
                  >
                    @{sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || checking || isAvailable !== true}
            className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-black font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isArabic ? 'جاري الحفظ...' : 'Claiming Handle...'}</span>
              </div>
            ) : (
              <span>{isArabic ? 'تأكيد وحفظ اسم المستخدم' : 'Confirm & Claim Handle'}</span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
