import { useEffect, useState } from "react";
import { listenToOwnerRequests, listenToOwnerMatches, updateConnectionStatus } from "../utils/connectionHelpers";
import { useAuth } from "../context/AuthContext";

export default function MyMatches() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [toast, setToast] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [removingCards, setRemovingCards] = useState(new Set());

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubRequests = listenToOwnerRequests(currentUser.uid, setRequests);
    const unsubMatches = listenToOwnerMatches(currentUser.uid, setMatches);

    return () => {
      unsubRequests();
      unsubMatches();
    };
  }, [currentUser?.uid]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLike = async (connectionId, seekerName) => {
    setActioningId(connectionId);
    try {
      await updateConnectionStatus(connectionId, "liked");
      showToast(`✅ Matched with ${seekerName}!`);
    } finally {
      setActioningId(null);
    }
  };

  const handleUnlike = async (connectionId, seekerName) => {
    setActioningId(connectionId);
    try {
      await updateConnectionStatus(connectionId, "unliked");
      showToast(`❌ Passed on ${seekerName}`);
      setTimeout(() => {
        setRemovingCards((prev) => new Set([...prev, connectionId]));
      }, 500);
    } finally {
      setActioningId(null);
    }
  };

  const filteredRequests = requests.filter((r) => !removingCards.has(r.id));

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur p-6">
      <h3 className="text-2xl font-black text-white mb-6">My Matches</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "requests"
              ? "border-b-2 border-amber-500 text-amber-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          🔔 Requests ({filteredRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("matches")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "matches"
              ? "border-b-2 border-emerald-500 text-emerald-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          ✅ Matches ({matches.length})
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No pending connection requests yet. Your property will be matched with interested seekers!
            </p>
          ) : (
            filteredRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onLike={() => handleLike(req.id, req.seekerName)}
                onUnlike={() => handleUnlike(req.id, req.seekerName)}
                isActioning={actioningId === req.id}
              />
            ))
          )}
        </div>
      )}

      {/* Matched Seekers */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No mutual matches yet. Approve requests to create matches!
            </p>
          ) : (
            matches.map((match) => (
              <MatchCard key={match.id} match={match} onRemove={() => handleUnlike(match.id, match.seekerName)} />
            ))
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 shadow-2xl shadow-black/30 animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}

/**
 * Connection Request Card - with Like/Unlike buttons
 */
function RequestCard({ request, onLike, onUnlike, isActioning }) {
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "?";
  };

  const formatLabel = (text) => {
    return String(text)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 hover:border-amber-500/50 transition">
      <div className="flex gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
          {getInitials(request.seekerName)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm">{request.seekerName}</h4>
          <p className="text-xs text-slate-400">{request.seekerCollege || "Student"}</p>
          <p className="text-amber-400 font-semibold text-xs mt-1">{request.seekerCompatibility}% Match</p>
        </div>
      </div>

      {/* Lifestyle Info */}
      {request.seekerLifestyle && (
        <div className="mb-3 space-y-1">
          <div className="flex flex-wrap gap-1">
            {request.seekerLifestyle.sleep && (
              <span className="text-xs bg-amber-500/15 text-amber-200 px-2 py-0.5 rounded-full">
                🌙 {formatLabel(request.seekerLifestyle.sleep)}
              </span>
            )}
            {request.seekerLifestyle.food && (
              <span className="text-xs bg-amber-500/15 text-amber-200 px-2 py-0.5 rounded-full">
                🥗 {formatLabel(request.seekerLifestyle.food)}
              </span>
            )}
            {request.seekerLifestyle.cleanliness && (
              <span className="text-xs bg-amber-500/15 text-amber-200 px-2 py-0.5 rounded-full">
                🧹 {formatLabel(request.seekerLifestyle.cleanliness)}
              </span>
            )}
          </div>
          {request.seekerInterests && request.seekerInterests.length > 0 && (
            <p className="text-xs text-slate-400">
              👉 Interests: {request.seekerInterests.slice(0, 2).join(", ")}
              {request.seekerInterests.length > 2 ? ` +${request.seekerInterests.length - 2}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-amber-500/20">
        <button
          onClick={onLike}
          disabled={isActioning}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition"
        >
          👍 Like
        </button>
        <button
          onClick={onUnlike}
          disabled={isActioning}
          className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-sm font-semibold py-2 rounded-lg transition"
        >
          👎 Unlike
        </button>
      </div>
    </div>
  );
}

/**
 * Matched Seeker Card - shows only ones owner liked
 */
function MatchCard({ match, onRemove }) {
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "?";
  };

  const formatLabel = (text) => {
    return String(text)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 p-4 hover:border-emerald-500/70 transition">
      <div className="flex gap-4 mb-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
          {getInitials(match.seekerName)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm">{match.seekerName}</h4>
          <p className="text-sm text-emerald-400 font-semibold">✅ Mutual Match!</p>
          <p className="text-xs text-slate-400 mt-0.5">{match.seekerCollege || "Student"}</p>
          <p className="text-emerald-300 text-xs mt-1">{match.seekerCompatibility}% Compatible</p>
        </div>
      </div>

      {/* Lifestyle Info */}
      {match.seekerLifestyle && (
        <div className="mb-3 flex flex-wrap gap-1">
          {match.seekerLifestyle.sleep && (
            <span className="text-xs bg-emerald-500/15 text-emerald-200 px-2 py-0.5 rounded-full">
              🌙 {formatLabel(match.seekerLifestyle.sleep)}
            </span>
          )}
          {match.seekerLifestyle.food && (
            <span className="text-xs bg-emerald-500/15 text-emerald-200 px-2 py-0.5 rounded-full">
              🥗 {formatLabel(match.seekerLifestyle.food)}
            </span>
          )}
          {match.seekerLifestyle.budget && (
            <span className="text-xs bg-emerald-500/15 text-emerald-200 px-2 py-0.5 rounded-full">
              💰 ₹{Number(match.seekerLifestyle.budget).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      )}

      {/* Contact Details */}
      <div className="border-t border-emerald-500/30 pt-3 space-y-2 mb-3">
        <p className="text-sm text-slate-300">
          <span className="text-emerald-400">📞</span> +91 98765 XXXXX
        </p>
        <p className="text-sm text-slate-300">
          <span className="text-emerald-400">📧</span> Contact via HabiWise
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2 rounded-lg transition">
          💬 Message
        </button>
        <button
          onClick={onRemove}
          className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm py-2 rounded-lg transition"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
