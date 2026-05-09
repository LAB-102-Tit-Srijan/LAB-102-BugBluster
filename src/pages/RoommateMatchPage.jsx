import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const INTERESTS_OPTIONS = ["Coding", "Gym", "Startup", "Music", "Gaming", "UPSC", "Reading", "Travel"];
const STREAM_OPTIONS = ["CSE", "ECE", "MBA", "Law", "Medical", "Commerce", "Arts", "Other"];
const EXAM_OPTIONS = ["UPSC", "CAT", "GATE", "JEE", "CA", "NEET", "None"];

export default function RoommateMatchPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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
  });

  const totalSteps = 6;
  const progressPercent = (currentStep / totalSteps) * 100;

  // Step 1: Sleep Schedule
  const handleSleepSchedule = (value) => {
    setFormData((prev) => ({ ...prev, sleepSchedule: value }));
  };

  // Step 2: Cleanliness
  const handleCleanliness = (value) => {
    setFormData((prev) => ({ ...prev, cleanliness: value }));
  };

  // Step 3: Food Preference
  const handleFoodPreference = (value) => {
    setFormData((prev) => ({ ...prev, foodPreference: value }));
  };

  // Step 4: Social Habits
  const handleSocialHabits = (value) => {
    setFormData((prev) => ({ ...prev, socialHabits: value }));
  };

  // Step 5: Interests
  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // Budget slider
  const handleBudget = (e) => {
    setFormData((prev) => ({ ...prev, budget: parseInt(e.target.value) }));
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
        return formData.sleepSchedule;
      case 2:
        return formData.cleanliness;
      case 3:
        return formData.foodPreference;
      case 4:
        return formData.socialHabits;
      case 5:
        return formData.interests.length > 0;
      case 6: {
        if (!formData.situation || !formData.stayDuration) return false;
        if (formData.situation === "Student") {
          return Boolean(formData.college && formData.branch && formData.examPrep.length > 0);
        }
        if (formData.situation === "Intern") {
          return Boolean(formData.internshipLocation && formData.internshipDuration);
        }
        if (formData.situation === "Freelancer") {
          return Boolean(formData.freelancerDuration);
        }
        if (formData.situation === "Employee") {
          return Boolean(formData.officeLocation && formData.jobType);
        }
        return false;
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canProceed()) {
      navigate("/roommate-results", { state: formData });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Find Your Flatmate</h1>
            <p className="text-slate-400">Answer a few questions about your lifestyle. We'll match you with compatible roommates using AI.</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Step {currentStep} of {totalSteps}</span>
              <span className="text-xs text-slate-400 font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur p-8 space-y-8 shadow-2xl">
            
            {/* STEP 1: SLEEP SCHEDULE */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn motion-safe:transition-opacity motion-safe:duration-300">
                <h2 className="text-2xl font-black text-white">🌙 What's Your Sleep Schedule?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {["Early Bird", "Night Owl", "Flexible"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSleepSchedule(option)}
                      className={`p-4 rounded-lg font-semibold transition-all duration-300 ease-out border-2 ${
                        formData.sleepSchedule === option
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:-translate-y-0.5"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: CLEANLINESS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn motion-safe:transition-opacity motion-safe:duration-300">
                <h2 className="text-2xl font-black text-white">🧹 How Do You Feel About Cleanliness?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {["Very Clean", "Moderate", "Relaxed"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleCleanliness(option)}
                      className={`p-4 rounded-lg font-semibold transition-all duration-300 ease-out border-2 ${
                        formData.cleanliness === option
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:-translate-y-0.5"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: FOOD PREFERENCE */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn motion-safe:transition-opacity motion-safe:duration-300">
                <h2 className="text-2xl font-black text-white">🍽️ What's Your Food Preference?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {["Veg", "Non-Veg", "Both"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleFoodPreference(option)}
                      className={`p-4 rounded-lg font-semibold transition-all duration-300 ease-out border-2 ${
                        formData.foodPreference === option
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:-translate-y-0.5"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: SOCIAL HABITS */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn motion-safe:transition-opacity motion-safe:duration-300">
                <h2 className="text-2xl font-black text-white">👥 What's Your Social Style?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {["Introvert", "Extrovert", "Mixed"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSocialHabits(option)}
                      className={`p-4 rounded-lg font-semibold transition-all duration-300 ease-out border-2 ${
                        formData.socialHabits === option
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:-translate-y-0.5"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: INTERESTS & BUDGET */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-fadeIn motion-safe:transition-opacity motion-safe:duration-300">
                <div>
                  <h2 className="text-2xl font-black text-white mb-6">⚡ Select Your Interests</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {INTERESTS_OPTIONS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-out border-2 ${
                          formData.interests.includes(interest)
                            ? "border-amber-400 bg-amber-400/20 text-amber-300"
                            : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:-translate-y-0.5"
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
                    onChange={handleBudget}
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

            {/* STEP 6: SITUATION */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-fadeIn motion-safe:transition-opacity motion-safe:duration-300">
                <div>
                  <h2 className="text-2xl font-black text-white">Your Situation 📍</h2>
                  <p className="mt-1 text-sm text-slate-400">Help us find people in the same boat as you</p>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-200">I am currently a...</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Student", icon: "🎓" },
                      { label: "Intern", icon: "💼" },
                      { label: "Freelancer", icon: "💻" },
                      { label: "Employee", icon: "🏢" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setSituation(item.label)}
                        className={`rounded-xl border-2 p-4 text-left transition-all duration-300 ease-out ${
                          formData.situation === item.label
                            ? "border-amber-400 bg-amber-400/15"
                            : "border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:-translate-y-0.5"
                        }`}
                      >
                        <p className="text-2xl">{item.icon}</p>
                        <p className="mt-2 font-semibold text-white">{item.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.situation === "Student" && (
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
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ease-out ${
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

                {formData.situation === "Intern" && (
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
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-300 ease-out ${
                            formData.internshipDuration === option
                              ? "border-amber-400 bg-amber-400/20 text-amber-300"
                              : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:-translate-y-0.5"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.situation === "Freelancer" && (
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

                {formData.situation === "Employee" && (
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
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-300 ease-out ${
                            formData.jobType === option
                              ? "border-amber-400 bg-amber-400/20 text-amber-300"
                              : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:-translate-y-0.5"
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
                    {["Long Term", "Short Term", "Very Short", "Flexible"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, stayDuration: option }))}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-300 ease-out ${
                          formData.stayDuration === option
                            ? "border-amber-400 bg-amber-400/20 text-amber-300"
                            : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:-translate-y-0.5"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-700 transition-opacity duration-300 ease-out">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ease-out ${
                  currentStep === 1
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:-translate-y-0.5"
                }`}
              >
                ← Back
              </button>

              {currentStep === totalSteps ? (
                <button
                  type="submit"
                  disabled={!canProceed()}
                  className={`flex-1 py-3 rounded-lg font-black transition-all duration-300 ease-out ${
                    canProceed()
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Find Matches 🚀
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex-1 py-3 rounded-lg font-black transition-all duration-300 ease-out ${
                    canProceed()
                      ? "bg-amber-400 text-black hover:bg-amber-300"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Next →
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
