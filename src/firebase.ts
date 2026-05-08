import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOTXEtV2tQ_g-DRYNNIZIVKS9KRN7BVpQ",
  authDomain: "sullyweb-5f6cc.firebaseapp.com",
  projectId: "sullyweb-5f6cc",
  storageBucket: "sullyweb-5f6cc.firebasestorage.app",
  messagingSenderId: "962971337275",
  appId: "1:962971337275:web:1db451f7db54faff89921e",
  measurementId: "G-MWJ9HZ8727"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
