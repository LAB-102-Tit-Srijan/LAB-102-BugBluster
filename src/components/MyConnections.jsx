import { useEffect, useState } from "react";
import { listenToSeekerConnections } from "../utils/connectionHelpers";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "matched", label: "Matched" },
  { key: "passed", label: "Passed" },
];

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

  const handleCardRemove = (connectionId) => {
    setToast("Connection removed from matched list.");
    setTimeout(() => setToast(""), 2000);

    setRemovingCards((prev) => new Set([...prev, connectionId]));
    setTimeout(() => {
      setRemovingCards((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }, 400);
  };

  const pending = connections.filter((connection) => connection.status === "pending" && !removingCards.has(connection.id));
  const matched = connections.filter((connection) => connection.status === "liked" && !removingCards.has(connection.id));
  const passed = connections.filter((connection) => connection.status === "unliked");

  const counts = {
    pending: pending.length,
    matched: matched.length,
    passed: passed.length,
  };

  const activeItems = activeTab === "pending" ? pending : activeTab === "matched" ? matched : passed;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-bold leading-none text-white">My Connections</h3>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border border-slate-600 bg-slate-800 text-white"
                : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {activeItems.length === 0 && (
          <p className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-400">
            {activeTab === "pending" && "No pending requests yet."}
            {activeTab === "matched" && "No confirmed matches yet."}
            {activeTab === "passed" && "No passed requests yet."}
          </p>
        )}

        {activeTab === "pending" && activeItems.map((connection) => <PendingConnectionCard key={connection.id} connection={connection} />)}
        {activeTab === "matched" &&
          activeItems.map((connection) => (
            <MatchedConnectionCard key={connection.id} connection={connection} onRemove={() => handleCardRemove(connection.id)} />
          ))}
        {activeTab === "passed" && activeItems.map((connection) => <PassedConnectionCard key={connection.id} connection={connection} />)}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/30">
          {toast}
        </div>
      )}
    </div>
  );
}

function PendingConnectionCard({ connection }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <Header connection={connection} />
      <p className="mt-2 text-sm leading-6 text-slate-300">Compatibility: {connection.seekerCompatibility}%</p>
      <TagRow lifestyle={connection.seekerLifestyle} />
      <p className="mt-3 text-xs text-slate-500">Sent {getTimeAgo(connection.createdAt)}</p>
    </div>
  );
}

function MatchedConnectionCard({ connection, onRemove }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <Header connection={connection} />
      <p className="mt-2 text-sm font-semibold leading-6 text-emerald-300">Mutual match - {connection.seekerCompatibility}% compatibility</p>
      <TagRow lifestyle={connection.seekerLifestyle} />

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

function PassedConnectionCard({ connection }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <Header connection={connection} />
      <p className="mt-2 text-sm leading-6 text-slate-400">This profile was marked as not suitable.</p>
      {connection.seekerInterests?.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">Interests: {connection.seekerInterests.slice(0, 2).join(", ")}</p>
      )}
    </div>
  );
}

function Header({ connection }) {
  const initials = String(connection.ownerName || "?")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-sm font-bold text-slate-200">
        {initials || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-white">{connection.ownerName}</h4>
        <p className="truncate text-xs text-slate-400">{connection.propertyName}</p>
      </div>
    </div>
  );
}

function TagRow({ lifestyle }) {
  if (!lifestyle) return null;

  const tags = [
    lifestyle.sleep ? `Sleep: ${formatLabel(lifestyle.sleep)}` : null,
    lifestyle.food ? `Food: ${formatLabel(lifestyle.food)}` : null,
    lifestyle.cleanliness ? `Cleanliness: ${formatLabel(lifestyle.cleanliness)}` : null,
    lifestyle.budget ? `Budget: INR ${Number(lifestyle.budget).toLocaleString("en-IN")}` : null,
  ].filter(Boolean);

  if (tags.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.slice(0, 3).map((tag) => (
        <span key={tag} className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
          {tag}
        </span>
      ))}
    </div>
  );
}

function formatLabel(text) {
  return String(text)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTimeAgo(timestamp) {
  if (!timestamp) return "Recently";

  const now = new Date();
  const created = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp.seconds * 1000);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
