import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../firebase/config";
import {
  calculateCompatibility,
  getConflictRisk,
  getSharedInterests,
  getTopMatches,
} from "../utils/matchingLogic";
import { candidates } from "../data/candidates";

const INTERESTS_OPTIONS = ["Coding", "Gym", "Startup", "Music", "Gaming", "UPSC", "Reading", "Travel"];
const STREAM_OPTIONS = ["CSE", "ECE", "MBA", "Law", "Medical", "Commerce", "Arts", "Other"];
const EXAM_OPTIONS = ["UPSC", "CAT", "GATE", "JEE", "CA", "NEET", "None"];
const CITY_OPTIONS = ["Indore", "Pune", "Bengaluru"];
const DEMO_USER_KEY = "habiwise_demo_user";
const DEMO_USERS_KEY = "habiwise_demo_users";

const LABEL_TO_VALUE = {
  sleepSchedule: {
    "Early Bird": "early_bird",
    "Night Owl": "night_owl",
    Flexible: "flexible",
  },
  cleanliness: {
    "Very Clean": "very_clean",
    Moderate: "moderate",
    Relaxed: "relaxed",
  },
  foodPreference: {
    Veg: "veg",
    "Non-Veg": "non_veg",
    Both: "both",
  },
  socialHabits: {
    Introvert: "introvert",
    Extrovert: "extrovert",
    Mixed: "mixed",
  },
  stayDuration: {
    "Long Term": "long_term",
    "Short Term": "short_term",
    "Very Short": "very_short",
    Flexible: "flexible",
  },
};

const VALUE_TO_LABEL = {
  sleepSchedule: {
    early_bird: "Early Bird",
    night_owl: "Night Owl",
    flexible: "Flexible",
  },
  cleanliness: {
    very_clean: "Very Clean",
    moderate: "Moderate",
    relaxed: "Relaxed",
  },
  foodPreference: {
    veg: "Vegetarian",
    non_veg: "Non-Vegetarian",
    both: "Both",
  },
  socialHabits: {
    introvert: "Introvert",
    extrovert: "Extrovert",
    mixed: "Mixed",
  },
  stayDuration: {
    long_term: "Long Term",
    short_term: "Short Term",
    very_short: "Very Short",
    flexible: "Flexible",
  },
  situation: {
    student: "Student",
    intern: "Intern",
    freelancer: "Freelancer",
    employee: "Employee",
  },
};

const initialFormData = {
  sleepSchedule: "",
  cleanliness: "",
  foodPreference: "",
  socialHabits: "",
  interests: [],
  budget: 9000,
  situation: "",
  college: "",
  branch: "",
  examPrep: [],
  internshipLocation: "",
  internshipDuration: "",
  freelancerDuration: "",
  officeLocation: "",
  jobType: "",
  stayDuration: "",
};

const normalizeToken = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
const titleCase = (value) => String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const mapLabelToValue = (group, label) => LABEL_TO_VALUE[group]?.[label] || normalizeToken(label);
const mapValueToLabel = (group, value) => VALUE_TO_LABEL[group]?.[normalizeToken(value)] || titleCase(value);

const fromSavedProfileToForm = (profile = {}) => ({
  ...initialFormData,
  sleepSchedule: normalizeToken(profile.sleepSchedule),
  cleanliness: normalizeToken(profile.cleanliness),
  foodPreference: normalizeToken(profile.foodPreference),
  socialHabits: normalizeToken(profile.socialHabits),
  interests: Array.isArray(profile.interests) ? profile.interests : [],
  budget: Number(profile.budget || 9000),
  situation: normalizeToken(profile.situation),
  college: profile.college || "",
  branch: profile.branch || "",
  examPrep: profile.examPrep ? [profile.examPrep] : [],
  stayDuration: normalizeToken(profile.stayDuration),
  internshipLocation: profile.internshipLocation || "",
  internshipDuration: profile.internshipDuration || "",
  freelancerDuration: profile.freelancerDuration || "",
  officeLocation: profile.officeLocation || "",
  jobType: profile.jobType || "",
});

