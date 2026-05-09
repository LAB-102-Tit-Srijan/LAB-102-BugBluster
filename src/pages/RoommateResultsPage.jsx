import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MatchCard from "../components/MatchCard";
import { candidates } from "../data/candidates";
import { getTopMatches } from "../utils/matchingLogic";

export default function RoommateResultsPage() {
  const location = useLocation();
  const userPreferences = location.state || { budget: null, city: null, role: null };

  const topMatches = getTopMatches(userPreferences, candidates);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black text-white">Your Roommate Matches</h1>

        {topMatches.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400">No matches found with your preferences.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topMatches.map((candidate) => (
              <MatchCard key={candidate.id} candidate={candidate} matchScore={candidate.matchScore} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
