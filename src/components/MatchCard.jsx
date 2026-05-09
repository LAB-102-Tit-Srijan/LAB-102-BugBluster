export default function MatchCard({ candidate, matchScore }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-center">
      <img
        src={candidate.image}
        alt={candidate.name}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{candidate.name}</h3>
      <p className="text-gray-600 mb-2">{candidate.occupation}</p>
      <div className="mb-4 p-3 bg-indigo-100 rounded-lg">
        <p className="text-2xl font-bold text-indigo-600">{matchScore}%</p>
        <p className="text-sm text-gray-600">Match Score</p>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Budget: Rs{candidate.budget}</p>
        <p>City: {candidate.city}</p>
      </div>
      <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">
        Connect
      </button>
    </div>
  );
}
