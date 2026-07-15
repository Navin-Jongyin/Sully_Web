# Payments integration (Stripe) — placeholder

The frontend calls a backend payment API. **No Stripe secret keys belong in the Vite app.**

## Env

```bash
# Production payment server (example Render URL)
VITE_PAYMENT_API_URL=https://your-stripe-server.onrender.com

# Local: set to "local" and add a Vite proxy to localhost:4242 (optional)
# VITE_PAYMENT_API_URL=local
```

Client helper: `src/lib/payments.ts` → `createCheckoutSession()`.

## Expected API contract

### `POST /create-checkout-session`

**Request body**

```json
{
  "items": [
    { "productType": "course", "productId": "ovc-123", "quantity": 1 },
    { "productType": "merchandise", "productId": "merch-456", "quantity": 2 }
  ],
  "uid": "firebase-uid",
  "email": "user@gmail.com",
  "successUrl": "https://yoursite.com/account?purchase=success",
  "cancelUrl": "https://yoursite.com/shop?purchase=cancelled"
}
```

**Response**

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_...",
  "sessionId": "cs_..."
}
```

The browser redirects to `url`.

### Server responsibilities

1. Look up product prices from Firestore (`onlineVideoCourses` / `merchandise`) or Stripe Price IDs.
2. Create a Stripe Checkout Session with `metadata`: `uid`, `productType`, `productId`(s).
3. On `checkout.session.completed` webhook:
   - Create/update `purchases/{id}` with `status: "paid"`.
   - For `productType: "course"`, create  
     `userEntitlements/{uid}/courses/{courseId}` with `unlockedAt`, `purchaseId`.
4. Never trust the client to write entitlements.

## Local development tips

1. Run your Stripe server (e.g. Express on port `4242`).
2. Optional Vite proxy in `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api/payments': {
      target: 'http://localhost:4242',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/payments/, ''),
    },
  },
},
```

3. Set `VITE_PAYMENT_API_URL=local` so the client uses `/api/payments`.

## Checklist before go-live

- [ ] Stripe products/prices created; IDs stored on Firestore docs
- [ ] Webhook endpoint verified (`stripe listen` in dev)
- [ ] Firestore rules: clients cannot create `userEntitlements` (server Admin SDK only)
- [ ] Success/cancel URLs use production domain
- [ ] Test Google-authenticated purchase end-to-end
