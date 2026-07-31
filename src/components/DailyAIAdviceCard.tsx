'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import { generateAIResponse } from '@/lib/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Lightbulb, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function DailyAIAdviceCard() {
  const { appUser, firebaseUser } = useAuthStore();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations('AiAdvice');

  const userUid = firebaseUser?.uid || 'guest';
  const cooldownKey = `ai_advice_cooldown_${userUid}`;
  const textKey = `ai_advice_text_${userUid}`;

  const [advice, setAdvice] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(textKey);
    }
    return null;
  });

  const [cooldownEnd, setCooldownEnd] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(cooldownKey);
      return stored ? Number(stored) : 0;
    }
    return 0;
  });

  const [minsLeft, setMinsLeft] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      if (!cooldownEnd) {
        setMinsLeft(0);
        return;
      }
      const diff = Math.ceil((cooldownEnd - Date.now()) / 60000);
      setMinsLeft(diff > 0 ? diff : 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const fetchAdvice = async () => {
    if (minsLeft > 0) {
      toast.error(
        isArabic
          ? `يمكنك طلب نصيحة جديدة بعد ${minsLeft} دقيقة (تُتاح نصيحة واحدة كل 1 ساعة)`
          : `Next AI Football Insight ready in ${minsLeft} minutes (1 insight per hour)`
      );
      return;
    }

    setLoading(true);
    try {
      const userName = appUser?.name || 'Player';
      const prompt = isArabic
        ? `أعطني نصيحة كروية تكتيكية أو تدريبية سريعة ومحفزة للاعب اسمه ${userName}. اجعلها قصيرة، إيجابية ومفيدة في سطرين فقط.`
        : `Give me a quick tactical or fitness football tip and motivation for a player named ${userName}. Keep it concise, inspiring, and 2-3 lines max.`;

      const result = await generateAIResponse(prompt, {
        systemContext: `Player stats and profile context: Name: ${userName}, Role: ${appUser?.role || 'player'}`,
        locale,
      });

      const nextCooldown = Date.now() + 3600000;
      setAdvice(result.text);
      setCooldownEnd(nextCooldown);

      if (typeof window !== 'undefined') {
        localStorage.setItem(cooldownKey, nextCooldown.toString());
        localStorage.setItem(textKey, result.text);
      }

      toast.success(isArabic ? 'تم توليد النصيحة التكتيكية بنجاح! ⚽' : 'AI Football Insight generated successfully! ⚽');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch AI advice';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isLocked = minsLeft > 0;

  return (
    <Card className="global-box global-outline-glow relative overflow-hidden rounded-3xl p-1 bg-black">
      <div className="absolute top-0 end-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              {isArabic ? '💡 نصائح AI الكروية والتكتيكية' : '💡 Hourly AI Football Insights'}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">
              {isArabic ? 'نصيحة تكتيكية ومحفزة تكتيكية' : 'Personalized tactical & fitness advice'}
            </p>
          </div>
        </div>

        {isLocked && (
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {minsLeft}m cooldown
          </span>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {advice && (
          <div className="p-3.5 rounded-xl bg-black border border-emerald-500/30 text-sm text-foreground leading-relaxed flex items-start gap-2.5 shadow-inner">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{advice}</p>
          </div>
        )}

        <Button
          onClick={fetchAdvice}
          disabled={loading || isLocked}
          className={`w-full font-bold shadow-md transition-all rounded-2xl global-btn cursor-pointer ${
            isLocked
              ? 'bg-white/5 text-muted-foreground border border-white/10 cursor-not-allowed'
              : 'bg-primary text-black hover:bg-primary/90 glow-primary'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {isArabic ? 'جاري التحليل وتوليد النصيحة...' : 'Analyzing & Generating Insight...'}
            </span>
          ) : isLocked ? (
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              {isArabic ? `مُتاح بعد ${minsLeft} دقيقة` : `Next Insight Ready in ${minsLeft} mins`}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isArabic ? 'احصل على نصيحة تكتيكية' : 'Get AI Tactical Insight'}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
