import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/serverAuth';

const OPENROUTER_MODELS = [
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-r1-distill-llama-70b',
  'mistralai/mistral-small-24b-instruct-2501',
];

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
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

// Log real AI usage & tokens to Firestore for Owner Analytics Page
async function logAiUsageToFirestore(uid: string, prompt: string, modelUsed: string, tokens: number) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'football1fc1';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/aiLogs`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          uid: { stringValue: uid || 'guest' },
          prompt: { stringValue: prompt.substring(0, 200) },
          modelUsed: { stringValue: modelUsed },
          tokens: { integerValue: String(tokens) },
          createdAt: { integerValue: String(Date.now()) },
        },
      }),
    });
  } catch (e) {
    console.warn('Failed to log AI usage:', e);
  }
}

async function callOpenRouterAI(
  apiKey: string,
  prompt: string,
  systemInstruction: string,
  imageBase64?: string
): Promise<{ text: string; modelUsed: string } | null> {
  const content = imageBase64
    ? [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } },
      ]
    : prompt;

  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
          max_tokens: 1024,
        }),
      });

      if (!res.ok) continue;

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (text && typeof text === 'string' && text.trim().length > 0) {
        return { text, modelUsed: `openrouter/${model}` };
      }
    } catch (err) {
      console.warn(`OpenRouter model ${model} failed:`, err);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuthToken(req);
    const userId = auth?.uid || 'guest';

    const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
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
- Booking Flow: Pick pitch -> Select Date & Time Slot -> 15-minute slot lock -> Pay deposit via Vodafone Cash (01012345678), InstaPay (egfootball5@instapay) or Cash at pitch -> Instant QR Pass.
- Public Matches: Players can create or join public matches (المباريات العامة), choose position (GK, DEF, MID, STR), and split turf costs evenly.

Context Information:
${systemContext || 'EGFootball5 enables players to book 5-a-side turfs, discover open public matches, and coordinate game schedules.'}

IMPORTANT: At the end of your response, always output 3 short, relevant follow-up prompt chips for the user in this exact format:
CHIPS: ["Option 1", "Option 2", "Option 3"]`;

    // 1. Try OpenRouter AI First (guaranteed working models: meta-llama 70B, deepseek 70B)
    if (openRouterApiKey) {
      const openRouterResult = await callOpenRouterAI(
        openRouterApiKey,
        prompt,
        systemInstruction,
        imageBase64
      );
      if (openRouterResult) {
        const { cleanText, chips } = extractChips(openRouterResult.text, isArabic);
        const estTokens = Math.max(25, Math.ceil((prompt.length + cleanText.length) / 3.8));
        await logAiUsageToFirestore(userId, prompt, openRouterResult.modelUsed, estTokens);

        return NextResponse.json({
          success: true,
          text: cleanText,
          chips,
          modelUsed: openRouterResult.modelUsed,
        });
      }
    }

    // 2. Try Google Gemini API Fallback
    if (apiKey && apiKey.startsWith('AIzaSy')) {
      const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        });
      }
      parts.push({ text: prompt });

      for (const model of GEMINI_MODELS) {
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
                contents: [{ role: 'user', parts: [{ text: systemInstruction }, ...parts] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
              }),
            }
          );

          if (!response.ok) continue;

          const json = await response.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) continue;

          const { cleanText, chips } = extractChips(rawText, isArabic);
          const estTokens = json?.usageMetadata?.totalTokens || Math.max(25, Math.ceil((prompt.length + cleanText.length) / 3.8));
          await logAiUsageToFirestore(userId, prompt, model, estTokens);

          return NextResponse.json({
            success: true,
            text: cleanText,
            chips,
            modelUsed: model,
          });
        } catch {
          // Continue to next Gemini model
        }
      }
    }

    return NextResponse.json({
      error: 'AI Generation Failed',
    }, { status: 500 });
  } catch (error: unknown) {
    return NextResponse.json({
      error: 'Server Error',
    }, { status: 500 });
  }
}
