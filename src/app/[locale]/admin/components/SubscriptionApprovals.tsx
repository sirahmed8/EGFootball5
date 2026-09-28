'use client';

import * as React from 'react';
import Image from 'next/image';
import { CheckCircle2, XCircle, Clock, Smartphone, Zap, ExternalLink, Loader2, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { SubscriptionOrder } from '@/types/subscription';
import {
  getPendingSubscriptionOrders,
  approveSubscriptionOrder,
  rejectSubscriptionOrder,
} from '@/lib/subscription/subscriptionService';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

interface SubscriptionApprovalsProps {
  setActiveReceiptUrl: (url: string | null) => void;
  isArabic?: boolean;
}

export function SubscriptionApprovals({
  setActiveReceiptUrl,
  isArabic = false,
}: SubscriptionApprovalsProps) {
  const appUser = useAuthStore((s) => s.appUser);
  const [orders, setOrders] = React.useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingSubscriptionOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load pending subscriptions:', err);
      toast.error('Failed to load pending subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleApprove = async (order: SubscriptionOrder) => {
    if (!appUser) return;
    setProcessingId(order.id);
    try {
      await approveSubscriptionOrder(order.id, appUser);
      toast.success(
        isArabic
          ? `تم تفعيل اشتراك ${order.userName} بنجاح!`
          : `Subscription approved and activated for ${order.userName}!`
      );
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to approve subscription');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (order: SubscriptionOrder) => {
    if (!appUser) return;
    const reason = window.prompt(
      isArabic
        ? 'سبب رفض الطلب (سيظهر للاعب):'
        : 'Rejection reason (will be sent to player):',
      isArabic ? 'لم يصل التحويل أو الإيصال غير مطابق' : 'Transfer not received or invalid receipt'
    );
    if (!reason || !reason.trim()) return;

    setProcessingId(order.id);
    try {
      await rejectSubscriptionOrder(order.id, appUser, reason.trim());
      toast.success(isArabic ? 'تم رفض الطلب وإشعار اللاعب.' : 'Subscription rejected.');
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to reject subscription');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">
          {isArabic ? 'جاري تحميل طلبات الاشتراكات المعلقة...' : 'Loading pending subscription requests...'}
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center rounded-2xl bg-card/40 border-white/10 space-y-3">
        <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
        <h3 className="text-base font-black text-foreground">
          {isArabic ? 'لا توجد طلبات اشتراك معلقة' : 'No Pending Subscription Requests'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {isArabic
            ? 'تمت مراجعة جميع تحويلات الاشتراكات السابقة بنجاح. ستظهر الطلبات الجديدة هنا فور إرسالها.'
            : 'All incoming subscriptions have been processed. New transfer submissions will show up here.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground">
            {isArabic ? 'طلبات الاشتراكات المعلقة للمراجعة' : 'Pending Subscription Approvals'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isArabic
              ? `${orders.length} طلب اشتراك بانتظار التأكيد المالي`
              : `${orders.length} orders awaiting payment verification`}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="text-xs rounded-xl border-white/10"
        >
          {isArabic ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order) => {
          const isProcessing = processingId === order.id;

          return (
            <Card
              key={order.id}
              className="p-5 rounded-2xl bg-card/60 border-white/10 flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3">
                {/* Header with Player & Tier */}
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-foreground">{order.userName}</span>
                      <SubscriptionBadge tier={order.tier} size="sm" isArabic={isArabic} />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">{order.userEmail}</p>
                    {order.userPhone && (
                      <p className="text-[11px] text-muted-foreground font-mono">{order.userPhone}</p>
                    )}
                  </div>

                  <div className="text-end">
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {order.amountEgp} {isArabic ? 'ج.م' : 'EGP'}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {order.billingCycle === 'quarterly'
                        ? (isArabic ? '3 أشهر (90 يوم)' : '3 Months (90d)')
                        : (isArabic ? 'شهر (30 يوم)' : '1 Month (30d)')}
                    </span>
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">
                      {isArabic ? 'طريقة الدفع:' : 'Payment Method:'}
                    </span>
                    <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                      {order.paymentMethod === 'vodafone_cash' ? (
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      {order.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' : 'InstaPay'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[10px] block">
                      {isArabic ? 'المحول منه:' : 'Sender Handle/Phone:'}
                    </span>
                    <span className="font-mono font-bold text-foreground select-all mt-0.5 block">
                      {order.senderPhoneOrIpa}
                    </span>
                  </div>
                </div>

                {/* Receipt Image if available */}
                {order.receiptUrl ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground block">
                      {isArabic ? 'إيصال التحويل المرفق:' : 'Attached Receipt:'}
                    </span>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveReceiptUrl(order.receiptUrl || null)}
                      className="relative h-28 w-full rounded-xl overflow-hidden border border-white/10 group cursor-pointer bg-black/50"
                    >
                      <Image
                        src={order.receiptUrl}
                        alt="Transfer Receipt"
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white gap-1.5">
                        <ExternalLink className="w-4 h-4" />
                        <span>{isArabic ? 'تكبير الإيصال' : 'View Full Receipt'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'لم يتم إرفاق صورة إيصال (تحقق برقم المحول)' : 'No receipt image (verify via sender phone)'}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleReject(order)}
                  className="w-1/2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <XCircle className="w-3.5 h-3.5 me-1.5" />
                  {isArabic ? 'رفض' : 'Reject'}
                </Button>

                <Button
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleApprove(order)}
                  className="w-1/2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 me-1.5" />
                      {isArabic ? 'تأكيد وتفعيل' : 'Approve & Activate'}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
