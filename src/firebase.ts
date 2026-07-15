import { initializeApp } from "firebase/app";
<<<<<<< HEAD
import { getAuth } from "firebase/auth";
=======
import { getAuth, GoogleAuthProvider } from "firebase/auth";
>>>>>>> 0e853f4 (Next Gen Web)
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const env = (key: keyof ImportMetaEnv): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

// Prefer .env in local dev; fall back to the hosted project config so production
// builds still work when CI does not inject VITE_* variables.
const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY') ?? 'AIzaSyCOTXEtV2tQ_g-DRYNNIZIVKS9KRN7BVpQ',
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN') ?? 'sullyweb-5f6cc.firebaseapp.com',
  projectId: env('VITE_FIREBASE_PROJECT_ID') ?? 'sullyweb-5f6cc',
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET') ?? 'sullyweb-5f6cc.firebasestorage.app',
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID') ?? '962971337275',
  appId: env('VITE_FIREBASE_APP_ID') ?? '1:962971337275:web:1db451f7db54faff89921e',
  measurementId: env('VITE_FIREBASE_MEASUREMENT_ID') ?? 'G-MWJ9HZ8727',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export async function fetchAdminCredentials() {
  const snap = await getDoc(doc(db, 'admin', 'adminAuthen'));
  return snap.exists() ? snap.data() : null;
}

export default app;
