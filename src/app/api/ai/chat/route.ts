import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/serverAuth';

const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-lite-preview-02-05',
];

const OPENROUTER_MODELS = [
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-3.3-70b-instruct',
  'mistralai/mistral-small-24b-instruct-2501',
  'deepseek/deepseek-r1-distill-llama-70b',
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

// Log AI Request & Tokens to Firestore REST API for Owner Analytics Page
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
    console.warn('Failed to log AI usage to Firestore:', e);
  }
}

// Contextual Intelligent Fallback Engine for smooth responses when Gemini API keys are unconfigured
function generateContextualFallback(prompt: string, isArabic: boolean): { text: string; chips: string[] } {
  const lower = prompt.toLowerCase();

  if (lower.includes('book') || lower.includes('حجز') || lower.includes('احجز')) {
    return {
      text: isArabic
        ? '⚽ **خطوات حجز الملعب على EGFootball5:**\n1. اختر الملعب والتاريخ والساعة المناسبة.\n2. يتم قفل الحجز حصرياً لك لمدة 15 دقيقة (أو 20 دقيقة لمشتركي VIP).\n3. ادفع العربون عبر **فودافون كاش** (01012345678) أو **إنستا باي** (egfootball5@instapay).\n4. ارفع إيصال الدفع للحصول على رمز QR الفوري للملعب!'
        : '⚽ **How to book a pitch on EGFootball5:**\n1. Choose your arena, date, and preferred time slot.\n2. Your slot is locked exclusively for 15 mins (20 mins for VIP passholders).\n3. Send deposit via **Vodafone Cash** or **InstaPay**.\n4. Upload receipt for instant QR match pass!',
      chips: isArabic
        ? ['💰 طرق دفع العربون', '🏟️ الملاعب المتاحة بالعبور', '👑 مزايا عضوية VIP']
        : ['💰 Deposit & Payment methods', '🏟️ Available pitches in Obour', '👑 VIP Pass Perks'],
    };
  }

  if (lower.includes('match') || lower.includes('مباراة') || lower.includes('المباريات') || lower.includes('public')) {
    return {
      text: isArabic
        ? '🏆 **المباريات العامة (Public Matches):**\nيمكنك الانضمام لمباريات خماسي عامة قائمة، اختيار مركزك (حارس، مدافع، وسط، مهاجم)، وتقسيم تكلفة الملعب بالتساوي مع باقي اللاعبين! يمكنك أيضاً إنشاء مباراتك الخاصة والدعوة إليها.'
        : '🏆 **Public 5v5 Matches:**\nJoin existing open 5-a-side lobbies, select your position (GK, DEF, MID, STR), and split pitch fees evenly with squad mates! You can also host your own match.',
      chips: isArabic
        ? ['⚽ كيف أحجز ملعباً؟', '📍 مواقع الملاعب بالعبور', '🏅 قائمة صدارة اللاعبين']
        : ['⚽ How to book a pitch?', '📍 Pitch locations in Obour', '🏅 Leaderboard & Stats'],
    };
  }

  if (lower.includes('location') || lower.includes('موقع') || lower.includes('عبور') || lower.includes('مكان') || lower.includes('cairo')) {
    return {
      text: isArabic
        ? '📍 **مواقع ملاعب EGFootball5:**\n- **مدينة العبور:** الحي التاسع، حي الشباب، والمنطقة المركزية.\n- **القاهرة الجديدة:** التجمع الخامس والرحاب.\nجميع الملاعب نجيلة صناعية ممتازة ومجهزة بإضاءة ليلية وغرف تغيير ملابس.'
        : '📍 **EGFootball5 Pitch Locations:**\n- **Obour City:** 9th District, Youth Hub, Central District.\n- **New Cairo:** 5th Settlement & Rehab.\nAll pitches feature premium synthetic turf, night floodlights, and locker rooms.',
      chips: isArabic
        ? ['⚽ احجز ملعباً الآن', '🏆 المباريات المتاحة', '💰 أسعار الحجز والخصومات']
        : ['⚽ Book a pitch now', '🏆 Open matches', '💰 Booking rates & discounts'],
    };
  }

  if (lower.includes('price') || lower.includes('سعر') || lower.includes('عربون') || lower.includes('vip') || lower.includes('خصم')) {
    return {
      text: isArabic
        ? '💎 **الأسعار والخصومات:**\n- تبدأ أسعار الملاعب من 250 إلى 450 ج.م / ساعة.\n- عربون الحجز ثابت لإثبات الجدية.\n- **عضوية Pitch Pass VIP** تمنحك خصماً تلقائياً 10% على جميع الحجوزات، تمديد مهلة القفل لـ 20 دقيقة، وتاج ذهبي!'
        : '💎 **Pricing & Discounts:**\n- Pitch rates start from 250 to 450 EGP / hour.\n- Deposits lock your slot securely.\n- **Pitch Pass VIP** gives you automatic 10% off all bookings, 20-min lock extension, and a golden crown badge!',
      chips: isArabic
        ? ['👑 اشترك في VIP Pass', '⚽ احجز ملعباً', '📍 أماكن الملاعب']
        : ['👑 Join VIP Pass', '⚽ Book a pitch', '📍 Pitch locations'],
    };
  }

  // Default friendly response matching exact language
  return {
    text: isArabic
      ? 'أهلاً بك! أنا مساعد EGFootball5 الذكي ⚽ كيف يمكنني مساعدتك اليوم في حجز ملاعب الخماسي بالعبور والقاهرة، استعراض المباريات القادمة، أو الاستفسار عن الاشتراكات؟'
      : 'Welcome! I am your EGFootball5 AI Assistant ⚽ How can I help you today with pitch bookings, open 5v5 matches, or VIP subscriptions?',
    chips: isArabic
      ? ['⚽ كيف أحجز ملعباً بالعبور؟', '🏆 المباريات العامة المتاحة', '📍 أماكن الملاعب بالعبور']
      : ['⚽ How to book a pitch?', '🏆 Available public matches', '📍 Pitch locations in Obour'],
  };
}

