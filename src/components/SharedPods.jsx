import { useEffect, useRef, useState } from "react";

const pods = [
  { id: "prod", name: "Productivity Pod", icon: "PD", desc: "Coders, founders, designers", members: 124 },
  { id: "fit", name: "Fitness Pod", icon: "FT", desc: "Gym users, runners", members: 87 },
  { id: "study", name: "Study Pod", icon: "ST", desc: "CAT, UPSC, placements", members: 56 },
  { id: "creative", name: "Creative Pod", icon: "CR", desc: "Musicians, creators, editors", members: 203 },
];

export default function SharedPods({ heading, compact = false }) {
  const containerRef = useRef(null);
  const [joined, setJoined] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("habiwise_joined_pods") || "{}");
    } catch {
      return {};
    }
  });

  const [toast, setToast] = useState(null);

  const isJoined = (id) => !!joined[id];

  const toggleJoin = (id) => {
    setJoined((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("habiwise_joined_pods", JSON.stringify(next));
      } catch {
      }
      return next;
    });
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pod-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    element.querySelectorAll(".pod-card").forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={compact ? "" : "mt-6"}>
      {heading && <h3 className="mb-4 text-lg font-bold leading-none text-white">{heading}</h3>}

      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {pods.map((pod, index) => {
          const joinedState = isJoined(pod.id);
          const displayMembers = pod.members + (joinedState ? 1 : 0);

          return (
            <div
              key={pod.id}
              className="pod-card rounded-xl border border-slate-800 bg-slate-900/70 p-4 opacity-0 translate-y-2 transition-all duration-300 hover:border-slate-700"
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-xs font-bold text-slate-200">
                  {pod.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-5 text-white">{pod.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{pod.desc}</p>
                  <p className="mt-2 text-xs text-slate-500">{displayMembers} members</p>
                </div>
                <button
                  onClick={() => {
                    toggleJoin(pod.id);
                    showToast(joinedState ? `Left ${pod.name}` : `Joined ${pod.name}`);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    joinedState
                      ? "border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
                  }`}
                >
                  {joinedState ? "Joined" : "Join"}
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
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-black/30">
          {toast}
        </div>
      )}
    </div>
  );
}
