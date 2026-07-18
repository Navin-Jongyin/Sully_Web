# Sully Academy

Marketing site, paid course LMS, and content-management portal for Sully Academy. Built with **React 19**, **TypeScript**, **Vite**, **Firebase** (Firestore + Auth + Storage + Functions), **Stripe Checkout**, and **Framer Motion**.

## Tech stack

| Layer       | Tool                                            |
| ----------- | ----------------------------------------------- |
| UI          | React 19 + TypeScript                           |
| Bundler     | Vite 8                                          |
| Routing     | React Router v7                                 |
| Data / Auth | Firebase (Firestore, Auth, Storage)             |
| Animation   | Framer Motion                                   |
| Icons       | lucide-react                                    |
| Hosting     | Firebase Hosting (`firebase.json`)              |

## Project structure

```
src/
├── App.tsx                  # Routes, layout shell, route guards
├── main.tsx
├── firebase.ts              # Firebase init (reads from .env)
├── components/
│   ├── RequireAuth.tsx      # Route guard for /admin
│   └── courses/
│       ├── CourseCard.tsx
│       └── CategoryTab.tsx  # Single tab component, parameterised by category
├── context/
│   ├── AuthProvider.tsx     # Provider component
│   ├── auth-context.ts      # createContext(...) + types
│   ├── DataContext.tsx      # Firestore live listeners + writes
│   └── data-context.ts      # createContext(...) + types
├── hooks/
│   ├── useAuth.ts
│   └── useData.ts
└── pages/
    ├── Home.tsx
    ├── Courses.tsx
    ├── Auth.tsx             # Firebase email/password login
    └── AdminPanel.tsx       # Lazy-loaded; only ships to authed admins
```

## Getting started

### 1. Install

```bash
npm install
npm --prefix functions install
npm --prefix functions-commerce install
```

### 2. Configure Firebase

Copy `.env.example` to `.env` and fill in the values from your Firebase console
(`Project settings → General → Your apps`):

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...    # optional
```

### 3. Configure course payments

Follow [`docs/PAYMENTS.md`](docs/PAYMENTS.md) to replace per-course Stripe
placeholders, configure Firebase secrets, and register the signed webhook.

### 4. Deploy Firestore + Storage rules

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage --project default
```

Purchase and entitlement writes are backend-only. The legacy admin CMS still
has an explicitly deferred session-only authorization flow; see the warning in
the payment documentation before production rollout.

### 5. Run

```bash
npm run dev      # dev server with HMR
npm run lint     # eslint
npm run test     # unit tests
npm run test:rules # Firestore emulator authorization tests
npm run build    # tsc -b && vite build → dist/
npm run preview  # preview the production build
```

## Deploy (Firebase Hosting)

```bash
npm run build
npx firebase-tools deploy --only hosting
```

`firebase.json` already points hosting at `dist/` and rewrites all routes to `index.html` so client-side routing works on refresh.

## Routes

| Path | Access | Notes |
| ---- | ------ | ----- |
| `/` | Public | Landing page |
| `/courses` | Public | Marketing course catalog |
| `/online-courses` | Public (login to buy) | Stripe-powered video courses |
| `/online-courses/:id` | Firebase user + entitlement | Multi-provider course player |
| `/shop` | Public (login to buy) | Merchandise |
| `/dashboard` | Firebase login | Purchases, owned courses, progress |
| `/online-test` | Public | Google login for aptitude tests |
| `/online-test/session` | Google | Test dashboard / player |
| `/book/*` | Public | Interview booking |
| `/auth` | Public | Admin CMS login |
| `/admin` | Admin session | CMS (includes Online Courses + Merchandise) |
| `*` | Public | 404 |

## Commerce and course LMS

Online courses support Stripe Checkout, webhook-granted entitlements, lesson
progress, resume playback, and YouTube, Vimeo, Bunny, Cloudflare, Mux/HLS,
direct MP4, or generic HTTPS embeds.

- Overview: [`docs/COMMERCE.md`](docs/COMMERCE.md)
- Payments: [`docs/PAYMENTS.md`](docs/PAYMENTS.md)
- Mux video: [`docs/MUX.md`](docs/MUX.md)

The booking and commerce Functions are separate Firebase codebases:
`functions:booking` deploys to the booking project and `functions:commerce`
deploys to the main project.


## Path aliases

The `@/` alias points to `src/`, so you can import:

```ts
import { useData } from '@/hooks/useData';
import CourseCard from '@/components/courses/CourseCard';
```

## Known follow-ups

- Split `AdminPanel.tsx` (~830 lines) into per-section sub-components
- Replace `alert()` / `window.confirm()` with toast + dialog primitives
- Compress images in `public/` (the favicon is currently 1.5 MB)
- Add Prettier + a CI workflow
- Replace the legacy session-only admin login with Firebase custom claims
