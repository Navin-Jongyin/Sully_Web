import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const APP_NAME = 'aptitude-game';

const env = (key: keyof ImportMetaEnv): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const firebaseConfig = {
  apiKey: env('VITE_APTITUDE_FIREBASE_API_KEY'),
  authDomain: env('VITE_APTITUDE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_APTITUDE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_APTITUDE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_APTITUDE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_APTITUDE_FIREBASE_APP_ID'),
};

export const aptitudeConfigured = Object.values(firebaseConfig).every(Boolean);

export const aptitudeDb = aptitudeConfigured
  ? getFirestore(
      getApps().some((app) => app.name === APP_NAME)
        ? getApp(APP_NAME)
        : initializeApp({
            apiKey: firebaseConfig.apiKey!,
            authDomain: firebaseConfig.authDomain!,
            projectId: firebaseConfig.projectId!,
            storageBucket: firebaseConfig.storageBucket!,
            messagingSenderId: firebaseConfig.messagingSenderId!,
            appId: firebaseConfig.appId!,
          }, APP_NAME),
    )
  : null;
