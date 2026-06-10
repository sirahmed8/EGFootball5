import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlvtmVyUiVLLaYkeZiCveKvPwmHLKYQ2o",
  authDomain: "football1fc1.firebaseapp.com",
  projectId: "football1fc1",
  storageBucket: "football1fc1.firebasestorage.app",
  messagingSenderId: "389913644938",
  appId: "1:389913644938:web:c5dd35e3d97606b9ce0273",
  measurementId: "G-RCEP5H0L81"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