const buildLifestyleProfile = (formData, preferredCity = "", preferredArea = "") => ({
  sleepSchedule: normalizeToken(formData.sleepSchedule),
  cleanliness: normalizeToken(formData.cleanliness),
  foodPreference: normalizeToken(formData.foodPreference),
  socialHabits: normalizeToken(formData.socialHabits),
  budget: Number(formData.budget || 0),
  interests: (formData.interests || []).map((item) => normalizeToken(item)),
  situation: normalizeToken(formData.situation),
  college: formData.college || "",
  branch: formData.branch || "",
  examPrep: Array.isArray(formData.examPrep)
    ? normalizeToken(formData.examPrep.find((item) => item !== "None") || "")
    : normalizeToken(formData.examPrep || ""),
  stayDuration: normalizeToken(formData.stayDuration),
  internshipLocation: formData.internshipLocation || "",
  internshipDuration: formData.internshipDuration || "",
  freelancerDuration: formData.freelancerDuration || "",
  officeLocation: formData.officeLocation || "",
  jobType: formData.jobType || "",
  preferredCity,
  area: preferredArea,
  isProfileSaved: true,
  savedAt: serverTimestamp(),
});

export default function RoommateMatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [savedProfile, setSavedProfile] = useState(null);
  const [showQuiz, setShowQuiz] = useState(true);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Indore");
  const [selectedArea, setSelectedArea] = useState("");
  const [isFindingMatches, setIsFindingMatches] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [noMatchesMessage, setNoMatchesMessage] = useState("");

  const totalSteps = 6;
  const progressPercent = (currentStep / totalSteps) * 100;

  const userName =
    currentUser?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "there";

  const getLocalLifestyleProfile = () => {
    if (!currentUser?.uid) return null;
    try {
      const localUsers = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]");
      const localUser =
        localUsers.find((user) => String(user.id) === String(currentUser.uid)) ||
        localUsers.find((user) => user.email === currentUser?.email);
      return localUser?.lifestyleProfile || null;
    } catch {
      return null;
    }
  };

  const saveLocalLifestyleProfile = (lifestyleProfile) => {
    if (!currentUser?.uid) return;
    const persistedProfile = {
      ...lifestyleProfile,
      savedAt: new Date().toISOString(),
      isProfileSaved: true,
    };

    try {
      const localUsers = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]");
      const updatedUsers = localUsers.map((user) => {
        if (String(user.id) === String(currentUser.uid) || user.email === currentUser?.email) {
          return { ...user, lifestyleProfile: persistedProfile };
        }
        return user;
      });
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(updatedUsers));

      const localSession = JSON.parse(localStorage.getItem(DEMO_USER_KEY) || "null");
      if (localSession && (String(localSession.uid) === String(currentUser.uid) || localSession.email === currentUser?.email)) {
        localStorage.setItem(
          DEMO_USER_KEY,
          JSON.stringify({
            ...localSession,
            lifestyleProfile: persistedProfile,
          })
        );
      }
    } catch {
      // Ignore local cache write failures and continue UI flow.
    }

    return persistedProfile;
  };

  const summaryTags = useMemo(() => {
    if (!savedProfile) return [];
    return [
      `🌙 ${mapValueToLabel("sleepSchedule", savedProfile.sleepSchedule)}`,
      `🥗 ${mapValueToLabel("foodPreference", savedProfile.foodPreference)}`,
      `🧹 ${mapValueToLabel("cleanliness", savedProfile.cleanliness)}`,
      `🤫 ${mapValueToLabel("socialHabits", savedProfile.socialHabits)}`,
      `💰 Budget: ₹${Number(savedProfile.budget || 0).toLocaleString("en-IN")}`,
      `🎯 Interests: ${(savedProfile.interests || []).map((item) => titleCase(item)).join(", ") || "None"}`,
    ];
  }, [savedProfile]);

  useEffect(() => {
    let active = true;

    const loadSavedProfile = async () => {
      setIsCheckingProfile(true);
      setError("");

      if (!currentUser?.uid) {
        if (active) {
          setShowQuiz(true);
          setSavedProfile(null);
          setIsCheckingProfile(false);
        }
        return;
      }

      if (!isFirebaseConfigured || !db) {
        if (active) {
          const profile = getLocalLifestyleProfile();
          const shouldEdit = new URLSearchParams(location.search).get("editLifestyle") === "1";

          if (profile?.isProfileSaved) {
            setSavedProfile(profile);
            setSelectedCity(profile.preferredCity || "Indore");
            setSelectedArea(profile.area || "");
            setFormData(fromSavedProfileToForm(profile));
            if (shouldEdit) {
              setShowQuiz(true);
              setIsUpdateMode(true);
            } else {
              setShowQuiz(false);
              setIsUpdateMode(false);
            }
          } else {
            setShowQuiz(true);
            setSavedProfile(null);
            setIsUpdateMode(false);
          }

          setIsCheckingProfile(false);
        }
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(db, "users", currentUser.uid));
        const profile = userSnapshot.data()?.lifestyleProfile;
        const shouldEdit = new URLSearchParams(location.search).get("editLifestyle") === "1";

        if (profile?.isProfileSaved) {
          if (!active) return;
          setSavedProfile(profile);
          setSelectedCity(profile.preferredCity || "Indore");
          setSelectedArea(profile.area || "");
          setFormData(fromSavedProfileToForm(profile));

          if (shouldEdit) {
            setShowQuiz(true);
            setIsUpdateMode(true);
          } else {
            setShowQuiz(false);
            setIsUpdateMode(false);
          }
        } else if (active) {
          setSavedProfile(null);
          setShowQuiz(true);
          setIsUpdateMode(false);
        }
      } catch (fetchError) {
        if (active) {
          setShowQuiz(true);
          setSavedProfile(null);
          setError(fetchError?.message || "Unable to load lifestyle profile.");
        }
      } finally {
        if (active) {
          setIsCheckingProfile(false);
        }
      }
    };

    loadSavedProfile();

    return () => {
      active = false;
    };
  }, [currentUser?.uid, location.search]);

  const flashToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest],
    }));
  };

  const setSituation = (value) => {
    setFormData((prev) => ({
      ...prev,
      situation: value,
      college: "",
      branch: "",
      examPrep: [],
      internshipLocation: "",
      internshipDuration: "",
      freelancerDuration: "",
      officeLocation: "",
      jobType: "",
    }));
  };

  const toggleExamPrep = (exam) => {
    setFormData((prev) => {
      if (exam === "None") {
        return { ...prev, examPrep: ["None"] };
      }
      const withoutNone = prev.examPrep.filter((item) => item !== "None");
      const exists = withoutNone.includes(exam);
      return {
        ...prev,
        examPrep: exists ? withoutNone.filter((item) => item !== exam) : [...withoutNone, exam],
      };
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return Boolean(formData.sleepSchedule);
      case 2:
        return Boolean(formData.cleanliness);
      case 3:
        return Boolean(formData.foodPreference);
      case 4:
        return Boolean(formData.socialHabits);
      case 5:
        return formData.interests.length > 0;
      case 6: {
        if (!formData.situation || !formData.stayDuration) return false;
        if (formData.situation === "student") {
          return Boolean(formData.college && formData.branch && formData.examPrep.length > 0);
        }
        if (formData.situation === "intern") {
          return Boolean(formData.internshipLocation && formData.internshipDuration);
        }
        if (formData.situation === "freelancer") {
          return Boolean(formData.freelancerDuration);
        }
        if (formData.situation === "employee") {
          return Boolean(formData.officeLocation && formData.jobType);
        }
        return false;
      }
      default:
        return false;
    }
  };

  const handleSaveLifestyleProfile = async () => {
    const lifestyleProfile = buildLifestyleProfile(
      formData,
      savedProfile?.preferredCity || selectedCity || "",
      savedProfile?.area || selectedArea || ""
    );

    if (!currentUser?.uid) {
      throw new Error("Please login to save your lifestyle profile.");
    }

    if (!isFirebaseConfigured || !db) {
      return saveLocalLifestyleProfile(lifestyleProfile);
    }

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        lifestyleProfile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      doc(db, "roommate_preferences", currentUser.uid),
      {
        userId: currentUser.uid,
        sleepSchedule: lifestyleProfile.sleepSchedule,
        cleanliness: lifestyleProfile.cleanliness,
        foodPreference: lifestyleProfile.foodPreference,
        socialHabits: lifestyleProfile.socialHabits,
        budget: lifestyleProfile.budget,
        interests: lifestyleProfile.interests,
        situation: lifestyleProfile.situation,
        college: lifestyleProfile.college,
        branch: lifestyleProfile.branch,
        examPrep: lifestyleProfile.examPrep || "",
        stayDuration: lifestyleProfile.stayDuration,
        city: lifestyleProfile.preferredCity || "",
        area: lifestyleProfile.area || "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return lifestyleProfile;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canProceed()) return;

    setError("");
    try {
      const profile = await handleSaveLifestyleProfile();
      setSavedProfile(profile);

      if (isUpdateMode) {
        setShowQuiz(false);
        setIsUpdateMode(false);
        setCurrentStep(1);
        flashToast("Profile updated! ✅");
        return;
      }

      flashToast("Lifestyle profile saved! You won't need to fill this again. ✅");
      navigate("/roommate-results", {
        state: {
          userPrefs: profile,
        },
      });
    } catch (saveError) {
      setError(saveError?.message || "Could not save your profile. Please try again.");
    }
  };

  const handleFindMyMatches = async () => {
    if (!selectedCity) {
      setError("Please select a city first.");
      return;
    }

    if (!currentUser?.uid || !isFirebaseConfigured || !db) {
      const localProfile = getLocalLifestyleProfile() || savedProfile || formData;
      saveLocalLifestyleProfile({
        ...localProfile,
        preferredCity: selectedCity,
        area: selectedArea,
        isProfileSaved: true,
      });

      const fallbackMatches = getTopMatches(savedProfile || formData, candidates);
      navigate("/roommate-results", {
        state: {
          matches: fallbackMatches,
          userPrefs: localProfile,
          city: selectedCity,
          area: selectedArea,
        },
      });
      return;
    }

    setIsFindingMatches(true);
    setNoMatchesMessage("");
    setError("");

    try {
      const userSnapshot = await getDoc(doc(db, "users", currentUser.uid));
      const profile = userSnapshot.data()?.lifestyleProfile;

      if (!profile?.isProfileSaved) {
        setShowQuiz(true);
        setIsUpdateMode(false);
        setIsFindingMatches(false);
        return;
      }

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          lifestyleProfile: {
            ...profile,
            preferredCity: selectedCity,
            area: selectedArea,
            savedAt: serverTimestamp(),
            isProfileSaved: true,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "roommate_preferences", currentUser.uid),
        {
          userId: currentUser.uid,
          city: selectedCity,
          area: selectedArea,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const preferencesQuery = query(
        collection(db, "roommate_preferences"),
        where("city", "==", selectedCity)
      );
      const preferenceSnapshot = await getDocs(preferencesQuery);

      const candidatePreferences = preferenceSnapshot.docs
        .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
        .filter((candidate) => candidate.userId && candidate.userId !== currentUser.uid);

      if (candidatePreferences.length === 0) {
        setNoMatchesMessage(
          `No matches in ${selectedCity} yet. Be the first! Share HabiWise with your friends 🚀`
        );
        setIsFindingMatches(false);
        return;
      }

      const enrichedCandidates = await Promise.all(
        candidatePreferences.map(async (candidateProfile) => {
          const userDoc = await getDoc(doc(db, "users", candidateProfile.userId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          return {
            id: candidateProfile.userId,
            name: userData.name || userData.displayName || "HabiWise User",
            age: Number(userData.age || 24),
            city: candidateProfile.city || selectedCity,
            college: userData.college || userData.company || "Community Member",
            occupation: userData.company || "Resident",
            situation: titleCase(candidateProfile.situation || "student"),
            branch: candidateProfile.branch || "Other",
            examPrep: titleCase(candidateProfile.examPrep || "none"),
            stayDuration: titleCase(candidateProfile.stayDuration || "flexible"),
            sleepSchedule: titleCase(candidateProfile.sleepSchedule || "flexible"),
            cleanliness: titleCase(candidateProfile.cleanliness || "moderate"),
            foodPreference: titleCase(candidateProfile.foodPreference || "both"),
            socialHabits: titleCase(candidateProfile.socialHabits || "mixed"),
            interests: (candidateProfile.interests || []).map((item) => titleCase(item)),
            budget: Number(candidateProfile.budget || 9000),
            dnaTag: "Location compatible",
            image: userData.photoURL || "https://via.placeholder.com/150?text=HW",
            area: candidateProfile.area || "",
          };
        })
      );

      const sortedMatches = enrichedCandidates
        .map((candidate) => ({
          ...candidate,
          compatibility: calculateCompatibility(profile, candidate),
          conflictRisk: getConflictRisk(profile, candidate),
          sharedInterests: getSharedInterests(profile, candidate),
        }))
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 8);

      navigate("/roommate-results", {
        state: {
          matches: sortedMatches,
          userPrefs: profile,
          city: selectedCity,
          area: selectedArea,
        },
      });
    } catch (matchError) {
      setError(matchError?.message || "Could not fetch city matches right now.");
    } finally {
      setIsFindingMatches(false);
    }
  };

  const handleShare = async () => {
    const shareText = `Join me on HabiWise to find roommates in ${selectedCity}!`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "HabiWise",
          text: shareText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
        flashToast("Invite link copied. Share with your friends.");
      }
    } catch {
      flashToast("Share cancelled.");
    }
  };

  if (isCheckingProfile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#0D1117] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/70 p-8 text-center">
            <p className="text-lg font-semibold text-slate-300">Checking your lifestyle profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0D1117] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {!showQuiz && savedProfile ? (
            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 sm:p-8">
              <h1 className="text-3xl font-black text-white">👋 Welcome back, {userName}!</h1>
              <p className="mt-3 text-slate-300">Your lifestyle profile is already saved ✅</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {summaryTags.map((tag) => (
                  <div key={tag} className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-200">
                    {tag}
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-slate-200">Just select your location:</p>

                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setNoMatchesMessage("");
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-[#F5A623]"
                >
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  placeholder="e.g. Koramangala, HSR Layout"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#F5A623]"
                />

                <button
                  type="button"
                  onClick={handleFindMyMatches}
                  disabled={isFindingMatches}
                  className="w-full rounded-xl bg-[#F5A623] px-4 py-3 font-black text-black transition hover:bg-amber-400 disabled:opacity-70"
                >
                  {isFindingMatches ? "Finding Matches..." : "🔍 Find My Matches"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowQuiz(true);
                    setIsUpdateMode(true);
                    setCurrentStep(1);
                    setNoMatchesMessage("");
                  }}
                  className="text-sm font-semibold text-amber-300 hover:text-amber-200"
                >
                  ✏️ Update My Profile
                </button>
              </div>

              {noMatchesMessage && (
                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <p>{noMatchesMessage}</p>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="mt-3 rounded-full border border-amber-400/50 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/20"
                  >
                    Share HabiWise
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                  {isUpdateMode ? "Update Lifestyle Profile" : "Find Your Flatmate"}
                </h1>
                <p className="text-slate-400">
                  Answer a few questions about your lifestyle. We will match you with compatible roommates.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-300">Step {currentStep} of {totalSteps}</span>
                  <span className="text-xs text-slate-400 font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-8 space-y-8 shadow-2xl">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white">🌙 What's Your Sleep Schedule?</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {["Early Bird", "Night Owl", "Flexible"].map((option) => {
                        const value = mapLabelToValue("sleepSchedule", option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, sleepSchedule: value }))}
                            className={`p-4 rounded-lg font-semibold border-2 transition ${
                              formData.sleepSchedule === value
                                ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white">🧹 How Do You Feel About Cleanliness?</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {["Very Clean", "Moderate", "Relaxed"].map((option) => {
                        const value = mapLabelToValue("cleanliness", option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, cleanliness: value }))}
                            className={`p-4 rounded-lg font-semibold border-2 transition ${
                              formData.cleanliness === value
                                ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white">🍽️ What's Your Food Preference?</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {["Veg", "Non-Veg", "Both"].map((option) => {
                        const value = mapLabelToValue("foodPreference", option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, foodPreference: value }))}
                            className={`p-4 rounded-lg font-semibold border-2 transition ${
                              formData.foodPreference === value
                                ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white">👥 What's Your Social Style?</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {["Introvert", "Extrovert", "Mixed"].map((option) => {
                        const value = mapLabelToValue("socialHabits", option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, socialHabits: value }))}
                            className={`p-4 rounded-lg font-semibold border-2 transition ${
                              formData.socialHabits === value
                                ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-black text-white mb-6">⚡ Select Your Interests</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {INTERESTS_OPTIONS.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`p-3 rounded-lg font-semibold text-sm border-2 transition ${
                              formData.interests.includes(interest)
                                ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600"
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <h3 className="text-lg font-black text-white mb-4">💰 Budget Range</h3>
                      <input
                        type="range"
                        min="3000"
                        max="15000"
                        step="500"
                        value={formData.budget}
                        onChange={(e) => setFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-slate-400 text-sm">₹3,000</span>
                        <span className="text-amber-400 font-black text-lg">₹{formData.budget.toLocaleString()}</span>
                        <span className="text-slate-400 text-sm">₹15,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-white">Your Situation 📍</h2>
                      <p className="mt-1 text-sm text-slate-400">Help us find people in the same boat as you</p>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-200">I am currently a...</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Student", value: "student", icon: "🎓" },
                          { label: "Intern", value: "intern", icon: "💼" },
                          { label: "Freelancer", value: "freelancer", icon: "💻" },
                          { label: "Employee", value: "employee", icon: "🏢" },
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setSituation(item.value)}
                            className={`rounded-xl border-2 p-4 text-left transition ${
                              formData.situation === item.value
                                ? "border-amber-400 bg-amber-400/15"
                                : "border-slate-700 bg-slate-900/40 hover:border-slate-600"
                            }`}
                          >
                            <p className="text-2xl">{item.icon}</p>
                            <p className="mt-2 font-semibold text-white">{item.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.situation === "student" && (
                      <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                        <input
                          type="text"
                          value={formData.college}
                          onChange={(e) => setFormData((prev) => ({ ...prev, college: e.target.value }))}
                          placeholder="College name"
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                        />
                        <select
                          value={formData.branch}
                          onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                        >
                          <option value="">Select Branch/Stream</option>
                          {STREAM_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div>
                          <p className="mb-2 text-sm font-semibold text-slate-300">Exam Prep</p>
                          <div className="flex flex-wrap gap-2">
                            {EXAM_OPTIONS.map((exam) => {
                              const active = formData.examPrep.includes(exam);
                              return (
                                <button
                                  key={exam}
                                  type="button"
                                  onClick={() => toggleExamPrep(exam)}
                                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                    active
                                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                      : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                                  }`}
                                >
                                  {exam}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.situation === "intern" && (
                      <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                        <input
                          type="text"
                          value={formData.internshipLocation}
                          onChange={(e) => setFormData((prev) => ({ ...prev, internshipLocation: e.target.value }))}
                          placeholder="Internship company/area"
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {["1 month", "2 months", "3 months", "6 months"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, internshipDuration: option }))}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                formData.internshipDuration === option
                                  ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                  : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.situation === "freelancer" && (
                      <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                        <p className="text-sm font-semibold text-slate-300">Project duration</p>
                        <div className="grid grid-cols-2 gap-2">
                          {["2-4 weeks", "1-2 months", "3+ months", "Ongoing"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, freelancerDuration: option }))}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                formData.freelancerDuration === option
                                  ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                  : "border-slate-700 bg-slate-950 text-slate-300"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.situation === "employee" && (
                      <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                        <input
                          type="text"
                          value={formData.officeLocation}
                          onChange={(e) => setFormData((prev) => ({ ...prev, officeLocation: e.target.value }))}
                          placeholder="Office location"
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          {["Permanent", "Contract", "Probation"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, jobType: option }))}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                formData.jobType === option
                                  ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                  : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-300">Preferred stay duration</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["Long Term", "Short Term", "Very Short", "Flexible"].map((option) => {
                          const value = mapLabelToValue("stayDuration", option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, stayDuration: value }))}
                              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                formData.stayDuration === value
                                  ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                  : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                    disabled={currentStep === 1}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      currentStep === 1
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ← Back
                  </button>

                  {currentStep === totalSteps ? (
                    <button
                      type="submit"
                      disabled={!canProceed()}
                      className={`flex-1 py-3 rounded-lg font-black transition ${
                        canProceed()
                          ? "bg-[#F5A623] text-black hover:bg-amber-400"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {isUpdateMode ? "Save Updates" : "Find Matches 🚀"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((step) => Math.min(totalSteps, step + 1))}
                      disabled={!canProceed()}
                      className={`flex-1 py-3 rounded-lg font-black transition ${
                        canProceed()
                          ? "bg-[#F5A623] text-black hover:bg-amber-400"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Next →
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-amber-500/40 bg-[#0D1117] px-4 py-3 text-sm font-semibold text-amber-200 shadow-2xl shadow-black/30">
          {toast}
        </div>
      )}
    </>
  );
}
