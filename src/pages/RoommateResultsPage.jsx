import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getTopMatches } from "../utils/matchingLogic";
import SharedPods from "../components/SharedPods";
import { FEE_CONFIG } from "../utils/feeCalculator";
import { createConnection } from "../utils/connectionHelpers";
import { useAuth } from "../context/AuthContext";

export default function RoommateResultsPage() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const userPrefs = location.state?.userPrefs || location.state || {};
  const cityLabel = location.state?.city || "";
  const areaLabel = location.state?.area || "";
  const presetMatches = Array.isArray(location.state?.matches) ? location.state.matches : null;
  const [isCalculating, setIsCalculating] = useState(true);
  const [matches, setMatches] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [connectionCreating, setConnectionCreating] = useState(false);

  useEffect(() => {
    // Calculate matches after 2 seconds to show the animation
    const timer = setTimeout(() => {
      const topMatches = presetMatches || getTopMatches(userPrefs, candidates);
      setMatches(topMatches);
      setIsCalculating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [presetMatches, userPrefs]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Your Flatmate Matches</h1>
            <p className="text-slate-400">
              Based on your lifestyle choices, here are your best matches{cityLabel ? ` in ${cityLabel}` : ""}
              {areaLabel ? ` near ${areaLabel}` : ""}:
            </p>
          </div>

          {isCalculating ? (
            /* Calculating Animation */
            <div className="flex flex-col items-center justify-center py-24 space-y-8">
              <div className="text-center">
                <p className="text-3xl font-black text-white mb-8 animate-pulse">🧬 Calculating your Flatmate DNA...</p>
              </div>

              {/* Progress bar animation */}
              <div className="w-full max-w-md space-y-2">
                <div className="h-3 rounded-full bg-slate-800/60 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full animate-pulse"
                    style={{
                      animation: "slideX 2s ease-in-out infinite",
                    }}
                  ></div>
                </div>
                <p className="text-center text-slate-400 text-sm">Finding your perfect match...</p>
              </div>

              {/* DNA helix animation */}
              <div className="text-6xl animate-bounce">🧬</div>
            </div>
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {matches.length > 0 ? (
                matches.map((candidate, idx) => (
                  <MatchCard
                    key={candidate.id}
                    candidate={candidate}
                    index={idx}
                    onConnect={() => {
                      setSelectedCandidate(candidate);
                      setShowFeeModal(true);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-slate-400">No matches found with your preferences. Try adjusting your choices!</p>
                </div>
              )}
            </div>
          )}

          {/* Community Pods */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Or join a community pod</h2>
            <SharedPods />
          </div>
        </div>
      </div>

      {showFeeModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/25 bg-[#0D1117] p-6 text-slate-100 shadow-2xl shadow-black/40">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Roommate Match</p>
            <h3 className="mt-3 text-2xl font-black text-white">🧬 Connect with {selectedCandidate.name}</h3>
            <p className="mt-2 text-sm text-slate-400">Compatibility: {selectedCandidate.compatibility}%</p>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Roommate Match Fee</span>
                <span className="font-black text-amber-300">₹{FEE_CONFIG.roommateMatch}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">(One-time, non-refundable)</p>
            </div>

            <div className="mt-5 space-y-2 text-sm text-slate-300">
              <p>✅ Direct contact details</p>
              <p>✅ Verified profile access</p>
              <p>✅ Chat unlocked</p>
              <p>✅ 30-day match guarantee</p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                disabled={connectionCreating}
                onClick={async () => {
                  setConnectionCreating(true);
                  try {
                    // Create connection document
                    const connectionData = {
                      seekerId: currentUser?.uid || "guest",
                      seekerName: currentUser?.displayName || "Anonymous",
                      seekerCollege: currentUser?.college || "Not specified",
                      seekerCompatibility: selectedCandidate.compatibility,
                      seekerInterests: selectedCandidate.interests || [],
                      seekerLifestyle: selectedCandidate.lifestyle || {},
                      ownerId: selectedCandidate.userId || selectedCandidate.id,
                      ownerName: selectedCandidate.name,
                      propertyId: selectedCandidate.propertyId || "unknown",
                      propertyName: selectedCandidate.propertyName || "Property",
                      status: "pending",
                    };
                    await createConnection(connectionData);
                  } finally {
                    setConnectionCreating(false);
                  }
                  setShowFeeModal(false);
                  setShowSuccessModal(true);
                }}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-3 font-black text-black transition hover:bg-amber-400 disabled:opacity-50"
              >
                Connect for ₹{FEE_CONFIG.roommateMatch}
              </button>
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="text-sm font-semibold text-slate-400 transition hover:text-slate-200"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/25 bg-[#0D1117] p-6 text-slate-100 shadow-2xl shadow-black/40">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Request Sent</p>
            <h3 className="mt-3 text-2xl font-black text-white">🎉 Request Sent!</h3>
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 text-sm text-slate-300">
              <p>Your connection request has been sent to</p>
              <p className="font-bold text-white text-lg">{selectedCandidate.name}</p>
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <span>💛</span>
                <span>Waiting for their response</span>
              </div>
              <p className="text-xs text-slate-400">You'll be notified when they respond</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedCandidate(null);
                }}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-3 font-black text-black transition hover:bg-amber-400"
              >
                Great!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideX {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
}

/**
 * MatchCard Component with Animated Compatibility
 */
function MatchCard({ candidate, index, onConnect }) {
  const [displayedCompatibility, setDisplayedCompatibility] = useState(0);

  // Animate the compatibility percentage counting up
  useEffect(() => {
    const startDelay = index * 300; // Stagger cards by 300ms
    const timeout = setTimeout(() => {
      let current = 0;
      const target = candidate.compatibility;
      const increment = target / 30; // Animate over ~300ms
      const intervalId = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayedCompatibility(target);
          clearInterval(intervalId);
        } else {
          setDisplayedCompatibility(Math.round(current));
        }
      }, 10);
      return () => clearInterval(intervalId);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [candidate.compatibility, index]);

  const isGreen = displayedCompatibility >= 80;
  const isAmber = displayedCompatibility >= 60 && displayedCompatibility < 80;
  const isRed = displayedCompatibility < 60;

  const isConflictLow = candidate.conflictRisk === "Low";
  const isConflictMedium = candidate.conflictRisk === "Medium";
  const isConflictHigh = candidate.conflictRisk === "High";

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-400 animate-slideUp motion-safe:transition-opacity"
      style={{
        animationDelay: `${index * 300}ms`,
      }}
    >
      {/* Avatar with Initials */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-xl font-black text-white shadow-lg transition-transform duration-300 ease-out hover:scale-105">
          {initials}
        </div>
      </div>

      {/* Name and Age */}
      <h3 className="mb-1 text-center text-lg font-black text-white">{candidate.name}</h3>
      <p className="mb-3 text-center text-sm text-slate-400">{candidate.age} years old</p>

      {/* DNA Tag */}
      <div className="mb-4 text-center">
        <span className="inline-block rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 transition-colors duration-300 ease-out">
          🎯 {candidate.dnaTag}
        </span>
      </div>

      {/* College/Company */}
      <p className="mb-4 line-clamp-2 text-center text-xs text-slate-400">{candidate.college}</p>

      {/* Compatibility Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Compatibility</span>
          <span
            className={`font-black ${
              isGreen ? "text-green-400" : isAmber ? "text-amber-400" : "text-red-400"
            }`}
          >
            {displayedCompatibility}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-800/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isGreen
                ? "bg-gradient-to-r from-green-400 to-green-500"
                : isAmber
                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                : "bg-gradient-to-r from-red-400 to-red-500"
            }`}
            style={{ width: `${displayedCompatibility}%` }}
          ></div>
        </div>
      </div>

      {candidate.situationTag && (
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 transition-all duration-300 ease-out">
            {candidate.situationTag}
          </span>
        </div>
      )}

      {/* Shared Interests */}
      {candidate.sharedInterests.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-slate-300">Shared Interests:</p>
          <div className="flex flex-wrap gap-1">
            {candidate.sharedInterests.map((interest) => (
              <span
                key={interest}
                className="rounded border border-amber-500/30 bg-amber-400/20 px-2 py-1 text-xs font-semibold text-amber-300 transition-colors duration-300 ease-out"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Conflict Risk Badge */}
      <div className="mb-4">
        <span
          className={`inline-block w-full rounded-full border px-3 py-1 text-center text-xs font-bold transition-colors duration-300 ease-out ${
            isConflictLow
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : isConflictMedium
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-red-500/20 text-red-300 border-red-500/40"
          }`}
        >
          ⚠️ Conflict Risk: {candidate.conflictRisk}
        </span>
      </div>

      {/* Connect Button */}
      <button
        type="button"
        onClick={onConnect}
        className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2 font-black text-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400"
      >
        💬 Connect
      </button>
    </div>
  );
}
