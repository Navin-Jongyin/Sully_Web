# Commerce integration (Merchandise + Online Courses)

This site scaffolds **merchandise**, **purchasable online video courses**, and **user account** management. Payments (Stripe) and video (Mux) are **placeholders** until you deploy those services.

## User-facing routes

| Path | Auth | Purpose |
|------|------|---------|
| `/shop` | Optional (required to buy) | Merchandise catalog |
| `/online-courses` | Optional (required to buy) | Paid video course catalog |
| `/online-courses/:courseId` | Google login + entitlement | Mux lesson player (gated) |
| `/account` | Google login | Profile, owned courses, order history |

Marketing ground-school catalog remains at `/courses` (separate from paid Mux courses).

## Firestore collections

| Collection | Purpose |
|------------|---------|
| `merchandise/{id}` | Shop products (CMS) |
| `onlineVideoCourses/{id}` | Courses + `lessons[]` with Mux ID placeholders |
| `purchases/{id}` | Order records (`uid`, `productType`, `status`, Stripe session) |
| `userEntitlements/{uid}/courses/{courseId}` | Unlocks video access after paid purchase |
| `users/{uid}` | Existing Google profile sync |

### Example `onlineVideoCourses` document

```json
{
  "title": "PPL Ground School Online",
  "description": "...",
  "category": "Student Pilot",
  "priceThb": 9900,
  "thumbnailUrl": "https://...",
  "published": true,
  "stripePriceId": "price_xxx",
  "lessons": [
    {
      "id": "lesson-1",
      "title": "Introduction",
      "order": 0,
      "muxPlaybackId": "PLACEHOLDER",
      "muxAssetId": ""
    }
  ]
}
```

## Purchase flow (target architecture)

```
User (logged in with Google)
  → Buy on /shop or /online-courses
  → POST payment API create-checkout-session
  → Stripe Checkout
  → Webhook on your server
  → Write purchases/{id} status=paid
  → If course: write userEntitlements/{uid}/courses/{courseId}
  → User watches lessons on /online-courses/:id (Mux)
```

Until the payment API exists, **Buy now** shows a clear configuration error. See [PAYMENTS.md](./PAYMENTS.md).

Video playback stays a placeholder until Mux is wired. See [MUX.md](./MUX.md).

## CMS (Admin)

Admin → **Online Courses** and **Merchandise** tabs:

- Create/edit products and courses in Firestore
- Optional `stripePriceId` for when Stripe products exist
- Lesson `muxPlaybackId` defaults to `PLACEHOLDER`

## Related docs

- [PAYMENTS.md](./PAYMENTS.md) — Stripe / Render server contract
- [MUX.md](./MUX.md) — Mux upload + playback
- [../firestore.rules](../firestore.rules) — security rules
