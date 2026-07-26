'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale } from 'next-intl';
import { generateAIResponse } from '@/lib/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, RefreshCw, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export function DailyAIAdviceCard() {
  const { appUser, firebaseUser } = useAuthStore();
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const userUid = firebaseUser?.uid || 'guest';
  const todayDate = new Date().toISOString().split('T')[0];
  const storageKey = `11players_ai_advice_${todayDate}_${userUid}`;

  const MAX_DAILY_USES = 3;
  const [usedCount, setUsedCount] = useState<number>(0);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = parseInt(stored, 10);
        setUsedCount(isNaN(parsed) ? 0 : parsed);
      } else {
        setUsedCount(0);
      }

      // Check if there's saved advice text for today
      const savedAdvice = localStorage.getItem(`${storageKey}_text`);
      if (savedAdvice) {
        setAdvice(savedAdvice);
      }
    }
  }, [storageKey]);

  const remaining = Math.max(0, MAX_DAILY_USES - usedCount);

  const fetchDailyAdvice = async () => {
    if (usedCount >= MAX_DAILY_USES) {
      toast.error(
        isArabic
          ? '🔒 تم الوصول للحد اليومي 3/3 (عد غداً للحصول على المزيد)'
          : '🔒 Daily 3/3 Limit Reached (Return Tomorrow)'
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

      const newCount = usedCount + 1;
      setUsedCount(newCount);
      setAdvice(result.text);

      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newCount.toString());
        localStorage.setItem(`${storageKey}_text`, result.text);
      }

      toast.success(
        isArabic
          ? `✨ حصلت على نصيحة اليوم! المتبقي: ${MAX_DAILY_USES - newCount}/${MAX_DAILY_USES}`
          : `✨ Daily AI Advice generated! Remaining: ${MAX_DAILY_USES - newCount}/${MAX_DAILY_USES}`
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch AI advice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-950/40 via-card/80 to-background border-emerald-500/30 shadow-lg backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              {isArabic ? '💡 نصائح اليوم الذكية (AI)' : '💡 Daily AI Football Insights'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'نصائح تكتيكية ولياقة يومية مخصصة لك' : 'Personalized tactical & fitness advice'}
            </p>
          </div>
        </div>

        {/* Badge counter */}
        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
            remaining > 0
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-destructive/20 text-destructive border-destructive/40'
          }`}
        >
          {usedCount}/{MAX_DAILY_USES}
        </span>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {advice && (
          <div className="p-3.5 rounded-xl bg-card/60 border border-emerald-500/20 text-sm text-foreground leading-relaxed flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{advice}</p>
          </div>
        )}

        <Button
          onClick={fetchDailyAdvice}
          disabled={loading || remaining === 0}
          className={`w-full font-bold shadow-md transition-all ${
            remaining > 0
              ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20'
              : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {isArabic ? 'جاري توليد النصيحة...' : 'Generating Advice...'}
            </span>
          ) : remaining === 0 ? (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {isArabic
                ? '🔒 تم الوصول للحد اليومي 3/3 (عد غداً)'
                : '🔒 Daily 3/3 Limit Reached (Return Tomorrow)'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isArabic
                ? `احصل على نصيحة جديدة (${remaining} متبقي)`
                : `Get Daily Advice (${remaining} left)`}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
