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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Roommate Matches</h1>

        {topMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No matches found with your preferences.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topMatches.map((candidate) => (
              <MatchCard key={candidate.id} candidate={candidate} matchScore={candidate.matchScore} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
