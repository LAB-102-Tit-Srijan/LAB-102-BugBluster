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
import { auth, db, firebaseSetupMessage, isFirebaseConfigured } from "../firebase/config";

// Firestore collections schema:
// users: { id, name, email, gender, role, college, company, budget, area }
// properties: { title, location, rent, amenities[], images[], ownerName, occupancy, gender, rating }
// roommate_preferences: { userId, sleepSchedule, cleanliness, budget, smokingDrinking, foodPreference, socialHabits }
// expenses: { amount, type, paidBy, splitMembers[], date, settled }
// complaints: { userId, issueType, description, priority, status, createdAt }

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const DEMO_USER_KEY = "habiwise_demo_user";
const DEMO_USERS_KEY = "habiwise_demo_users";

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
    if (!isFirebaseConfigured) {
      const savedUser = localStorage.getItem(DEMO_USER_KEY);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    if (!isFirebaseConfigured) {
      const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]");
      const existingUser = users.find((user) => user.email === email && user.password === password);

      if (!existingUser) {
        throw new Error("Invalid email or password");
      }

      const sessionUser = {
        uid: existingUser.id,
        email: existingUser.email,
        displayName: existingUser.name,
      };

      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      return Promise.resolve({ user: sessionUser });
    }

    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, profileData = {}) => {
    if (!isFirebaseConfigured) {
      const normalizedProfile = typeof profileData === "string" ? { name: profileData } : profileData;
      const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]");
      const alreadyExists = users.some((user) => user.email === email);

      if (alreadyExists) {
        throw new Error("Email already in use");
      }

      const demoUser = {
        id: Date.now().toString(),
        name: normalizedProfile.name || "",
        email,
        password,
        gender: normalizedProfile.gender || "",
        role: normalizedProfile.role || "",
        college: normalizedProfile.college || "",
        company: normalizedProfile.company || "",
        budget: normalizedProfile.budget || "",
        area: normalizedProfile.area || "",
      };

      users.push(demoUser);
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

      const sessionUser = {
        uid: demoUser.id,
        email: demoUser.email,
        displayName: demoUser.name,
      };

      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      return { user: sessionUser };
    }

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

  const logout = () => {
    if (!isFirebaseConfigured) {
      localStorage.removeItem(DEMO_USER_KEY);
      setCurrentUser(null);
      return Promise.resolve();
    }
    return signOut(auth);
  };

  const googleLogin = () => {
    if (!isFirebaseConfigured) {
      throw new Error(
        `${firebaseSetupMessage} Google sign-in requires Firebase project setup.`
      );
    }
    return signInWithPopup(auth, googleProvider);
  };

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
