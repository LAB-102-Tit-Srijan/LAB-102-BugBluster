import { useEffect, useState } from "react";
import { listenToSeekerConnections } from "../utils/connectionHelpers";
import { useAuth } from "../context/AuthContext";

export default function MyConnections() {
  const { currentUser } = useAuth();
  const [connections, setConnections] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [toast, setToast] = useState("");
  const [removingCards, setRemovingCards] = useState(new Set());

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = listenToSeekerConnections(currentUser.uid, (data) => {
      setConnections(data);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCardRemove = (connectionId) => {
    setRemovingCards((prev) => new Set([...prev, connectionId]));
    setTimeout(() => {
      setRemovingCards((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }, 500);
  };

  const pending = connections.filter((c) => c.status === "pending" && !removingCards.has(c.id));
  const matched = connections.filter((c) => c.status === "liked" && !removingCards.has(c.id));
  const passed = connections.filter((c) => c.status === "unliked");

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur p-6">
      <h3 className="text-2xl font-black text-white mb-6">My Connections</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "pending"
              ? "border-b-2 border-amber-500 text-amber-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          ⏳ Pending ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab("matched")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "matched"
              ? "border-b-2 border-emerald-500 text-emerald-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          ✅ Matched ({matched.length})
        </button>
        <button
          onClick={() => setActiveTab("passed")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "passed"
              ? "border-b-2 border-slate-500 text-slate-300"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          ❌ Passed ({passed.length})
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No pending connections yet. Send your first request from roommate matches!
            </p>
          ) : (
            pending.map((conn) => (
              <PendingConnectionCard key={conn.id} connection={conn} />
            ))
          )}
        </div>
      )}

      {/* Matched Requests */}
      {activeTab === "matched" && (
        <div className="space-y-4">
          {matched.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No mutual matches yet!</p>
          ) : (
            matched.map((conn) => (
              <MatchedConnectionCard key={conn.id} connection={conn} onRemove={() => handleCardRemove(conn.id)} />
            ))
          )}
        </div>
      )}

      {/* Passed Requests */}
      {activeTab === "passed" && (
        <div className="space-y-4">
          {passed.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No passed requests.</p>
          ) : (
            passed.map((conn) => (
              <PassedConnectionCard key={conn.id} connection={conn} />
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
 * Pending Connection Card with pulsing animation
 */
function PendingConnectionCard({ connection }) {
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
    <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/5 p-4 animate-pulse hover:border-amber-500/70 transition">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {getInitials(connection.ownerName)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm">{connection.ownerName}</h4>
            <p className="text-xs text-slate-400">{connection.propertyName} • {connection.seekerCompatibility}% Match</p>
            
            {/* Lifestyle Tags */}
            {connection.seekerLifestyle && (
              <div className="mt-2 flex flex-wrap gap-1">
                {connection.seekerLifestyle.sleep && (
                  <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded">
                    🌙 {formatLabel(connection.seekerLifestyle.sleep)}
                  </span>
                )}
                {connection.seekerLifestyle.food && (
                  <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded">
                    🥗 {formatLabel(connection.seekerLifestyle.food)}
                  </span>
                )}
                {connection.seekerLifestyle.cleanliness && (
                  <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded">
                    🧹 {formatLabel(connection.seekerLifestyle.cleanliness)}
                  </span>
                )}
              </div>
            )}

            {/* Interests */}
            {connection.seekerInterests && connection.seekerInterests.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                👉 {connection.seekerInterests.slice(0, 2).join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-lg">⏳</p>
          <p className="text-xs text-amber-300 font-semibold">Waiting...</p>
        </div>
      </div>
      <p className="text-xs text-slate-400">Sent {getTimeAgo(connection.createdAt)}</p>
    </div>
  );
}

/**
 * Matched Connection Card - shows contact details
 */
function MatchedConnectionCard({ connection, onRemove }) {
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
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {getInitials(connection.ownerName)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm">{connection.ownerName}</h4>
            <p className="text-xs text-slate-400">{connection.propertyName}</p>
            <p className="text-emerald-400 font-semibold text-xs mt-1">✅ {connection.seekerCompatibility}% Compatible</p>

            {/* Lifestyle Tags */}
            {connection.seekerLifestyle && (
              <div className="mt-2 flex flex-wrap gap-1">
                {connection.seekerLifestyle.sleep && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded">
                    🌙 {formatLabel(connection.seekerLifestyle.sleep)}
                  </span>
                )}
                {connection.seekerLifestyle.food && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded">
                    🥗 {formatLabel(connection.seekerLifestyle.food)}
                  </span>
                )}
                {connection.seekerLifestyle.budget && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded">
                    💰 ₹{Number(connection.seekerLifestyle.budget).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-lg">🎉</p>
          <p className="text-xs text-emerald-400 font-semibold">Matched!</p>
        </div>
      </div>

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
          className="px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-sm py-2 rounded-lg transition"
        >
          � Unlike
        </button>
      </div>
    </div>
  );
}

/**
 * Passed Connection Card - greyed out with Unlike option
 */
function PassedConnectionCard({ connection }) {
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "?";
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 hover:opacity-80 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-400 flex-shrink-0">
            {getInitials(connection.ownerName)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-400 text-sm">{connection.ownerName}</h4>
            <p className="text-xs text-slate-500">{connection.propertyName}</p>
            <p className="text-slate-500 text-xs mt-1">❌ Not a match this time</p>
            {connection.seekerInterests && connection.seekerInterests.length > 0 && (
              <p className="text-xs text-slate-600 mt-1">
                👉 {connection.seekerInterests.slice(0, 2).join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-lg">❌</p>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp) {
  if (!timestamp) return "Recently";
  const now = new Date();
  const created = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp.seconds * 1000);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
