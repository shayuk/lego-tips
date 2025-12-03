// firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// 📦 קונפיג מהקונסול שלך כולל measurementId
const firebaseConfig = {
  apiKey: "AIzaSyBHOfwLpBKQ-mbkqAtS4LYvX58oPubSp6w",
  authDomain: "lego-tips.firebaseapp.com",
  projectId: "lego-tips",
  storageBucket: "lego-tips.appspot.com",
  messagingSenderId: "309165584208",
  appId: "1:309165584208:web:0324968049a1caf9884655",
  measurementId: "G-V150TVN41E"
};

// 🚀 אתחול אפליקציה
const app = initializeApp(firebaseConfig);

// ✅ אתחול Firebase Auth
export const auth = getAuth(app);

// 🔥 אתחול Firestore
export const db = getFirestore(app);

// 📊 אתחול Analytics – רק אם אפשר (בסביבת דפדפן)
let analytics: ReturnType<typeof getAnalytics> | null = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("📊 Firebase Analytics is enabled");
    } else {
      console.warn("⚠️ Firebase Analytics is not supported in this environment");
    }
  })
  .catch((err) => console.error("❌ Error checking analytics support:", err));

export { analytics };
