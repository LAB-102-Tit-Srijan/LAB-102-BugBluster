import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Firestore collections schema:
// users: { id, name, email, gender, role, college, company, budget, area }
// properties: { title, location, rent, amenities[], images[], ownerName, occupancy, gender, rating }
// roommate_preferences: { userId, sleepSchedule, cleanliness, budget, smokingDrinking, foodPreference, socialHabits }
// expenses: { amount, type, paidBy, splitMembers[], date, settled }
// complaints: { userId, issueType, description, priority, status, createdAt }

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const buildUserProfile = (user, profileData = {}) => {
  const normalizedProfile = typeof profileData === "string" ? { name: profileData } : profileData;

  return {
    id: user.uid,
    name: normalizedProfile.name || user.displayName || "",
    email: user.email || normalizedProfile.email || "",
    gender: normalizedProfile.gender || "",
    role: normalizedProfile.role || "",
    college: normalizedProfile.college || "",
    company: normalizedProfile.company || "",
    budget: normalizedProfile.budget || "",
    area: normalizedProfile.area || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};

const saveUserProfile = async (user, profileData) => {
  const userProfile = buildUserProfile(user, profileData);
  await setDoc(doc(db, "users", user.uid), userProfile, { merge: true });
  return userProfile;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signup = async (email, password, profileData = {}) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const normalizedProfile = typeof profileData === "string" ? { name: profileData } : profileData;

    if (normalizedProfile.name) {
      await updateProfile(credential.user, { displayName: normalizedProfile.name });
    }

    await saveUserProfile(credential.user, {
      ...normalizedProfile,
      email,
      name: normalizedProfile.name || credential.user.displayName || "",
    });

    return credential;
  };

  const logout = () => signOut(auth);

  const googleLogin = () => signInWithPopup(auth, googleProvider);

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    googleLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
