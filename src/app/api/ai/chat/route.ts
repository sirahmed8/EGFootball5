import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/serverAuth';

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.0-flash-lite-preview-02-05',
];

function detectIsArabic(prompt: string, locale?: string): boolean {
  const arabicRegex = /[\u0600-\u06FF]/;
  const englishRegex = /[a-zA-Z]/;

  if (arabicRegex.test(prompt)) return true;
  if (englishRegex.test(prompt)) return false;
  return locale === 'ar';
}

function extractChips(text: string, isArabic = false): { cleanText: string; chips: string[] } {
  const chips: string[] = [];
  let cleanText = text;

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

  if (chips.length < 3) {
    const defaultChipsPool = isArabic
      ? [
          '⚽ كيف أحجز ملعباً بالعبور؟',
          '🏆 تصفح المباريات العامة المتاحة',
          '💰 طرق دفع العربون وإنستاباي',
        ]
      : [
          '⚽ How to book a pitch in Obour?',
          '🏆 Show available public matches',
          '💰 Payment & InstaPay deposit info',
        ];
    for (const chip of defaultChipsPool) {
      if (chips.length >= 3) break;
      if (!chips.includes(chip)) chips.push(chip);
    }
  }

  return { cleanText, chips: chips.slice(0, 3) };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Token Verification
    const auth = await verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized: Valid Firebase auth token required' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

    const body = await req.json().catch(() => ({}));
    const { prompt, imageBase64, mimeType, systemContext, locale } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt parameter' }, { status: 400 });
    }

    const isArabic = detectIsArabic(prompt, locale);

    const systemInstruction = `You are EGFootball5 AI Assistant (مساعد EGFootball5 الذكي), an expert 5-a-side football platform assistant in Egypt.
Be enthusiastic, accurate, concise, helpful, and natural.

CRITICAL LANGUAGE RULE:
- Detect the language of the user's input text (${isArabic ? 'ARABIC' : 'ENGLISH'}).
- If user input is in ARABIC, reply ONLY in warm, fluent, welcoming Egyptian Arabic. Output prompt chips in ARABIC.
- If user input is in ENGLISH, reply ONLY in clear, enthusiastic, helpful English. Output prompt chips in ENGLISH.
- Never mix up languages. Always match the user's language!

Core Platform Information:
- Platform Name: EGFootball5 (منصة حجز ملاعب الخماسي والمباريات العامة).
- Main Locations: Obour City (مدينة العبور: الحي التاسع، حي الشباب، المنطقة المركزية) & New Cairo (القاهرة الجديدة).
- Booking Flow: Pick pitch -> Select Date & Time Slot -> 15-minute slot lock -> Pay deposit via Vodafone Cash, InstaPay or Cash at pitch -> Instant QR Pass.
- Public Matches: Players can create or join public matches (المباريات العامة), choose position (GK, DEF, MID, STR), and split turf costs evenly.

Context Information:
${systemContext || 'EGFootball5 enables players to book 5-a-side turfs, discover open public matches, and coordinate game schedules.'}

IMPORTANT: At the end of your response, always output 3 short, relevant follow-up prompt chips for the user in this exact format:
CHIPS: ["Option 1", "Option 2", "Option 3"]`;

    const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Data,
        },
      });
    }
    parts.push({ text: prompt });

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction }, ...parts],
      },
    ];

    if (apiKey) {
      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
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
            continue;
          }

          const json = await response.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) continue;

          const { cleanText, chips } = extractChips(rawText, isArabic);
          return NextResponse.json({
            success: true,
            text: cleanText,
            chips,
            modelUsed: model,
          });
        } catch {
          // Fallthrough seamlessly to next candidate model in fallback chain
        }
      }
    }

    // Fallback response if API key is unconfigured, rate-limited, or all models failed
    const fallbackText = isArabic
      ? 'مرحباً بك! أنا مساعد EGFootball5 الذكي ⚽ كيف يمكنني مساعدتك اليوم في حجز الملاعب بالعبور، استعراض المباريات القادمة، أو دفع العربون؟'
      : "Welcome! I am your EGFootball5 AI Assistant ⚽ How can I help you today with pitches in Obour City, bookings, or joining public matches?";

    return NextResponse.json({
      success: true,
      text: fallbackText,
      chips: isArabic
        ? ['⚽ كيف أحجز ملعباً بالعبور؟', '🏆 المباريات العامة المتاحة', '📍 أماكن الملاعب']
        : ['⚽ How to book a pitch?', '🏆 Available public matches', '📍 Find pitch locations'],
      modelUsed: 'fallback-rules',
    });
  } catch (error: unknown) {
    const isArabicFallback = detectIsArabic(req.headers.get('accept-language') || '', 'ar');
    return NextResponse.json({
      success: true,
      text: isArabicFallback
        ? 'أهلاً بك! أنا هنا لمساعدتك في أي استفسار حول ملاعب EGFootball5 بالعبور والقاهرة الجديدة.'
        : 'Welcome! I am here to help you with pitch bookings and public matches on EGFootball5.',
      chips: isArabicFallback
        ? ['⚽ كيف أحجز ملعباً؟', '🏆 المباريات المتاحة', '📍 أماكن الملاعب']
        : ['⚽ How to book a pitch?', '🏆 Available matches', '📍 Find pitch locations'],
      modelUsed: 'fallback-resilient',
    });
  }
}

