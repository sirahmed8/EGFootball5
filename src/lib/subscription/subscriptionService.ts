import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  SubscriptionOrder,
  SubscriptionSubmissionInput,
  SUBSCRIPTION_PRICING,
  subscriptionSubmissionSchema,
} from '@/types/subscription';
import { User as AppUser } from '@/types';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const NOTIFICATIONS_COLLECTION = 'notifications';
const USERS_COLLECTION = 'users';

/**
 * Creates a new subscription order pending admin review.
 */
export async function createSubscriptionOrder(
  input: SubscriptionSubmissionInput,
  user: AppUser
): Promise<string> {
  const validated = subscriptionSubmissionSchema.parse(input);
  const pricing = SUBSCRIPTION_PRICING[validated.tier];
  
  const isQuarterly = validated.billingCycle === 'quarterly';
  const amountEgp = isQuarterly ? pricing.quarterlyEgp : pricing.monthlyEgp;
  const durationDays = isQuarterly ? 90 : 30;

  const orderData: Omit<SubscriptionOrder, 'id'> = {
    userId: user.uid,
    userEmail: user.email || '',
    userName: user.name || 'Player',
    userPhone: user.phone || '',
    tier: validated.tier,
    billingCycle: validated.billingCycle,
    amountEgp,
    paymentMethod: validated.paymentMethod,
    senderPhoneOrIpa: validated.senderPhoneOrIpa,
    receiptUrl: validated.receiptUrl || '',
    status: 'pending_review',
    durationDays,
    createdAt: new Date().toISOString(),
    idempotencyKey: validated.idempotencyKey,
  };

  const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), orderData);

  // Send player acknowledgement notification
  try {
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId: user.uid,
      title: validated.tier === 'vip' ? 'طلب اشتراك Pitch Pass VIP' : 'طلب اشتراك Pro Pass',
      message: `تم استلام طلب اشتراكك بمبلغ ${amountEgp} ج.م. سيتم مراجعة التحويل وتفعيل المزايا في أقرب وقت.`,
      type: 'SUBSCRIPTION',
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Non-blocking notification fail
  }

  return docRef.id;
}

/**
 * Fetches all subscription orders submitted by a user.
 */
export async function getUserSubscriptionOrders(userId: string): Promise<SubscriptionOrder[]> {
  try {
    const q = query(
      collection(db, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionOrder));
  } catch (err) {
    // Fallback if index is building
    const qSimple = query(
      collection(db, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      limit(10)
    );
    const snap = await getDocs(qSimple);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionOrder));
  }
}

/**
 * Fetches all pending subscription orders for Admin/Owner review.
 */
export async function getPendingSubscriptionOrders(): Promise<SubscriptionOrder[]> {
  const q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('status', '==', 'pending_review'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionOrder));
}

/**
 * Atomically approves and activates a subscription order.
 */
export async function approveSubscriptionOrder(
  orderId: string,
  reviewerAdmin: AppUser
): Promise<void> {
  const orderRef = doc(db, SUBSCRIPTIONS_COLLECTION, orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    throw new Error('Subscription order not found');
  }

  const order = orderSnap.data() as SubscriptionOrder;
  const now = Date.now();
  const durationMs = order.durationDays * 24 * 60 * 60 * 1000;
  const expiryTimestamp = now + durationMs;
  const expiryIso = new Date(expiryTimestamp).toISOString();
  const activatedIso = new Date(now).toISOString();

  const tierLabel = order.tier === 'vip' ? 'Pitch Pass VIP' : 'Pro Pass';

  const batch = writeBatch(db);

  // 1. Update subscription order status
  batch.update(orderRef, {
    status: 'active',
    activatedAt: activatedIso,
    expiresAt: expiryIso,
    reviewedBy: reviewerAdmin.email || reviewerAdmin.uid,
    reviewedAt: activatedIso,
  });

  // 2. Update player profile with VIP status & tier
  const userRef = doc(db, USERS_COLLECTION, order.userId);
  batch.update(userRef, {
    isVip: true,
    vipTier: tierLabel,
    vipExpiry: expiryTimestamp,
    vipActiveSubscriptionId: orderId,
  });

  // 3. Create celebratory notification
  const notifRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
  batch.set(notifRef, {
    userId: order.userId,
    title: order.tier === 'vip' ? '👑 تهانينا! تم تفعيل Pitch Pass VIP' : '⚡ تم تفعيل Pro Pass بنجاح',
    message: `تم التحقق من تحويلك وتفعيل باقة ${tierLabel} الخاصة بك لمدة ${order.durationDays} يوم. استمتع بالخصومات ومهلة الحجز الموسعة!`,
    type: 'SUBSCRIPTION_ACTIVATED',
    read: false,
    createdAt: activatedIso,
  });

  await batch.commit();
}

/**
 * Rejects a subscription order with an explicit reason.
 */
export async function rejectSubscriptionOrder(
  orderId: string,
  reviewerAdmin: AppUser,
  rejectionReason: string
): Promise<void> {
  const orderRef = doc(db, SUBSCRIPTIONS_COLLECTION, orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) {
    throw new Error('Subscription order not found');
  }

  const order = orderSnap.data() as SubscriptionOrder;
  const reviewedIso = new Date().toISOString();

  const batch = writeBatch(db);

  batch.update(orderRef, {
    status: 'rejected',
    rejectionReason: rejectionReason.trim(),
    reviewedBy: reviewerAdmin.email || reviewerAdmin.uid,
    reviewedAt: reviewedIso,
  });

  const notifRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
  batch.set(notifRef, {
    userId: order.userId,
    title: 'تنبيه بشأن طلب الاشتراك',
    message: `تعذر تفعيل الاشتراك: ${rejectionReason}. يمكنك مراجعة الدعم أو إعادة إرسال إيصال التحويل الصحيح.`,
    type: 'SUBSCRIPTION_REJECTED',
    read: false,
    createdAt: reviewedIso,
  });

  await batch.commit();
}
