import { useEffect, useState, useMemo } from "react";
import { listenToOwnerRequests, updateConnectionStatus } from "../utils/connectionHelpers";
import { useAuth } from "../context/AuthContext";

export default function ConnectionBell() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  // Check user role
  const localProfile = useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      const savedUsers = JSON.parse(localStorage.getItem("habiwise_demo_users") || "[]");
      return savedUsers.find((user) => user.email === currentUser?.email) || {};
    } catch {
      return {};
    }
  }, [currentUser?.email]);

  const normalizedRole = (currentUser?.role || localProfile.role || "Student").toLowerCase();
  const roleLabel = normalizedRole.includes("professional") ? "Professional" : "Student";
  const isOwner = roleLabel === "Professional";

  useEffect(() => {
    if (!currentUser?.uid || !isOwner) return;

    const unsubscribe = listenToOwnerRequests(currentUser.uid, setRequests);

    return () => unsubscribe();
  }, [currentUser?.uid, isOwner]);

  const handleLike = async (connectionId) => {
    setActioningId(connectionId);
    try {
      await updateConnectionStatus(connectionId, "liked");
    } finally {
      setActioningId(null);
    }
  };

  const handleUnlike = async (connectionId) => {
    setActioningId(connectionId);
    try {
      await updateConnectionStatus(connectionId, "unliked");
    } finally {
      setActioningId(null);
    }
  };

  // Only show bell for property owners
  if (!currentUser?.uid || !isOwner) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-slate-800 rounded-lg transition"
      >
        🔔
        {requests.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {requests.length > 9 ? "9+" : requests.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl z-50">
          <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-900">
            <h3 className="font-bold text-white">
              🔔 Connection Requests ({requests.length})
            </h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {requests.length === 0 ? (
              <p className="p-4 text-center text-slate-400 text-sm">
                No pending connection requests yet. Property will match with interested seekers!
              </p>
            ) : (
              <div className="p-3 space-y-3">
                {requests.map((request) => (
                  <RequestPreviewCard
                    key={request.id}
                    request={request}
                    onLike={() => handleLike(request.id)}
                    onUnlike={() => handleUnlike(request.id)}
                    isActioning={actioningId === request.id}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-700 text-center">
            <a href="/dashboard" className="text-xs text-amber-300 font-semibold hover:text-amber-200">
              View All Requests →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestPreviewCard({ request, onLike, onUnlike, isActioning }) {
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
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 hover:border-amber-500/50 transition">
      <div className="flex gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {getInitials(request.seekerName)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm truncate">{request.seekerName}</h4>
          <p className="text-xs text-slate-400 truncate">{request.seekerCollege || "Student"}</p>
          <p className="text-amber-400 font-semibold text-xs mt-0.5">{request.seekerCompatibility}% Match</p>
        </div>
      </div>

      {/* Lifestyle Tags */}
      {request.seekerLifestyle && (
        <div className="mb-2 flex flex-wrap gap-1">
          {request.seekerLifestyle.sleep && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded">
              🌙 {formatLabel(request.seekerLifestyle.sleep)}
            </span>
          )}
          {request.seekerLifestyle.food && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded">
              🥗 {formatLabel(request.seekerLifestyle.food)}
            </span>
          )}
          {request.seekerLifestyle.cleanliness && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded">
              🧹 {formatLabel(request.seekerLifestyle.cleanliness)}
            </span>
          )}
        </div>
      )}

      {/* Interests */}
      {request.seekerInterests && request.seekerInterests.length > 0 && (
        <p className="text-xs text-slate-400 mb-2">
          👉 {request.seekerInterests.slice(0, 2).join(", ")}
          {request.seekerInterests.length > 2 ? ` +${request.seekerInterests.length - 2}` : ""}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-amber-500/20">
        <button
          onClick={onLike}
          disabled={isActioning}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold py-1.5 rounded transition"
        >
          👍 Like
        </button>
        <button
          onClick={onUnlike}
          disabled={isActioning}
          className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-xs font-semibold py-1.5 rounded transition"
        >
          👎 Unlike
        </button>
      </div>
    </div>
  );
}
