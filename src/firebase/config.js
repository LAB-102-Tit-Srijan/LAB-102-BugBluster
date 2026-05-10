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

const placeholderValues = new Set([
  "",
  "your_api_key",
  "your_auth_domain",
  "your_project_id",
  "your_storage_bucket",
  "your_messaging_sender_id",
  "your_app_id",
]);

const looksLikeLocalPlaceholder = (val) => {
  if (!val || typeof val !== "string") return true;
  const v = val.toLowerCase();
  return v.startsWith("dev_") || v.includes("dev-project") || v.includes("your_") || v.includes("habiwise-local") || v.includes("dummy");
};

export const isFirebaseConfigured =
  !placeholderValues.has(firebaseConfig.apiKey) &&
  !placeholderValues.has(firebaseConfig.authDomain) &&
  !placeholderValues.has(firebaseConfig.projectId) &&
  !placeholderValues.has(firebaseConfig.storageBucket) &&
  !placeholderValues.has(firebaseConfig.messagingSenderId) &&
  !placeholderValues.has(firebaseConfig.appId) &&
  // additional guard: treat obvious local dev placeholders as not configured
  !looksLikeLocalPlaceholder(firebaseConfig.apiKey) &&
  !looksLikeLocalPlaceholder(firebaseConfig.authDomain) &&
  !looksLikeLocalPlaceholder(firebaseConfig.projectId);

export const firebaseSetupMessage =
  "Firebase is not configured. Add all VITE_FIREBASE_* values in .env, then restart npm run dev.";

export { firebaseConfig };

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };

export default app;
