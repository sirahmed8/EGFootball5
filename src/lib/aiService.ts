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
    const token = await auth.currentUser?.getIdToken();

    // Call server API route `/api/ai/chat` to protect GEMINI_API_KEY server-side
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

  // Graceful fallback response matching user language if network offline or server error
  const fallbackText = isArabic
    ? 'مرحباً بك! أنا مساعد EGFootball5 الذكي ⚽ كيف يمكنني مساعدتك اليوم في حجز الملاعب بالعبور، استعراض المباريات، أو دفع العربون؟'
    : 'Welcome! I am your EGFootball5 AI Assistant ⚽ How can I help you today with pitches, bookings, or matches?';

  const fallbackResult: AIResponseResult = {
    text: fallbackText,
    chips: isArabic
      ? ['⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة', '📍 أماكن الملاعب']
      : ['⚽ How to book a pitch?', '🏆 Available matches', '📍 Find pitch locations'],
    modelUsed: 'fallback-resilient',
  };

  return fallbackResult;
}
