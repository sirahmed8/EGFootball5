'use client';

import * as React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface PricingFaqSectionProps {
  isArabic: boolean;
}

export function PricingFaqSection({ isArabic }: PricingFaqSectionProps) {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const faqs = [
    {
      q: isArabic ? 'كيف يتم تطبيق خصم الحجز (5% أو 10%)؟' : 'How is the booking discount applied?',
      a: isArabic
        ? 'بمجرد تفعيل اشتراك Pro أو VIP في حسابك، يتم خصم النسبة تلقائياً من إجمالي سعر الملعب في صفحة الحجز دون الحاجة لكتابة بروموكود.'
        : 'Once Pro or VIP is active on your profile, the discount is deducted automatically on the booking screen with zero promo codes needed.',
    },
    {
      q: isArabic ? 'ما هي طرق الدفع المتاحة لتفعيل الاشتراك؟' : 'What payment methods can I use?',
      a: isArabic
        ? 'يمكنك التفعيل الفوري بالتحويل عبر فودافون كاش (01012345678) أو إنستا باي (egfootball5@instapay) وإرفاق سكرين شوت التحويل. تفعيل البطاقات البنكية قيد الإطلاق قريباً.'
        : 'You can activate instantly via Vodafone Cash (01012345678) or InstaPay (egfootball5@instapay) with a receipt upload. Direct bank card checkout is coming shortly.',
    },
    {
      q: isArabic ? 'هل يمكنني ترقية باقتي من Pro إلى VIP في أي وقت؟' : 'Can I upgrade from Pro to VIP anytime?',
      a: isArabic
        ? 'نعم بكل سهولة! عند اختيار باقة VIP سيتم احتساب الفرق وتحديث رتبتك لتتمتع بمزايا التاج الذهبي وتذاكر البطولات المجانية فوراً.'
        : 'Yes! When choosing VIP, your profile upgrades immediately with the Gold Crown badge, 10% discount, and tournament passes.',
    },
    {
      q: isArabic ? 'هل توجد سياسة استرداد أموال للاشتراكات؟' : 'Is there a refund policy for subscriptions?',
      a: isArabic
        ? 'نعم، يمكنك طلب استرداد كامل خلال 48 ساعة من الاشتراك في حال عدم استخدام أي خصومات حجز أو مزايا، وفق سياسة الاسترداد الرسمية.'
        : 'Yes, full refunds are available within 48 hours of activation if no booking discounts or perks were redeemed, per our refund policy.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-muted-foreground">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
        </div>
        <h3 className="text-2xl font-black text-foreground">
          {isArabic ? 'كل ما يهمك معرفته عن اشتراكات EGFootball5' : 'Everything You Need to Know'}
        </h3>
      </div>

      <div className="space-y-3 max-w-3xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-start flex items-center justify-between gap-4 font-black text-xs md:text-sm text-foreground cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-foreground' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
