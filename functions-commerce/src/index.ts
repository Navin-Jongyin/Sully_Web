import { initializeApp } from 'firebase-admin/app';
import {
  FieldValue,
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';
import {
  checkoutEventStatus,
  isConfiguredStripeProduct,
  isConfiguredStripePrice,
  normalizeOrigin,
  paymentIntentId,
  purchaseDocumentId,
} from './payment-utils.js';

initializeApp();

const db = getFirestore();
const stripeKey = defineSecret('STRIPE_RESTRICTED_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');
const appOrigin = defineString('APP_ORIGIN', {
  default: 'http://localhost:5173',
  description: 'Public Sully Academy web origin',
});
const stripeCatalogUrl = defineString('STRIPE_CATALOG_API_URL', {
  default: 'https://stripe-server-3dqx.onrender.com',
  description: 'Server that exposes the Stripe product catalog',
});
const region = 'asia-southeast1';

interface AuthenticatedUser {
  uid: string;
  email: string;
}

interface RequestLike {
  method: string;
  body?: unknown;
  get(name: string): string | undefined;
}

interface ResponseLike {
  set(name: string, value: string): unknown;
  status(code: number): ResponseLike;
  send(body: unknown): unknown;
  json(body: unknown): unknown;
}

function stripeClient(): Stripe {
  return new Stripe(stripeKey.value());
}

interface StripeCatalogProduct {
  productId: string;
  priceId: string;
}

async function getStripeProductById(productId: string): Promise<StripeCatalogProduct | null> {
  const baseUrl = stripeCatalogUrl.value().replace(/\/$/, '');
  const response = await fetch(
    `${baseUrl}/products?productId=${encodeURIComponent(productId)}`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (!response.ok) throw new Error(`Stripe catalog returned ${response.status}.`);
  const payload = await response.json() as { products?: StripeCatalogProduct[] };
  return payload.products?.find((product) => product.productId === productId) ?? null;
}

function setCors(req: RequestLike, res: ResponseLike): boolean {
  const allowedOrigin = normalizeOrigin(appOrigin.value());
  const requestOrigin = req.get('origin');
  if (requestOrigin && requestOrigin !== allowedOrigin) {
    res.status(403).send('Origin not allowed.');
    return true;
  }
  if (requestOrigin === allowedOrigin) {
    res.set('Access-Control-Allow-Origin', allowedOrigin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
}

async function authenticate(req: RequestLike): Promise<AuthenticatedUser> {
  const authorization = req.get('authorization') ?? '';
  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) throw new Error('AUTH_REQUIRED');
  const decoded = await getAuth().verifyIdToken(match[1]);
  return { uid: decoded.uid, email: String(decoded.email ?? '') };
}

function sendError(
  res: ResponseLike,
  status: number,
  code: string,
  message: string,
): void {
  res.status(status).json({ error: { code, message } });
}

export const createCheckoutSession = onRequest(
  {
    region,
    secrets: [stripeKey],
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (setCors(req, res)) return;
    if (req.method !== 'POST') {
      sendError(res, 405, 'method-not-allowed', 'Use POST.');
      return;
    }

    let user: AuthenticatedUser;
    try {
      user = await authenticate(req);
    } catch {
      sendError(res, 401, 'authentication-required', 'Sign in before purchasing a course.');
      return;
    }

    const body = (req.body && typeof req.body === 'object')
      ? req.body as Record<string, unknown>
      : {};
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';
    if (!courseId || courseId.length > 160 || courseId.includes('/')) {
      sendError(res, 400, 'invalid-course', 'A valid courseId is required.');
      return;
    }

    try {
      const courseRef = db.doc(`onlineVideoCourses/${courseId}`);
      const entitlementRef = db.doc(`userEntitlements/${user.uid}/courses/${courseId}`);
      const purchaseId = purchaseDocumentId(user.uid, courseId);
      const purchaseRef = db.doc(`purchases/${purchaseId}`);
      const [courseSnap, entitlementSnap] = await Promise.all([
        courseRef.get(),
        entitlementRef.get(),
      ]);

      if (!courseSnap.exists || courseSnap.get('published') !== true) {
        sendError(res, 404, 'course-not-found', 'This course is not available.');
        return;
      }
      if (entitlementSnap.exists) {
        sendError(res, 409, 'already-purchased', 'You already own this course.');
        return;
      }

      const stripeProductId = courseSnap.get('stripeProductId');
      if (!isConfiguredStripeProduct(stripeProductId)) {
        sendError(res, 503, 'payment-not-configured', 'Payment is not configured for this course yet.');
        return;
      }
      const stripeProduct = await getStripeProductById(stripeProductId);
      if (!stripeProduct || !isConfiguredStripePrice(stripeProduct.priceId)) {
        sendError(res, 503, 'payment-not-configured', 'The Stripe product or active price was not found.');
        return;
      }
      const stripePriceId = stripeProduct.priceId;

      const now = Date.now();
      const nonce = crypto.randomUUID();
      const reservation = await db.runTransaction(async (transaction) => {
        const [purchaseSnap, latestEntitlement] = await Promise.all([
          transaction.get(purchaseRef),
          transaction.get(entitlementRef),
        ]);
        if (latestEntitlement.exists || purchaseSnap.get('status') === 'paid') {
          return { kind: 'owned' as const };
        }
        const existingStartedAt = Number(purchaseSnap.get('checkoutStartedAtMillis') ?? 0);
        const existingUrl = purchaseSnap.get('checkoutUrl');
        if (
          purchaseSnap.get('status') === 'pending'
          && now - existingStartedAt < 15 * 60 * 1000
        ) {
          return typeof existingUrl === 'string'
            ? { kind: 'existing' as const, url: existingUrl, sessionId: String(purchaseSnap.get('stripeSessionId') ?? '') }
            : { kind: 'busy' as const };
        }
        transaction.set(purchaseRef, {
          uid: user.uid,
          email: user.email,
          courseId,
          productId: courseId,
          productType: 'course',
          productTitle: String(courseSnap.get('title') ?? ''),
          status: 'pending',
          stripeProductId,
          stripePriceId,
          checkoutNonce: nonce,
          checkoutStartedAtMillis: now,
          createdAt: purchaseSnap.exists
            ? purchaseSnap.get('createdAt') ?? FieldValue.serverTimestamp()
            : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        return { kind: 'create' as const };
      });

      if (reservation.kind === 'owned') {
        sendError(res, 409, 'already-purchased', 'You already own this course.');
        return;
      }
      if (reservation.kind === 'existing') {
        res.json({ url: reservation.url, sessionId: reservation.sessionId });
        return;
      }
      if (reservation.kind === 'busy') {
        sendError(res, 409, 'checkout-in-progress', 'Checkout is already being prepared. Please try again shortly.');
        return;
      }

      const origin = normalizeOrigin(appOrigin.value());
      const session = await stripeClient().checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: stripePriceId, quantity: 1 }],
        success_url: `${origin}/dashboard?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/online-courses?purchase=cancelled`,
        client_reference_id: purchaseId,
        customer_email: user.email || undefined,
        metadata: {
          uid: user.uid,
          courseId,
          purchaseId,
        },
      }, {
        idempotencyKey: `${purchaseId}:${nonce}`,
      });

      if (!session.url) throw new Error('Stripe did not return a Checkout URL.');

      await db.runTransaction(async (transaction) => {
        const current = await transaction.get(purchaseRef);
        if (current.get('checkoutNonce') !== nonce) return;
        transaction.update(purchaseRef, {
          stripeSessionId: session.id,
          checkoutUrl: session.url,
          expiresAt: Timestamp.fromMillis(session.expires_at * 1000),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      logger.error('Checkout session creation failed', {
        uid: user.uid,
        error: error instanceof Error ? error.message : String(error),
      });
      sendError(res, 500, 'checkout-failed', 'Unable to start checkout. Please try again.');
    }
  },
);

export const stripeWebhook = onRequest(
  {
    region,
    secrets: [stripeKey, stripeWebhookSecret],
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Use POST.');
      return;
    }

    const signature = req.get('stripe-signature');
    if (!signature) {
      res.status(400).send('Missing Stripe signature.');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripeClient().webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeWebhookSecret.value(),
      );
    } catch (error) {
      logger.warn('Rejected Stripe webhook signature', {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(400).send('Invalid Stripe signature.');
      return;
    }

    const supported = new Set([
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
      'checkout.session.expired',
    ]);
    if (!supported.has(event.type)) {
      res.status(200).json({ received: true });
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid ?? '';
    const courseId = session.metadata?.courseId ?? '';
    const purchaseId = session.metadata?.purchaseId ?? '';
    const status = checkoutEventStatus(event.type, session.payment_status);

    try {
      if (!uid || !courseId || purchaseId !== purchaseDocumentId(uid, courseId)) {
        throw new Error('Webhook metadata does not identify a valid purchase.');
      }

      const eventRef = db.doc(`stripeWebhookEvents/${event.id}`);
      const purchaseRef = db.doc(`purchases/${purchaseId}`);
      const entitlementRef = db.doc(`userEntitlements/${uid}/courses/${courseId}`);

      await db.runTransaction(async (transaction) => {
        const [eventSnap, purchaseSnap] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(purchaseRef),
        ]);
        if (eventSnap.exists) return;
        if (!purchaseSnap.exists || purchaseSnap.get('uid') !== uid || purchaseSnap.get('courseId') !== courseId) {
          throw new Error('Purchase reservation not found.');
        }

        transaction.set(eventRef, {
          type: event.type,
          purchaseId,
          processedAt: FieldValue.serverTimestamp(),
        });

        if (!status) return;
        const update: Record<string, unknown> = {
          status,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId(session.payment_intent),
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
          amountPaidMinor: session.amount_total ?? 0,
          amountThb: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? '',
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (status === 'paid') {
          update.paidAt = FieldValue.serverTimestamp();
          update.purchaseDate = FieldValue.serverTimestamp();
        }
        transaction.set(purchaseRef, update, { merge: true });

        if (status === 'paid') {
          transaction.set(entitlementRef, {
            uid,
            courseId,
            purchaseId,
            stripeSessionId: session.id,
            unlockedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      });

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Stripe webhook processing failed', {
        eventId: event.id,
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).send('Webhook processing failed.');
    }
  },
);
