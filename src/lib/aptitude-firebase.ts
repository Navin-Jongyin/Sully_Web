import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const APP_NAME = 'aptitude-game';

const env = (key: keyof ImportMetaEnv): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

// Prefer .env in local dev; fall back to the hosted project config so production
// builds still work when the host does not inject VITE_APTITUDE_* variables.
const firebaseConfig = {
  apiKey: env('VITE_APTITUDE_FIREBASE_API_KEY') ?? 'AIzaSyAfwwfAyhkUErLOtKz1k8Dqdy59DfxcT4s',
  authDomain: env('VITE_APTITUDE_FIREBASE_AUTH_DOMAIN') ?? 'apptitude-game.firebaseapp.com',
  projectId: env('VITE_APTITUDE_FIREBASE_PROJECT_ID') ?? 'apptitude-game',
  storageBucket: env('VITE_APTITUDE_FIREBASE_STORAGE_BUCKET') ?? 'apptitude-game.firebasestorage.app',
  messagingSenderId: env('VITE_APTITUDE_FIREBASE_MESSAGING_SENDER_ID') ?? '792927206814',
  appId: env('VITE_APTITUDE_FIREBASE_APP_ID') ?? '1:792927206814:web:795c6cb93099930dc42a8f',
};

const aptitudeApp = getApps().some((app) => app.name === APP_NAME)
  ? getApp(APP_NAME)
  : initializeApp(firebaseConfig, APP_NAME);

export const aptitudeDb = getFirestore(aptitudeApp);
