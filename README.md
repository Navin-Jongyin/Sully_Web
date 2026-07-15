# Sully Academy

Marketing site + content-management portal for Sully Academy, a ground-school program for student pilots in Thailand. Built with **React 19**, **TypeScript**, **Vite**, **Firebase** (Firestore + Auth + Storage), and **Framer Motion**.

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

### 3. Create an admin user

In the Firebase console: `Authentication → Users → Add user`. Use an email/password you'll log in with at `/auth`.

### 4. Lock down Firestore + Storage rules

The client allows any authenticated user to write to all collections. Make sure your **Firestore Rules** require auth (and ideally a custom admin claim):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
      // Or stricter: allow write: if request.auth.token.admin == true;
    }
  }
}
```

### 5. Run

```bash
npm run dev      # dev server with HMR
npm run lint     # eslint
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
| `/online-courses` | Public (login to buy) | Paid Mux video courses |
| `/online-courses/:id` | Google + entitlement | Video player |
| `/shop` | Public (login to buy) | Merchandise |
| `/account` | Google login | Profile, purchases, owned courses |
| `/online-test` | Public | Google login for aptitude tests |
| `/online-test/session` | Google | Test dashboard / player |
| `/book/*` | Public | Interview booking |
| `/auth` | Public | Admin CMS login |
| `/admin` | Admin session | CMS (includes Online Courses + Merchandise) |
| `*` | Public | 404 |

## Commerce (Merchandise + Online Courses + Mux)

Scaffolding is in place; Stripe and Mux backends are placeholders.

- Overview: [`docs/COMMERCE.md`](docs/COMMERCE.md)
- Payments: [`docs/PAYMENTS.md`](docs/PAYMENTS.md)
- Mux video: [`docs/MUX.md`](docs/MUX.md)

```bash
# optional until services exist
VITE_PAYMENT_API_URL=https://your-stripe-server.onrender.com
VITE_MUX_API_URL=https://your-mux-server.example.com
```

Deploy Firestore rules after pulling commerce collections:

```bash
firebase deploy --only firestore:rules
```


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
- Add tests (Vitest + React Testing Library)
- Add Prettier + a CI workflow
