# Stripe course payments

Course purchases use Stripe-hosted Checkout and the Firebase Functions in
`functions-commerce`. The browser sends only a Firebase ID token and `courseId`;
identity, price, amount, ownership, and redirect URLs are resolved on the server.
Never place a Stripe restricted/secret key or webhook secret in the Vite app.

## Course configuration

Each `onlineVideoCourses/{courseId}` document has:

```text
stripeProductId: STRIPE_PRODUCT_ID_PLACEHOLDER
stripePriceId: STRIPE_PRICE_ID_PLACEHOLDER
```

Replace the Product ID per course with its `prod_...` ID, then use **Load** in
the admin editor. Product details and the active `price_...` ID are resolved
from `https://stripe-server-3dqx.onrender.com/products`; the server repeats this
lookup during Checkout and never trusts the browser-provided price. Unresolved
placeholders return a safe “payment not configured” response.

Override the catalog server only when needed:

```text
VITE_STRIPE_CATALOG_API_URL=https://stripe-server-3dqx.onrender.com
STRIPE_CATALOG_API_URL=https://stripe-server-3dqx.onrender.com
```

## Secrets and deployment

Use a Stripe restricted key with only the permissions required to create and
read Checkout Sessions. Configure separate test and live projects/keys.

```bash
firebase functions:secrets:set STRIPE_RESTRICTED_KEY --project default
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project default
firebase deploy --only functions:commerce --project default
```

Set the `APP_ORIGIN` function parameter to the exact public web origin when
prompted (for example `https://sullyacademy.example`). The deployed endpoints
are:

```text
POST https://asia-southeast1-PROJECT_ID.cloudfunctions.net/createCheckoutSession
POST https://asia-southeast1-PROJECT_ID.cloudfunctions.net/stripeWebhook
```

Register the second URL in Stripe Workbench for:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

The webhook verifies the Stripe signature and records processed event IDs, so
retries cannot grant duplicate access.

## Local test-mode flow

Install dependencies in both roots, run the Functions emulator, and forward
Stripe test events:

```bash
npm install
npm --prefix functions-commerce install
npm --prefix functions-commerce run serve
stripe listen --forward-to http://127.0.0.1:5001/sullyweb-5f6cc/asia-southeast1/stripeWebhook
```

Copy the signing secret printed by `stripe listen` into the emulator secret
configuration. Set `VITE_PAYMENT_API_URL=local` and run `npm run dev`.

## Data and failure behavior

- `purchases/{uid}_{courseId}` is the duplicate-purchase lock and audit record.
- Only a paid, signed Stripe event writes `status: paid` and grants
  `userEntitlements/{uid}/courses/{courseId}`.
- Failed, expired, and cancelled sessions do not grant access.
- Checkout success query parameters are informational; the dashboard waits for
  the webhook-created entitlement.
- Payment Intent ID, Session ID, customer ID, amount in minor units, THB amount,
  currency, UID, course ID, and server timestamps are retained.

## Rollout and rollback

1. Deploy Firestore/Storage rules and indexes.
2. Use “Migrate lessons” in the online-course admin panel.
3. Deploy `functions:commerce`, configure the webhook, then deploy the frontend.
4. Complete a Stripe test-mode purchase through dashboard playback.

To roll back the UI, deploy the previous frontend. Do not delete purchase,
webhook-event, or entitlement documents. Disable the Stripe webhook endpoint
before deleting payment Functions.

## Known admin-auth exception

The current admin screen still trusts a browser session flag at the owner's
request. Course/lesson CMS writes therefore retain temporary rule exceptions.
Stripe, purchase, entitlement, student lesson reads, and progress authorization
do not trust that flag. Migrating admin access to Firebase custom claims remains
required before calling the CMS authorization production-secure.
