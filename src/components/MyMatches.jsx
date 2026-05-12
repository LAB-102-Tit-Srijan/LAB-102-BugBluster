import { useEffect, useState } from "react";
import { listenToOwnerRequests, listenToOwnerMatches, updateConnectionStatus } from "../utils/connectionHelpers";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { key: "requests", label: "Requests" },
  { key: "matches", label: "Matches" },
];

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

    const unsubscribeRequests = listenToOwnerRequests(currentUser.uid, setRequests);
    const unsubscribeMatches = listenToOwnerMatches(currentUser.uid, setMatches);

    return () => {
      unsubscribeRequests();
      unsubscribeMatches();
    };
  }, [currentUser?.uid]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const handleLike = async (connectionId, seekerName) => {
    setActioningId(connectionId);
    try {
      await updateConnectionStatus(connectionId, "liked");
      showToast(`Matched with ${seekerName}.`);
    } finally {
      setActioningId(null);
    }
  };

  const handleUnlike = async (connectionId, seekerName) => {
    setActioningId(connectionId);
    try {
      await updateConnectionStatus(connectionId, "unliked");
      showToast(`Marked ${seekerName} as passed.`);
      setTimeout(() => setRemovingCards((prev) => new Set([...prev, connectionId])), 300);
    } finally {
      setActioningId(null);
    }
  };

  const filteredRequests = requests.filter((request) => !removingCards.has(request.id));
  const activeItems = activeTab === "requests" ? filteredRequests : matches;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-bold leading-none text-white">My Matches</h3>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((tab) => {
          const count = tab.key === "requests" ? filteredRequests.length : matches.length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "border border-slate-600 bg-slate-800 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {activeItems.length === 0 && (
          <p className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-400">
            {activeTab === "requests" ? "No pending requests yet." : "No confirmed matches yet."}
          </p>
        )}

        {activeTab === "requests" &&
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onLike={() => handleLike(request.id, request.seekerName)}
              onUnlike={() => handleUnlike(request.id, request.seekerName)}
              isActioning={actioningId === request.id}
            />
          ))}

        {activeTab === "matches" &&
          matches.map((match) => (
            <MatchedCard key={match.id} match={match} onRemove={() => handleUnlike(match.id, match.seekerName)} />
          ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/30">
          {toast}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, onLike, onUnlike, isActioning }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <ProfileHeader name={request.seekerName} subtitle={request.seekerCollege || "Student"} compatibility={request.seekerCompatibility} />
      <TagRow lifestyle={request.seekerLifestyle} interests={request.seekerInterests} />

      <div className="mt-3 flex gap-2 border-t border-slate-800 pt-3">
        <button
          onClick={onLike}
          disabled={isActioning}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={onUnlike}
          disabled={isActioning}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
        >
          Pass
        </button>
      </div>
    </div>
  );
}

function MatchedCard({ match, onRemove }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <ProfileHeader name={match.seekerName} subtitle={match.seekerCollege || "Student"} compatibility={match.seekerCompatibility} />
      <TagRow lifestyle={match.seekerLifestyle} interests={match.seekerInterests} />

      <div className="mt-3 grid gap-2 border-t border-emerald-500/20 pt-3 text-sm text-slate-300">
        <p>Phone: +91 98765 XXXXX</p>
        <p>Email: Contact via HabiWise</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
          Message
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function ProfileHeader({ name, subtitle, compatibility }) {
  const initials = String(name || "?")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="flex gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-sm font-bold text-slate-200">
        {initials || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-white">{name}</h4>
        <p className="truncate text-xs text-slate-400">{subtitle}</p>
        <p className="mt-1 text-xs font-semibold tracking-wide text-amber-300">Compatibility: {compatibility}%</p>
      </div>
    </div>
  );
}

function TagRow({ lifestyle, interests }) {
  const tags = [];

  if (lifestyle?.sleep) tags.push(`Sleep: ${formatLabel(lifestyle.sleep)}`);
  if (lifestyle?.food) tags.push(`Food: ${formatLabel(lifestyle.food)}`);
  if (lifestyle?.cleanliness) tags.push(`Cleanliness: ${formatLabel(lifestyle.cleanliness)}`);
  if (lifestyle?.budget) tags.push(`Budget: INR ${Number(lifestyle.budget).toLocaleString("en-IN")}`);

  return (
    <>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      {interests?.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-slate-500">Interests: {interests.slice(0, 2).join(", ")}{interests.length > 2 ? ` +${interests.length - 2}` : ""}</p>
      )}
    </>
  );
}

function formatLabel(value) {
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