async function callOpenRouterAI(
  apiKey: string,
  prompt: string,
  systemInstruction: string,
  imageBase64?: string
): Promise<{ text: string; modelUsed: string } | null> {
  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: 'text', text: prompt },
  ];

  if (imageBase64) {
    const formattedData = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;
    userContent.push({
      type: 'image_url',
      image_url: { url: formattedData },
    });
  }

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
            { role: 'user', content: userContent },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) continue;

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (text && typeof text === 'string' && text.trim().length > 0) {
        return { text, modelUsed: `openrouter/${model}` };
      }
    } catch {
      // Continue to next OpenRouter candidate model
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Optional auth token verification (guests allowed)
    const auth = await verifyAuthToken(req);
    const userId = auth?.uid || 'guest';

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';

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

    // 1. Try Google Gemini Candidate Models
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

          if (!response.ok) continue;

          const json = await response.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) continue;

          const { cleanText, chips } = extractChips(rawText, isArabic);
          const estTokens = json?.usageMetadata?.totalTokens || Math.max(25, Math.ceil((prompt.length + cleanText.length) / 3.8));

          // Log real usage to Firestore
          await logAiUsageToFirestore(userId, prompt, model, estTokens);

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

    // 2. Try OpenRouter API Fallback Chain if Google Gemini API fails
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

    // 3. Smart Contextual Engine Fallback
    const contextual = generateContextualFallback(prompt, isArabic);
    const fallbackTokens = Math.max(20, Math.ceil((prompt.length + contextual.text.length) / 4));
    await logAiUsageToFirestore(userId, prompt, 'smart-contextual-engine', fallbackTokens);

    return NextResponse.json({
      success: true,
      text: contextual.text,
      chips: contextual.chips,
      modelUsed: 'smart-contextual-engine',
    });
  } catch (error: unknown) {
    const isArabicFallback = detectIsArabic(req.headers.get('accept-language') || '', 'ar');
    const contextual = generateContextualFallback('general', isArabicFallback);
    await logAiUsageToFirestore('guest', 'general', 'smart-fallback', 30);

    return NextResponse.json({
      success: true,
      text: contextual.text,
      chips: contextual.chips,
      modelUsed: 'smart-fallback',
    });
  }
}
