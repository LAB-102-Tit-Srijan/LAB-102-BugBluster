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
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, firebaseSetupMessage, isFirebaseConfigured } from "../firebase/config";
import { calculateTrustScore } from "../utils/trustScore";

// Firestore collections schema:
// users: { id, name, email, gender, role, college, company, budget, area, city }
// properties: { title, location, rent, amenities[], images[], ownerName, occupancy, gender, rating }
// roommate_preferences: { userId, sleepSchedule, cleanliness, budget, smokingDrinking, foodPreference, socialHabits }
// expenses: { amount, type, paidBy, splitMembers[], date, settled }
// complaints: { userId, issueType, description, priority, status, createdAt }

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const DEMO_USER_KEY = "habiwise_demo_user";
const DEMO_USERS_KEY = "habiwise_demo_users";

const normalizeRole = (role) => {
  const value = String(role || "Student").trim().toLowerCase();

  if (value.includes("professional")) {
    return "Professional Worker";
  }

  return "Student";
};

const buildUserProfile = (user, profileData = {}) => {
  const normalizedProfile = typeof profileData === "string" ? { name: profileData } : profileData;
  const role = normalizeRole(normalizedProfile.role);

  return {
    id: user.uid,
    name: normalizedProfile.name || user.displayName || "",
    email: user.email || normalizedProfile.email || "",
    gender: normalizedProfile.gender || "",
    role,
    college: normalizedProfile.college || "",
    company: normalizedProfile.company || "",
    budget: normalizedProfile.budget || "",
    area: normalizedProfile.area || "",
    city: normalizedProfile.city || "",
    profileComplete:
      normalizedProfile.profileComplete ??
      Boolean(normalizedProfile.name && (normalizedProfile.college || normalizedProfile.company || role)),
    emailVerified: normalizedProfile.emailVerified ?? user.emailVerified ?? false,
    aadhaarUploaded: normalizedProfile.aadhaarUploaded ?? false,
    idUploaded: normalizedProfile.idUploaded ?? false,
    roommateReviews: normalizedProfile.roommateReviews ?? 0,
    rentPaidOnTime: normalizedProfile.rentPaidOnTime ?? false,
    trustScore: calculateTrustScore({
      profileComplete: normalizedProfile.profileComplete ?? Boolean(normalizedProfile.name && (normalizedProfile.college || normalizedProfile.company)),
      emailVerified: normalizedProfile.emailVerified ?? user.emailVerified ?? false,
      aadhaarUploaded: normalizedProfile.aadhaarUploaded ?? false,
      idUploaded: normalizedProfile.idUploaded ?? false,
      roommateReviews: normalizedProfile.roommateReviews ?? 0,
      rentPaidOnTime: normalizedProfile.rentPaidOnTime ?? false,
    }),
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
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser({
          ...parsedUser,
          profileComplete: parsedUser.profileComplete ?? false,
          emailVerified: parsedUser.emailVerified ?? false,
          aadhaarUploaded: parsedUser.aadhaarUploaded ?? false,
          idUploaded: parsedUser.idUploaded ?? false,
          roommateReviews: parsedUser.roommateReviews ?? 0,
          rentPaidOnTime: parsedUser.rentPaidOnTime ?? false,
          trustScore: calculateTrustScore(parsedUser),
        });
      }
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const mergedUser = {
          ...user,
          ...userData,
          emailVerified: user.emailVerified,
        };

        mergedUser.trustScore = calculateTrustScore(mergedUser);
        if (!userDoc.exists() || userDoc.data()?.trustScore !== mergedUser.trustScore) {
          await setDoc(userRef, { ...userData, trustScore: mergedUser.trustScore, updatedAt: serverTimestamp() }, { merge: true });
        }
        setCurrentUser(mergedUser);
      } catch {
        const fallbackUser = { ...user, emailVerified: user.emailVerified };
        fallbackUser.trustScore = calculateTrustScore(fallbackUser);
        setCurrentUser(fallbackUser);
      } finally {
        setLoading(false);
      }
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
        role: normalizeRole(existingUser.role),
        college: existingUser.college || "",
        company: existingUser.company || "",
        budget: existingUser.budget || "",
        area: existingUser.area || "",
        city: existingUser.city || "",
        profileComplete: existingUser.profileComplete ?? false,
        emailVerified: existingUser.emailVerified ?? false,
        aadhaarUploaded: existingUser.aadhaarUploaded ?? false,
        idUploaded: existingUser.idUploaded ?? false,
        roommateReviews: existingUser.roommateReviews ?? 0,
        rentPaidOnTime: existingUser.rentPaidOnTime ?? false,
      };

      sessionUser.trustScore = calculateTrustScore(sessionUser);

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
        role: normalizeRole(normalizedProfile.role),
        college: normalizedProfile.college || "",
        company: normalizedProfile.company || "",
        budget: normalizedProfile.budget || "",
        area: normalizedProfile.area || "",
        city: normalizedProfile.city || "",
        profileComplete: normalizedProfile.profileComplete ?? false,
        emailVerified: normalizedProfile.emailVerified ?? false,
        aadhaarUploaded: normalizedProfile.aadhaarUploaded ?? false,
        idUploaded: normalizedProfile.idUploaded ?? false,
        roommateReviews: normalizedProfile.roommateReviews ?? 0,
        rentPaidOnTime: normalizedProfile.rentPaidOnTime ?? false,
      };

      users.push(demoUser);
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

      const sessionUser = {
        uid: demoUser.id,
        email: demoUser.email,
        displayName: demoUser.name,
        role: normalizeRole(demoUser.role),
        college: demoUser.college,
        company: demoUser.company,
        budget: demoUser.budget,
        area: demoUser.area,
        city: demoUser.city,
        profileComplete: demoUser.profileComplete,
        emailVerified: demoUser.emailVerified,
        aadhaarUploaded: demoUser.aadhaarUploaded,
        idUploaded: demoUser.idUploaded,
        roommateReviews: demoUser.roommateReviews,
        rentPaidOnTime: demoUser.rentPaidOnTime,
      };

      sessionUser.trustScore = calculateTrustScore(sessionUser);

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
