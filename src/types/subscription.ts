import { z } from 'zod';

export type SubscriptionTier = 'free' | 'pro' | 'vip';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';
export type SubscriptionStatus = 'pending_review' | 'active' | 'rejected' | 'expired';
export type PaymentMethod = 'vodafone_cash' | 'instapay' | 'card';

export interface PlanPricing {
  tier: SubscriptionTier;
  monthlyEgp: number;
  quarterlyEgp: number;
  annualEgp: number;
  discountPercentQuarterly: number;
  discountPercentAnnual: number;
}

export const SUBSCRIPTION_PRICING: Record<SubscriptionTier, PlanPricing> = {
  free: {
    tier: 'free',
    monthlyEgp: 0,
    quarterlyEgp: 0,
    annualEgp: 0,
    discountPercentQuarterly: 0,
    discountPercentAnnual: 0,
  },
  pro: {
    tier: 'pro',
    monthlyEgp: 99,
    quarterlyEgp: 249, // ~16% discount
    annualEgp: 990,    // 2 months free! (10 x 99 = 990 vs 1188)
    discountPercentQuarterly: 16,
    discountPercentAnnual: 17,
  },
  vip: {
    tier: 'vip',
    monthlyEgp: 199,
    quarterlyEgp: 499, // ~17% discount
    annualEgp: 1990,   // 2 months free! (10 x 199 = 1990 vs 2388)
    discountPercentQuarterly: 17,
    discountPercentAnnual: 17,
  },
};

export interface SubscriptionOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  tier: 'pro' | 'vip';
  billingCycle: BillingCycle;
  amountEgp: number;
  paymentMethod: 'vodafone_cash' | 'instapay';
  senderPhoneOrIpa: string;
  receiptUrl?: string;
  status: SubscriptionStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;       // ISO-8601 UTC
  activatedAt?: string;    // ISO-8601 UTC
  expiresAt?: string;      // ISO-8601 UTC
  durationDays: number;
  idempotencyKey: string;
}

export const subscriptionSubmissionSchema = z.object({
  tier: z.enum(['pro', 'vip']),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']),
  paymentMethod: z.enum(['vodafone_cash', 'instapay']),
  senderPhoneOrIpa: z
    .string()
    .min(3, 'Sender phone or IPA must be at least 3 characters')
    .max(64, 'Sender identifier is too long')
    .regex(/^[a-zA-Z0-9@._+-]+$/, 'Invalid format for sender identifier'),
  receiptUrl: z.string().url('Invalid receipt URL').optional().or(z.literal('')),
  idempotencyKey: z.string().min(8),
});

export type SubscriptionSubmissionInput = z.infer<typeof subscriptionSubmissionSchema>;
