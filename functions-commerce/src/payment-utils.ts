export const STRIPE_PRICE_PLACEHOLDER = 'STRIPE_PRICE_ID_PLACEHOLDER';
export const STRIPE_PRODUCT_PLACEHOLDER = 'STRIPE_PRODUCT_ID_PLACEHOLDER';

export function isConfiguredStripePrice(value: unknown): value is string {
  return (
    typeof value === 'string'
    && value.startsWith('price_')
    && value !== STRIPE_PRICE_PLACEHOLDER
  );
}

export function isConfiguredStripeProduct(value: unknown): value is string {
  return (
    typeof value === 'string'
    && value.startsWith('prod_')
    && value !== STRIPE_PRODUCT_PLACEHOLDER
  );
}

export function purchaseDocumentId(uid: string, courseId: string): string {
  if (!uid || !courseId || uid.includes('/') || courseId.includes('/')) {
    throw new Error('Invalid purchase identity');
  }
  return `${uid}_${courseId}`;
}

export function paymentIntentId(
  paymentIntent: string | { id: string } | null,
): string | null {
  if (!paymentIntent) return null;
  return typeof paymentIntent === 'string' ? paymentIntent : paymentIntent.id;
}

export function normalizeOrigin(value: string): string {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('APP_ORIGIN must use HTTP or HTTPS');
  }
  return url.origin;
}

export function checkoutEventStatus(
  eventType: string,
  paymentStatus: string,
): 'paid' | 'failed' | 'cancelled' | null {
  if (
    (eventType === 'checkout.session.completed'
      || eventType === 'checkout.session.async_payment_succeeded')
    && paymentStatus === 'paid'
  ) return 'paid';
  if (eventType === 'checkout.session.async_payment_failed') return 'failed';
  if (eventType === 'checkout.session.expired') return 'cancelled';
  return null;
}
