export const OPENROUTER_MODELS = [
  'google/gemini-2.5-flash',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-r1-distill-llama-70b',
];

export const DIRECT_GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
];

export function detectIsArabic(prompt: string, locale?: string): boolean {
  const arabicRegex = /[\u0600-\u06FF]/;
  const englishRegex = /[a-zA-Z]/;
  if (arabicRegex.test(prompt)) return true;
  if (englishRegex.test(prompt)) return false;
  return locale === 'ar';
}

export function extractChips(text: string, isArabic = false): { cleanText: string; chips: string[] } {
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
          'كيف أحجز ملعباً بالعبور؟',
          'باقات اشتراك Pitch Pass',
          'طرق دفع العربون وإنستاباي',
        ]
      : [
          'How to book a pitch in Obour?',
          'Pitch Pass Subscription tiers',
          'Payment and InstaPay deposit info',
        ];
    for (const chip of defaultChipsPool) {
      if (chips.length >= 3) break;
      if (!chips.includes(chip)) chips.push(chip);
    }
  }

  return { cleanText, chips: chips.slice(0, 3) };
}

export async function callOpenRouterAI(
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
          max_tokens: 512,
        }),
      });

      if (!res.ok) continue;

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (text && typeof text === 'string' && text.trim().length > 0) {
        return { text, modelUsed: `google-gemini/${model}` };
      }
    } catch (err) {
      console.warn(`OpenRouter Google Gemini model ${model} failed:`, err);
    }
  }
  return null;
}

export function getSmartKnowledgeFallback(prompt: string, isArabic: boolean): { text: string; chips: string[] } {
  const p = prompt.toLowerCase();

  if (p.includes('حجز') || p.includes('book') || p.includes('pitch') || p.includes('ملعب')) {
    return {
      text: isArabic
        ? 'لحجز ملعب: توجه إلى صفحة "احجز ملعبك"، اختر اليوم والتوقيت المناسب في ملاعب العبور أو القاهرة، وقم بتأكيد العربون عبر فودافون كاش (01012345678) أو إنستا باي (egfootball5@instapay) خلال مهلة القفل (15 دقيقة، أو 20-25 دقيقة للمشتركين).'
        : 'To book: Go to "Book a Pitch", pick your date & slot in Obour or Cairo, and complete deposit via Vodafone Cash (01012345678) or InstaPay (egfootball5@instapay) within lock window (15 mins, or 20-25 mins for Pro/VIP members).',
      chips: isArabic
        ? ['احجز ملعبك الآن', 'باقات Pitch Pass', 'سياسة الإلغاء والاسترداد']
        : ['Book a pitch now', 'Pitch Pass Tiers', 'Cancellation & Refund policy'],
    };
  }

  if (p.includes('اشتراك') || p.includes('سعر') || p.includes('pro') || p.includes('vip') || p.includes('pricing')) {
    return {
      text: isArabic
        ? 'باقات EGFootball5:\n- **الأساسي (مجاناً)**: حجز الملاعب، 10 رسائل ذكاء اصطناعي يومياً، مهلة 15 دقيقة.\n- **Pro Pass (99 ج.م/شهر أو 990 ج.م/سنة - شهرين مجاناً)**: خصم 5%، مهلة 20 دقيقة، استشارات AI غير محدودة، شارة Pro.\n- **Pitch Pass VIP (199 ج.م/شهر أو 1990 ج.م/سنة - شهرين مجاناً)**: خصم 10%، مهلة 25 دقيقة، تذاكر بطولات مجانية، تاج ذهبي، دعم فوري.'
        : 'EGFootball5 Membership Passes:\n- **Starter (Free)**: Pitch bookings, 10 AI queries/day, 15-min lock buffer.\n- **Pro Pass (99 EGP/mo or 990 EGP/yr - 2 Months Free)**: 5% discount, 20-min buffer, unlimited AI, Pro badge.\n- **Pitch Pass VIP (199 EGP/mo or 1,990 EGP/yr - 2 Months Free)**: 10% discount, 25-min buffer, free tournament voucher, gold crown badge, priority VIP line.',
      chips: isArabic
        ? ['تصفح صفحة الأسعار', 'طرق دفع الاشتراك', 'مقارنة المزايا']
        : ['View Pricing page', 'Payment methods', 'Compare features'],
    };
  }

  if (p.includes('استرداد') || p.includes('refund') || p.includes('إلغاء') || p.includes('cancel')) {
    return {
      text: isArabic
        ? 'سياسة الاسترداد: استرداد 100% عند الإلغاء قبل 24 ساعة من موعد المباراة؛ 50% عند الإلغاء بين 12 و24 ساعة؛ ولا يمكن الاسترداد عند الإلغاء قبل أقل من 12 ساعة لضمان حقوق صاحب الملعب.'
        : 'Refund Policy: 100% refund if canceled 24+ hours before kickoff; 50% refund between 12-24 hours; non-refundable within 12 hours to protect pitch reservations.',
      chips: isArabic
        ? ['شروط الحجز', 'تواصل مع الدعم', 'حجز ملعب بديل']
        : ['Booking terms', 'Contact support', 'Book another slot'],
    };
  }

  return {
    text: isArabic
      ? 'أهلاً بك في EGFootball5. منصة حجز ملاعب الخماسي وتنظيم المباريات بالعبور والقاهرة. كيف يمكنني مساعدتك بخصوص الملاعب، المباريات، أو الاشتراكات اليوم؟'
      : 'Welcome to EGFootball5. 5-a-side pitch reservations, match lobbies, and team management across Obour City and Cairo. How can I help you with pitches, matches, or membership passes today?',
    chips: isArabic
      ? ['كيف أحجز ملعباً؟', 'خطط الاشتراكات والأسعار', 'المباريات العامة المتاحة']
      : ['How to book a pitch?', 'Pricing and passes', 'Available public matches'],
  };
}
