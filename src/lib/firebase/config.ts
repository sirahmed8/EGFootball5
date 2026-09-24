import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

if (!firebaseConfig.apiKey) {
  console.warn("Firebase API key is missing! Please check your environment variables.");
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(
  app,
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://football1fc1-default-rtdb.europe-west1.firebasedatabase.app"
);

// Initialize Analytics safely on the client side only if user has consented
let analytics: Analytics | null = null;

export async function initAnalyticsIfConsented(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (analytics) return analytics;

  try {
    const rawConsent = localStorage.getItem("egfootball5_cookie_consent");
    if (!rawConsent) return null;
    const parsed = JSON.parse(rawConsent);
    if (parsed?.analytics !== true) return null;

    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
      return analytics;
    }
  } catch (err) {
    console.error("Failed to initialize consented analytics:", err);
  }
  return null;
}

if (typeof window !== "undefined") {
  initAnalyticsIfConsented();
}

export { analytics };

