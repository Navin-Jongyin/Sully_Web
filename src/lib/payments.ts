import { auth } from '../firebase';

const paymentBaseUrl = (): string => {
  const raw = import.meta.env.VITE_PAYMENT_API_URL as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sullyweb-5f6cc';
  if (!raw) {
    return `https://asia-southeast1-${projectId}.cloudfunctions.net`;
  }
  if (raw === 'local') return `http://127.0.0.1:5001/${projectId}/asia-southeast1`;
  return raw.replace(/\/$/, '');
};

export interface CheckoutLineItem {
  productType: 'course' | 'merchandise';
  productId: string;
  quantity?: number;
}

export interface CreateCheckoutRequest {
  courseId?: string;
  /** Legacy shop request shape; only course checkout is currently supported. */
  items?: CheckoutLineItem[];
  uid?: string;
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutResponse {
  url: string;
  sessionId: string;
}

/**
 * Creates a server-priced Stripe Checkout Session for one course.
 */
export async function createCheckoutSession(
  request: CreateCheckoutRequest,
): Promise<CreateCheckoutResponse> {
  const endpoint = `${paymentBaseUrl()}/createCheckoutSession`;
  const courseId = request.courseId
    ?? request.items?.find((item) => item.productType === 'course')?.productId;
  if (!courseId) throw new Error('Stripe Checkout is currently available for courses only.');
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in before purchasing a course.');
  const idToken = await user.getIdToken();

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ courseId }),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message || `Checkout failed (${res.status}).`);
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
