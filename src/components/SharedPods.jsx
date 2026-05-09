import { useEffect, useRef, useState } from "react";

const pods = [
  { id: "prod", name: "Productivity Pod", icon: "🖥", desc: "Coders, Startup founders, Designers", members: 124 },
  { id: "fit", name: "Fitness Pod", icon: "💪", desc: "Gym users, Runners", members: 87 },
  { id: "study", name: "Study Pod", icon: "📚", desc: "CAT, UPSC, Placements", members: 56 },
  { id: "creative", name: "Creative Pod", icon: "🎵", desc: "Musicians, Creators, Editors", members: 203 },
];

export default function SharedPods({ heading }) {
  const containerRef = useRef(null);
  const [joined, setJoined] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("habiwise_joined_pods") || "{}");
    } catch {
      return {};
    }
  });

  const isJoined = (id) => !!joined[id];

  function toggleJoin(id) {
    setJoined((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("habiwise_joined_pods", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  // transient toast message
  const [toast, setToast] = useState(null);
  function showToast(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pod-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    el.querySelectorAll(".pod-card").forEach((c) => observer.observe(c));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mt-6">
      {heading && <h3 className="mb-4 text-lg font-bold text-white">{heading}</h3>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pods.map((pod, idx) => {
          const joinedState = isJoined(pod.id);
          const displayMembers = pod.members + (joinedState ? 1 : 0);

          return (
            <div
              key={pod.id}
              className="pod-card rounded-2xl border border-slate-800 bg-gradient-to-br from-[#061426] to-[#071025] p-4 shadow-lg transform transition-all duration-300 opacity-0 translate-y-6 hover:scale-105 hover:border-amber-400"
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-black text-xl font-black shadow-md">
                  {pod.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{pod.name}</p>
                  <p className="text-sm text-slate-400">{pod.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">{displayMembers}</p>
                  <p className="text-xs text-slate-400">members</p>
                </div>
              </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      toggleJoin(pod.id);
                      showToast(joinedState ? `Left ${pod.name}` : `Joined ${pod.name}`);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-black shadow transition ${
                      joinedState
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400"
                    }`}
                  >
                    {joinedState ? "Joined" : "Join Pod"}
                  </button>
                </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .pod-in { opacity: 1 !important; transform: translateY(0) !important; }
        .pod-card { will-change: transform, opacity; }
      `}</style>

      {toast && (
        <div className="fixed right-6 bottom-6 z-50 rounded-lg bg-slate-800/90 border border-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
