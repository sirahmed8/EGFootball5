// Resilient Gemini AI Engine with Multi-Model Fallback & 10-Minute Cache
// Project: projects/389913644938

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
];

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

function extractChips(text: string): { cleanText: string; chips: string[] } {
  const chips: string[] = [];
  let cleanText = text;

  // Look for CHIPS: tag or [CHIP: ...] patterns
  const chipsMatch = text.match(/CHIPS:\s*\[([\s\S]*?)\]/) || text.match(/CHIPS:\s*(.*)$/m);
  if (chipsMatch) {
    const rawChips = chipsMatch[1].split(/,|\n/);
    rawChips.forEach((c) => {
      const trimmed = c.trim().replace(/^["'\-\d\.]+\s*/, '').replace(/["']/g, '');
      if (trimmed && trimmed.length < 50 && chips.length < 3) {
        chips.push(trimmed);
      }
    });
    cleanText = text.replace(/CHIPS:[\s\S]*$/, '').trim();
  }

  // Fallback default chips if none extracted
  if (chips.length < 3) {
    const defaultChipsPool = [
      "⚽ How to book a pitch?",
      "🏆 Show upcoming matches",
      "💰 What are the payment methods?",
      "📍 Find nearest football ground",
      "🛡️ Talk to staff support",
    ];
    for (const chip of defaultChipsPool) {
      if (chips.length >= 3) break;
      if (!chips.includes(chip)) chips.push(chip);
    }
  }

  return { cleanText, chips: chips.slice(0, 3) };
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

  const cacheKey = getCacheKey(prompt, options?.imageBase64, options?.systemContext);
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const systemInstruction = `You are Kickoff AI Assistant, an expert football platform AI agent.
Be friendly, helpful, concise, and sports-passionate.
User Locale: ${options?.locale || 'en'}. Respond in the language preferred by the user (Arabic if prompt is in Arabic or locale is 'ar').
Context Information:
${options?.systemContext || 'Kickoff platform allows players to book football pitches, join public matches, and chat with community members.'}

IMPORTANT: At the end of your response, always output 3 helpful follow-up questions/prompt chips for the user in this exact format:
CHIPS: ["Option 1", "Option 2", "Option 3"]`;

  // Build Gemini API contents payload
  const parts: any[] = [];
  
  if (options?.imageBase64) {
    // Strip data url prefix if present
    const base64Data = options.imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: options.mimeType || "image/jpeg",
        data: base64Data,
      },
    });
  }
  parts.push({ text: prompt });

  const contents = [
    {
      role: "user",
      parts: [
        { text: systemInstruction },
        ...parts,
      ],
    },
  ];

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Model ${model} failed with status ${response.status}: ${errText}`);
        lastError = new Error(`HTTP ${response.status}: ${errText}`);
        continue;
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        console.warn(`Model ${model} returned empty content.`);
        continue;
      }

      const { cleanText, chips } = extractChips(rawText);
      const result: AIResponseResult = {
        text: cleanText,
        chips,
        modelUsed: model,
      };

      // Store in memory cache
      memoryCache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    } catch (err) {
      console.warn(`Error calling model ${model}:`, err);
      lastError = err;
    }
  }

  // Fallback response if all AI models hit rate limit or error
  const isArabic = options?.locale === 'ar';
  const fallbackText = isArabic
    ? "مرحباً بك! أنا مساعد Kickoff الذكي. يبدو أن هناك ضغطاً مؤقتاً على خوادم الذكاء الاصطناعي، ولكن يمكنني مساعدتك في حجز الملاعب، استعراض المباريات القادمة، أو التواصل مع الدعم الفني."
    : "Welcome! I'm your Kickoff AI Assistant. The AI servers are experiencing high load right now, but I can still help you book pitches, view upcoming matches, or contact support!";

  const fallbackResult: AIResponseResult = {
    text: fallbackText,
    chips: isArabic
      ? ["⚽ كيف أحجز ملعباً؟", "🏆 استعراض المباريات", "🛡️ التواصل مع الدعم"]
      : ["⚽ How to book a pitch?", "🏆 View matches", "🛡️ Contact support"],
    modelUsed: "fallback-rules",
  };

  return fallbackResult;
}
