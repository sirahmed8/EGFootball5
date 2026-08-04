// EGFootball5 AI Engine — Calls Google Gemini 2.5 Flash via OpenRouter directly from client
import { getAuth } from 'firebase/auth';

export interface AIResponseResult {
  text: string;
  chips: string[];
  modelUsed: string;
}

interface CacheEntry {
  timestamp: number;
  data: AIResponseResult;
}

// 10-minute in-memory cache (avoids duplicate calls for same prompt)
const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCacheKey(prompt: string, imageBase64?: string): string {
  return `${prompt.trim()}_${imageBase64 ? imageBase64.substring(0, 40) : ''}`;
}

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) memoryCache.delete(key);
  }
}

function detectIsArabic(prompt: string, locale?: string): boolean {
  if (/[\u0600-\u06FF]/.test(prompt)) return true;
  if (/[a-zA-Z]/.test(prompt)) return false;
  return locale === 'ar';
}

function extractChips(text: string, isArabic: boolean): { cleanText: string; chips: string[] } {
  const chips: string[] = [];
  let cleanText = text;

  const chipsMatch = text.match(/CHIPS:\s*\[([\s\S]*?)\]/) || text.match(/CHIPS:\s*(.*)$/m);
  if (chipsMatch) {
    const rawChips = chipsMatch[1].split(/,|\n/);
    for (const c of rawChips) {
      const trimmed = c.trim().replace(/^["'\-\d\.]+\s*/, '').replace(/["']/g, '');
      if (trimmed && trimmed.length < 60 && chips.length < 3) chips.push(trimmed);
    }
    cleanText = text.replace(/CHIPS:[\s\S]*$/, '').trim();
  }

  if (chips.length < 3) {
    const defaults = isArabic
      ? ['⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة', '💰 طرق الدفع']
      : ['⚽ How to book a pitch?', '🏆 Available matches', '💰 Payment methods'];
    for (const d of defaults) {
      if (chips.length >= 3) break;
      if (!chips.includes(d)) chips.push(d);
    }
  }

  return { cleanText, chips: chips.slice(0, 3) };
}

// Log usage to Firestore via direct REST API (no server needed)
async function logAiUsage(uid: string, prompt: string, modelUsed: string, tokens: number) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'football1fc1';
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/aiLogs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: uid },
            prompt: { stringValue: prompt.substring(0, 200) },
            modelUsed: { stringValue: modelUsed },
            tokens: { integerValue: String(tokens) },
            createdAt: { integerValue: String(Date.now()) },
          },
        }),
      }
    );
  } catch {
    // Non-critical — silently ignore
  }
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
  const cacheKey = getCacheKey(prompt, options?.imageBase64);
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.data;

  // Get current user uid for logging
  let uid = 'guest';
  try {
    uid = getAuth().currentUser?.uid || 'guest';
  } catch { /* ignore */ }

  const systemInstruction = `You are EGFootball5 AI Assistant, an expert 5-a-side football platform assistant in Egypt.
Be enthusiastic, accurate, concise, and natural.

CRITICAL LANGUAGE RULE:
- If the user writes in ARABIC → reply ONLY in warm, fluent Egyptian Arabic.
- If the user writes in ENGLISH → reply ONLY in clear, enthusiastic English.
- Never mix languages. Always match the user's language exactly.

Core Platform Info:
- Platform: EGFootball5 — 5-a-side pitch booking & public matches.
- Locations: Obour City (9th District, Youth Hub) & New Cairo (5th Settlement, Rehab).
- Booking: Pick pitch → Select date & time → 15-min slot lock (20 min for VIP) → Pay deposit via Vodafone Cash (01012345678) or InstaPay (egfootball5@instapay) → Instant QR pass.
- Public Matches: Join open 5v5 lobbies, choose position (GK, DEF, MID, STR), split turf cost.
- VIP Pass: 10% automatic discount on all bookings + gold crown badge.
- Pricing: Pitches 250–450 EGP/hr.

${options?.systemContext ? `User Info: ${options.systemContext}` : ''}

After your response, always output exactly 3 short follow-up prompt chips:
CHIPS: ["Chip 1", "Chip 2", "Chip 3"]`;

  // === PRIMARY: OpenRouter → Google Gemini 2.5 Flash ===
  const openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

  if (openRouterKey) {
    const models = [
      'google/gemini-2.5-flash',
      'meta-llama/llama-3.3-70b-instruct',
    ];

    for (const model of models) {
      try {
        const content = options?.imageBase64
          ? [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: options.imageBase64.startsWith('data:')
                    ? options.imageBase64
                    : `data:image/jpeg;base64,${options.imageBase64}`,
                },
              },
            ]
          : prompt;

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://egfootball5.web.app',
            'X-Title': 'EGFootball5',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content },
            ],
            temperature: 0.4,
            max_tokens: 512,
          }),
        });

        if (!res.ok) continue;

        const json = await res.json();
        const rawText = json?.choices?.[0]?.message?.content;
        if (!rawText || typeof rawText !== 'string') continue;

        const { cleanText, chips } = extractChips(rawText, isArabic);
        const tokens = json?.usage?.total_tokens || Math.ceil((prompt.length + cleanText.length) / 4);

        await logAiUsage(uid, prompt, `openrouter/${model}`, tokens);

        const result: AIResponseResult = { text: cleanText, chips, modelUsed: `google-gemini/${model}` };
        memoryCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
      } catch (err) {
        console.warn(`OpenRouter model ${model} failed:`, err);
      }
    }
  }

  // === FALLBACK: Server API Route (works on Vercel with server functions) ===
  try {
    let token: string | undefined;
    try { token = await getAuth().currentUser?.getIdToken(); } catch { /* guest */ }

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
          modelUsed: json.modelUsed || 'gemini-server',
        };
        memoryCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
      }
    }
  } catch (err) {
    console.warn('Server AI route failed:', err);
  }

  // === LAST RESORT FALLBACK: Honest message instead of fake template ===
  return {
    text: isArabic
      ? 'عذراً، يبدو أن خدمة الذكاء الاصطناعي غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى بعد قليل!'
      : 'Sorry, the AI assistant is temporarily unavailable. Please try again in a moment!',
    chips: isArabic
      ? ['⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة', '💰 طرق الدفع']
      : ['⚽ How to book a pitch?', '🏆 Available matches', '💰 Payment methods'],
    modelUsed: 'offline-fallback',
  };
}
