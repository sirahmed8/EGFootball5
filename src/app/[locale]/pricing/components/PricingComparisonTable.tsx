'use client';

import * as React from 'react';
import { Check, Minus } from 'lucide-react';

interface PricingComparisonTableProps {
  isArabic: boolean;
}

export function PricingComparisonTable({ isArabic }: PricingComparisonTableProps) {
  const rows = [
    {
      feature: isArabic ? 'حجز ملاعب الخماسي بالعبور والقاهرة' : '5-a-side pitch bookings in Obour & Cairo',
      free: isArabic ? 'متاح بالكامل' : 'Full access',
      pro: isArabic ? 'متاح بالكامل' : 'Full access',
      vip: isArabic ? 'متاح بالكامل' : 'Full access',
    },
    {
      feature: isArabic ? 'مهلة حجز وتأكيد العربون' : 'Deposit lock reservation window',
      free: isArabic ? '15 دقيقة' : '15 Minutes',
      pro: isArabic ? '20 دقيقة' : '20 Minutes',
      vip: isArabic ? '25 دقيقة' : '25 Minutes',
    },
    {
      feature: isArabic ? 'خصم فوري مسترد مع كل حجز' : 'Instant cashback discount per booking',
      free: isArabic ? '0%' : '0%',
      pro: isArabic ? '5% خصم' : '5% Off',
      vip: isArabic ? '10% خصم' : '10% Off',
    },
    {
      feature: isArabic ? 'استشارات المساعد والمدرب الذكي AI' : 'AI Assistant & Tactical Coach Queries',
      free: isArabic ? '10 رسائل/يوم' : '10 queries/day',
      pro: isArabic ? 'غير محدود' : 'Unlimited',
      vip: isArabic ? 'غير محدود + لياقة' : 'Unlimited + Fitness',
    },
    {
      feature: isArabic ? 'إنشاء غرف مباريات خاصة برمز سري' : 'Private passcode-locked match lobbies',
      free: false,
      pro: true,
      vip: true,
    },
    {
      feature: isArabic ? 'تذكرة دخول مجانية لبطولات EGFootball5' : 'Free voucher for EGFootball5 Tournaments',
      free: false,
      pro: false,
      vip: isArabic ? 'تذكرة كل ربع سنة' : '1 Voucher / Quarter',
    },
    {
      feature: isArabic ? 'شارة التميز في البروفايل والصدارة' : 'Profile Badge & Leaderboard Flair',
      free: isArabic ? 'افتراضية' : 'Standard',
      pro: isArabic ? 'شارة Pro زرقاء' : 'Blue Pro Badge',
      vip: isArabic ? 'تاج VIP ذهبي مضيء' : 'Gold VIP Crown',
    },
    {
      feature: isArabic ? 'أولوية خدمة العملاء والدعم الفني' : 'Customer Support Priority',
      free: isArabic ? 'عادي (24 ساعة)' : 'Standard (24h)',
      pro: isArabic ? 'أولوية (< ساعتين)' : 'Priority (< 2h)',
      vip: isArabic ? 'خط ساخن فوري' : 'VIP Immediate Line',
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-black text-foreground">
          {isArabic ? 'مقارنة شاملة بين الباقات' : 'Complete Feature Comparison'}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isArabic
            ? 'اختر الباقة المناسبة لاحتياجاتك الفردية أو احتياجات فريقك'
            : 'Choose the ideal pass tailored to your personal or squad routine'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-start border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-4 text-start font-black text-foreground/80 min-w-48">
                {isArabic ? 'الميزة' : 'Feature'}
              </th>
              <th className="p-4 text-center font-black text-muted-foreground min-w-28">
                {isArabic ? 'الأساسي (مجاني)' : 'Starter (Free)'}
              </th>
              <th className="p-4 text-center font-black text-sky-400 min-w-28 bg-sky-500/[0.03]">
                Pro Pass
              </th>
              <th className="p-4 text-center font-black text-amber-400 min-w-28 bg-amber-500/[0.04]">
                Pitch Pass VIP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.015] transition-colors">
                <td className="p-4 font-semibold text-foreground/90">{row.feature}</td>

                {/* Free */}
                <td className="p-4 text-center text-muted-foreground">
                  {typeof row.free === 'boolean' ? (
                    row.free ? (
                      <Check className="w-4 h-4 mx-auto text-emerald-400" />
                    ) : (
                      <Minus className="w-4 h-4 mx-auto opacity-30" />
                    )
                  ) : (
                    <span>{row.free}</span>
                  )}
                </td>

                {/* Pro */}
                <td className="p-4 text-center font-bold text-foreground bg-sky-500/[0.02]">
                  {typeof row.pro === 'boolean' ? (
                    row.pro ? (
                      <Check className="w-4 h-4 mx-auto text-sky-400" />
                    ) : (
                      <Minus className="w-4 h-4 mx-auto opacity-30" />
                    )
                  ) : (
                    <span>{row.pro}</span>
                  )}
                </td>

                {/* VIP */}
                <td className="p-4 text-center font-black text-amber-300 bg-amber-500/[0.03]">
                  {typeof row.vip === 'boolean' ? (
                    row.vip ? (
                      <Check className="w-4 h-4 mx-auto text-amber-400" />
                    ) : (
                      <Minus className="w-4 h-4 mx-auto opacity-30" />
                    )
                  ) : (
                    <span>{row.vip}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
