/**
 * Payment Gateway Detector
 * Checks if production online payment gateways (Stripe, Paymob, Fawry) have live credentials.
 * If credentials are missing, UI provides an elegant "Join Priority Access / قريباً" waitlist.
 */

export interface GatewayStatus {
  hasOnlineCardGateway: boolean;
  activeProvider: 'stripe' | 'paymob' | 'none';
  walletGatewaysAvailable: boolean; // Vodafone Cash & InstaPay always available
}

export function getPaymentGatewayStatus(): GatewayStatus {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const paymobKey = process.env.NEXT_PUBLIC_PAYMOB_API_KEY || '';

  if (stripeKey.startsWith('pk_live_') || stripeKey.startsWith('pk_test_')) {
    return {
      hasOnlineCardGateway: true,
      activeProvider: 'stripe',
      walletGatewaysAvailable: true,
    };
  }

  if (paymobKey && paymobKey.length > 10) {
    return {
      hasOnlineCardGateway: true,
      activeProvider: 'paymob',
      walletGatewaysAvailable: true,
    };
  }

  return {
    hasOnlineCardGateway: false,
    activeProvider: 'none',
    walletGatewaysAvailable: true, // Local Egyptian Wallets (Vodafone Cash & InstaPay) are active!
  };
}
