import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/serverAuth';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash',
];

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
          '🏆 تصفح المباريات المتاحة',
          '💰 طرق دفع العربون وإنستاباي',
        ]
      : [
          '⚽ How to book a pitch?',
          '🏆 Show upcoming matches',
          '💰 Payment & InstaPay info',
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

    const isArabic = locale === 'ar' || /[\u0600-\u06FF]/.test(prompt);

    const systemInstruction = `You are EGFootball5 AI Assistant (مساعد EGFootball5 الذكي), an expert football platform AI guide in Egypt.
Be enthusiastic, accurate, concise, helpful, and natural.
User Locale: ${locale || 'ar'}. If user speaks Arabic, respond in fluent, welcoming Egyptian Arabic.

Core Platform Information:
- Platform Name: EGFootball5 (منصة حجز الملاعب الخماسية والمباريات).
- Main Locations: Obour City (مدينة العبور: الحي التاسع، حي الشباب، المنطقة المركزية) & New Cairo (القاهرة الجديدة).
- Booking Flow: Pick pitch -> Select Date & Time Slot -> 15-minute slot lock -> Pay deposit via Vodafone Cash or InstaPay or Cash at pitch -> Instant QR Pass.
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
          // Fallthrough to next candidate model
        }
      }
    }

    // Fallback response if API key is unconfigured or rate limited
    const fallbackText = isArabic
      ? 'مرحباً بك! أنا مساعد Kickoff الذكي. يبدو أن هناك ضغطاً مؤقتاً على خوادم الذكاء الاصطناعي، ولكن يمكنني مساعدتك في حجز الملاعب، استعراض المباريات القادمة، أو التواصل مع الدعم الفني.'
      : "Welcome! I'm your Kickoff AI Assistant. The AI servers are experiencing high load right now, but I can still help you book pitches, view upcoming matches, or contact support!";

    return NextResponse.json({
      success: true,
      text: fallbackText,
      chips: isArabic
        ? ['⚽ كيف أحجز ملعباً؟', '🏆 استعراض المباريات', '🛡️ التواصل مع الدعم']
        : ['⚽ How to book a pitch?', '🏆 View matches', '🛡️ Contact support'],
      modelUsed: 'fallback-rules',
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error processing AI prompt';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

