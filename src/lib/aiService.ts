// Secure Gemini AI Engine with Multi-Model Fallback & Server API Route Integration
import { getAuth } from 'firebase/auth';

interface CacheEntry {
  timestamp: number;
  data: AIResponseResult;
}

export interface AIResponseResult {
  text: string;
  chips: string[];
  modelUsed: string;
}

// 10-minute in-memory cache
const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCacheKey(prompt: string, imageBase64?: string, systemContext?: string): string {
  return `${prompt.trim()}_${imageBase64 ? imageBase64.substring(0, 40) : ''}_${systemContext || ''}`;
}

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      memoryCache.delete(key);
    }
  }
}

function detectIsArabic(prompt: string, locale?: string): boolean {
  const arabicRegex = /[\u0600-\u06FF]/;
  const englishRegex = /[a-zA-Z]/;

  if (arabicRegex.test(prompt)) return true;
  if (englishRegex.test(prompt)) return false;
  return locale === 'ar';
}

function generateClientFallback(prompt: string, isArabic: boolean): { text: string; chips: string[] } {
  const lower = prompt.toLowerCase();

  if (lower.includes('book') || lower.includes('حجز') || lower.includes('احجز')) {
    return {
      text: isArabic
        ? '⚽ **خطوات حجز الملعب:**\n1. اختر الملعب والتاريخ والساعة.\n2. يتم قفل الحجز 15 دقيقة (أو 20 دقيقة لـ VIP).\n3. ادفع العربون عبر فودافون كاش (01012345678) أو إنستا باي (egfootball5@instapay).\n4. احصل على رمز QR الفوري!'
        : '⚽ **How to book a pitch:**\n1. Pick pitch, date & time slot.\n2. Slot is locked 15 mins (20 mins for VIP).\n3. Pay deposit via Vodafone Cash or InstaPay.\n4. Get instant QR pass!',
      chips: isArabic
        ? ['💰 طرق دفع العربون', '🏟️ الملاعب المتاحة', '👑 مزايا عضوية VIP']
        : ['💰 Payment methods', '🏟️ Available pitches', '👑 VIP Pass Perks'],
    };
  }

  if (lower.includes('match') || lower.includes('مباراة') || lower.includes('المباريات') || lower.includes('public')) {
    return {
      text: isArabic
        ? '🏆 **المباريات العامة (Public Matches):**\nيمكنك الانضمام لمباريات خماسي عامة، اختيار مركزك (حارس، مدافع، وسط، مهاجم)، وتقسيم تكلفة الملعب بالتساوي مع باقي الفريق!'
        : '🏆 **Public Matches:**\nJoin open 5v5 lobbies, select your position (GK, DEF, MID, STR), and split turf costs evenly with your squad!',
      chips: isArabic
        ? ['⚽ كيف أحجز ملعباً؟', '📍 أماكن الملاعب', '🏅 صدارة اللاعبين']
        : ['⚽ How to book a pitch?', '📍 Pitch locations', '🏅 Leaderboard & Stats'],
    };
  }

  if (lower.includes('location') || lower.includes('موقع') || lower.includes('عبور') || lower.includes('مكان') || lower.includes('cairo')) {
    return {
      text: isArabic
        ? '📍 **مواقع ملاعب EGFootball5:**\n- **مدينة العبور:** الحي التاسع، حي الشباب، والمنطقة المركزية.\n- **القاهرة الجديدة:** التجمع الخامس والرحاب.\nجميع الملاعب مجهزة بنجيلة صناعية وإضاءة ليلية.'
        : '📍 **EGFootball5 Pitch Locations:**\n- **Obour City:** 9th District, Youth Hub, Central District.\n- **New Cairo:** 5th Settlement & Rehab.\nAll pitches feature top synthetic turf and floodlights.',
      chips: isArabic
        ? ['⚽ احجز ملعباً الآن', '🏆 المباريات المتاحة', '💰 أسعار الحجز']
        : ['⚽ Book a pitch now', '🏆 Open matches', '💰 Booking rates'],
    };
  }

  if (lower.includes('price') || lower.includes('سعر') || lower.includes('عربون') || lower.includes('vip') || lower.includes('خصم')) {
    return {
      text: isArabic
        ? '💎 **الأسعار والخصومات:**\n- أسعار الملاعب بين 250 و 450 ج.م / ساعة.\n- **عضوية Pitch Pass VIP** تمنحك خصماً تلقائياً 10% على جميع الحجوزات وتاج ذهبي!'
        : '💎 **Pricing & Discounts:**\n- Pitch rates start from 250 to 450 EGP / hour.\n- **Pitch Pass VIP** gives you automatic 10% off all bookings & golden crown badge!',
      chips: isArabic
        ? ['👑 اشترك في VIP Pass', '⚽ احجز ملعباً', '📍 أماكن الملاعب']
        : ['👑 Join VIP Pass', '⚽ Book a pitch', '📍 Pitch locations'],
    };
  }

  return {
    text: isArabic
      ? `أهلاً بك! كيف يمكنني مساعدتك في استفسارك حول **"${prompt}"** أو حجز ملاعب الخماسي بالعبور والقاهرة؟`
      : `Hello! How can I help you regarding **"${prompt}"** or booking 5-a-side turfs in Obour & Cairo?`,
    chips: isArabic
      ? ['⚽ كيف أحجز ملعباً بالعبور؟', '🏆 المباريات العامة المتاحة', '📍 أماكن الملاعب']
      : ['⚽ How to book a pitch?', '🏆 Available public matches', '📍 Pitch locations'],
  };
}

export async function generateAIResponse(
  prompt: string,
  options?: {
    imageBase64?: string;
    mimeType?: string;
    systemContext?: string;
    locale?: string;
  }
): Promise<AIResponseResult> {
  cleanExpiredCache();

  const isArabic = detectIsArabic(prompt, options?.locale);
  const cacheKey = getCacheKey(prompt, options?.imageBase64, options?.systemContext);
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const auth = getAuth();
    let token: string | undefined = undefined;
    try {
      token = await auth.currentUser?.getIdToken();
    } catch {
      // Guest or unauthenticated user
    }

    // Call server API route `/api/ai/chat`
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        prompt,
        imageBase64: options?.imageBase64,
        mimeType: options?.mimeType,
        systemContext: options?.systemContext,
        locale: options?.locale,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.text) {
        const result: AIResponseResult = {
          text: json.text,
          chips: json.chips || [],
          modelUsed: json.modelUsed || 'gemini-ai',
        };
        memoryCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
      }
    }
  } catch (err) {
    console.warn('Error fetching AI response from server endpoint:', err);
  }

  // Smart contextual client fallback matching exact prompt
  const fallback = generateClientFallback(prompt, isArabic);
  const fallbackResult: AIResponseResult = {
    text: fallback.text,
    chips: fallback.chips,
    modelUsed: 'smart-client-engine',
  };

  return fallbackResult;
}
