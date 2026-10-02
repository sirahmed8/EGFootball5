import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/serverAuth';
import {
  validateOriginAndCors,
  handleCorsPreflight,
  checkRateLimit,
  getClientIp,
} from '@/lib/security/apiSecurity';
import { sanitizeText } from '@/lib/security/sanitize';
import {
  detectIsArabic,
  extractChips,
  callOpenRouterAI,
  getSmartKnowledgeFallback,
  DIRECT_GEMINI_MODELS,
} from './aiHelpers';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req);
}

// Log real AI usage to Firestore for Owner Analytics
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

export async function POST(req: NextRequest) {
  const { isAllowed, corsHeaders } = validateOriginAndCors(req);
  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden: Origin not allowed' }, { status: 403, headers: corsHeaders });
  }

  const clientIp = getClientIp(req);
  const auth = await verifyAuthToken(req);
  const userId = auth?.uid || 'guest';
  const userEmail = auth?.email || '';
  const isOwner =
    userEmail === 'a7medorabe7@gmail.com' ||
    userEmail === process.env.OWNER_EMAIL ||
    userEmail === process.env.NEXT_PUBLIC_OWNER_EMAIL;

  // Rate Limiting & OP Mode Check
  if (!isOwner) {
    const ipLimit = checkRateLimit(`ai-chat-ip:${clientIp}`, 25, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Daily Quota Guard (10 queries/24 hours for free users & guests)
    const dailyKey = `ai-daily-quota:${userId !== 'guest' ? userId : clientIp}`;
    const dailyQuota = checkRateLimit(dailyKey, 10, 24 * 60 * 60 * 1000);

    if (!dailyQuota.allowed) {
      return NextResponse.json(
        {
          success: false,
          quotaExceeded: true,
          message:
            'لقد وصلت للحد اليومي لرسائل المساعد الذكي المجاني (10 رسائل/يوم). قم بالترقية إلى Pitch Pass Pro للحصول على استشارات تكتيكية ودعم غير محدود!',
          messageEn:
            "You have reached today's free AI support limit (10 messages/24h). Upgrade to Pro Pass for unlimited priority assistance.",
          upgradeCta: '/pricing',
        },
        { status: 200, headers: corsHeaders }
      );
    }
  }

  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    const apiKey = process.env.GEMINI_API_KEY || '';

    const body = await req.json().catch(() => ({}));
    const rawPrompt = body?.prompt;
    const { imageBase64, mimeType, systemContext, locale } = body;

    if (!rawPrompt || typeof rawPrompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt parameter' }, { status: 400, headers: corsHeaders });
    }

    const prompt = sanitizeText(rawPrompt, 1000);
    const isArabic = detectIsArabic(prompt, locale);

    const systemInstruction = `You are EGFootball5 AI Assistant (مساعد EGFootball5 الذكي), an expert 5-a-side football platform assistant powered by Google Gemini AI in Egypt.
Be enthusiastic, accurate, concise, helpful, and natural.

CRITICAL LANGUAGE RULE:
- Detect the language of the user's input text (${isArabic ? 'ARABIC' : 'ENGLISH'}).
- If user input is in ARABIC, reply ONLY in warm, fluent, welcoming Egyptian Arabic.
- If user input is in ENGLISH, reply ONLY in clear, enthusiastic, helpful English.
- Always match the user's language!

Core Platform Knowledge Grounding:
- Platform: EGFootball5: Premier 5-a-side pitch booking & match lobbies.
- Locations: Obour City (9th District, Youth Hub, Central Zone) & New Cairo. Rates: 250 - 450 EGP/hr.
- Membership Passes:
  * Starter (Free / 0 EGP): 15-min lock buffer, 10 AI queries/day.
  * Pro Pass (99 EGP/mo or 990 EGP/yr • 2 Months Free): 5% discount, 20-min buffer, unlimited AI, Pro badge.
  * Pitch Pass VIP (199 EGP/mo or 1,990 EGP/yr • 2 Months Free): 10% discount, 25-min buffer, free tournament voucher, gold crown badge, priority line.
- Payment: Vodafone Cash (01012345678), InstaPay (egfootball5@instapay), Cash at pitch, or Card Priority Access.
- Refund Policy: 100% refund $\ge$ 24h before kickoff; 50% between 12-24h; non-refundable < 12h.
- Legal: Commercial Reg 194820, Tax ID 712-492-301, support@egfootball5.com.

Context:
${systemContext || 'EGFootball5 platform assistant.'}

IMPORTANT: At the end of your response, always output 3 short follow-up prompt chips:
CHIPS: ["Option 1", "Option 2", "Option 3"]`;

    // 1. Direct Google Gemini API
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

      for (const model of DIRECT_GEMINI_MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: systemInstruction }, ...parts] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
              }),
            }
          );

          if (!response.ok) continue;
          const json = await response.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) continue;

          const { cleanText, chips } = extractChips(rawText, isArabic);
          const estTokens = json?.usageMetadata?.totalTokens || Math.max(25, Math.ceil((prompt.length + cleanText.length) / 3.8));
          await logAiUsageToFirestore(userId, prompt, `google-gemini/${model}`, estTokens);

          return NextResponse.json(
            { success: true, text: cleanText, chips, modelUsed: `google-gemini/${model}` },
            { status: 200, headers: corsHeaders }
          );
        } catch {
          // Next model
        }
      }
    }

    // 2. OpenRouter Gemini 2.5 Flash
    if (openRouterApiKey) {
      const openRouterResult = await callOpenRouterAI(openRouterApiKey, prompt, systemInstruction, imageBase64);
      if (openRouterResult) {
        const { cleanText, chips } = extractChips(openRouterResult.text, isArabic);
        const estTokens = Math.max(25, Math.ceil((prompt.length + cleanText.length) / 3.8));
        await logAiUsageToFirestore(userId, prompt, openRouterResult.modelUsed, estTokens);

        return NextResponse.json(
          { success: true, text: cleanText, chips, modelUsed: openRouterResult.modelUsed },
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // 3. Smart Knowledge Fallback (Zero crash fallback)
    const fallback = getSmartKnowledgeFallback(prompt, isArabic);
    return NextResponse.json(
      { success: true, text: fallback.text, chips: fallback.chips, modelUsed: 'knowledge-grounded-fallback' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const isArabic = detectIsArabic(req.url);
    const fallback = getSmartKnowledgeFallback('', isArabic);
    return NextResponse.json(
      { success: true, text: fallback.text, chips: fallback.chips, modelUsed: 'resilient-fallback' },
      { status: 200, headers: corsHeaders }
    );
  }
}
