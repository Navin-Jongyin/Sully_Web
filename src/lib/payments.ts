/**
 * Payment API client — PLACEHOLDER
 *
 * Wire this to your Stripe Checkout server (e.g. Render) when ready.
 * See docs/PAYMENTS.md for the expected contract.
 */

const paymentBaseUrl = (): string => {
  const raw = import.meta.env.VITE_PAYMENT_API_URL as string | undefined;
  if (!raw || raw === 'local') return '/api/payments';
  return raw.replace(/\/$/, '');
};

export interface CheckoutLineItem {
  productType: 'course' | 'merchandise';
  productId: string;
  quantity?: number;
}

export interface CreateCheckoutRequest {
  items: CheckoutLineItem[];
  uid: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResponse {
  url: string;
  sessionId: string;
}

/**
 * Creates a Stripe Checkout Session via the payment backend.
 * Currently throws until VITE_PAYMENT_API_URL points at a live service.
 */
export async function createCheckoutSession(
  request: CreateCheckoutRequest,
): Promise<CreateCheckoutResponse> {
  const endpoint = `${paymentBaseUrl()}/create-checkout-session`;

  // Placeholder: fail clearly until the payment service exists.
  if (!import.meta.env.VITE_PAYMENT_API_URL) {
    throw new Error(
      'Payment service not configured. Set VITE_PAYMENT_API_URL and deploy the Stripe server. See docs/PAYMENTS.md.',
    );
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Checkout failed (${res.status}): ${text || res.statusText}`);
  }

  return res.json() as Promise<CreateCheckoutResponse>;
}

export function formatThb(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}
