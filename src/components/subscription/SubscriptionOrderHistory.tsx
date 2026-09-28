'use client';

import * as React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { SubscriptionOrder } from '@/types/subscription';
import { Card } from '@/components/ui/card';

interface SubscriptionOrderHistoryProps {
  orders: SubscriptionOrder[];
  loading: boolean;
  isArabic: boolean;
}

export function SubscriptionOrderHistory({
  orders,
  loading,
  isArabic,
}: SubscriptionOrderHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-36 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-6 border-t border-white/10">
      <h3 className="text-sm font-black text-foreground">
        {isArabic ? 'سجل طلبات الاشتراك السابقة' : 'Subscription Request History'}
      </h3>

      <div className="space-y-3">
        {orders.map((order) => {
          const isPending = order.status === 'pending_review';
          const isActive = order.status === 'active';
          const isRejected = order.status === 'rejected';

          return (
            <Card
              key={order.id}
              className="p-4 rounded-xl bg-card/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-foreground">
                    {order.tier === 'vip' ? 'Pitch Pass VIP' : 'Pro Pass'}
                  </span>
                  <span className="text-muted-foreground">
                    ({order.billingCycle === 'quarterly' ? (isArabic ? '3 أشهر' : '3 Months') : (isArabic ? 'شهري' : 'Monthly')})
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {order.amountEgp} {isArabic ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                  </span>
                  <span>•</span>
                  <span>{order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'InstaPay'}</span>
                  <span>•</span>
                  <span className="font-mono">{order.senderPhoneOrIpa}</span>
                </div>

                {isRejected && order.rejectionReason && (
                  <p className="text-[11px] text-destructive flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{order.rejectionReason}</span>
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    {isArabic ? 'قيد المراجعة' : 'Pending Review'}
                  </span>
                )}
                {isActive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isArabic ? 'مفعل ونشط' : 'Active'}
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-destructive/10 text-destructive border border-destructive/20 text-[11px]">
                    <XCircle className="w-3.5 h-3.5" />
                    {isArabic ? 'مرفوض' : 'Rejected'}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
