import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firestore collections schema:
// users: { id, name, email, gender, role, college, company, budget, area }
// properties: { title, location, rent, amenities[], images[], ownerName, occupancy, gender, rating }
// roommate_preferences: { userId, sleepSchedule, cleanliness, budget, smokingDrinking, foodPreference, socialHabits }
// expenses: { amount, type, paidBy, splitMembers[], date, settled }
// complaints: { userId, issueType, description, priority, status, createdAt }

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your_api_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your_auth_domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your_project_id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your_storage_bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your_messaging_sender_id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your_app_id",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
