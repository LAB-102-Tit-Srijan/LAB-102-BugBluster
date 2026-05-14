import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { isFirebaseConfigured } from "../firebase/config";
import PropertyCard from "../components/PropertyCard";
import MatchCard from "../components/MatchCard";
import SharedPods from "../components/SharedPods";
import MyConnections from "../components/MyConnections";
import MyMatches from "../components/MyMatches";
import ChatList from "../components/ChatList";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { calculateTrustScore, getTrustImprovementItems, getTrustTier } from "../utils/trustScore";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Search", href: "/listings" },
  { label: "Roommate Match", href: "/roommate-match" },
  { label: "Expenses", href: "/expenses" },
  { label: "Maintenance", href: "/maintenance" },
  { label: "Safety", href: "/safety" },
];

const quickActions = [
  { label: "Search Properties", href: "/listings", hint: "Browse available homes" },
  { label: "Roommate Match", href: "/roommate-match", hint: "Find compatible flatmates" },
  { label: "Expense Dashboard", href: "/expenses", hint: "Track shared expenses" },
  { label: "Maintenance", href: "/maintenance", hint: "Raise and track requests" },
];

const studentColleges = [
  { name: "St. Xavier's College", city: "Mumbai", distance: "1.2 km" },
  { name: "Presidency University", city: "Bangalore", distance: "2.8 km" },
  { name: "Delhi University", city: "Delhi", distance: "3.1 km" },
];

const professionalStays = [
  { name: "Indiranagar Business Hub", city: "Bangalore", commute: "12 min" },
  { name: "Bandra West Corporate Stay", city: "Mumbai", commute: "18 min" },
  { name: "Connaught Place Residence", city: "Delhi", commute: "15 min" },
];

const statCards = [
  { label: "Saved Properties", value: "12" },
  { label: "Roommate Matches", value: "08" },
  { label: "Pending Expenses", value: "04" },
  { label: "Open Complaints", value: "02" },
];

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTrustHelp, setShowTrustHelp] = useState(false);
  const [toast, setToast] = useState("");
  const [impactProgress, setImpactProgress] = useState(0);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [roommateMatches, setRoommateMatches] = useState([]);

  const localProfile = useMemo(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const savedUsers = JSON.parse(localStorage.getItem("habiwise_demo_users") || "[]");
      return savedUsers.find((user) => user.email === currentUser?.email) || {};
    } catch {
      return {};
    }
  }, [currentUser?.email]);

  const userName = currentUser?.displayName || localProfile.name || currentUser?.email?.split("@")[0] || "User";
  const normalizedRole = (currentUser?.role || localProfile.role || "Student").toLowerCase();
  const isProfessional = normalizedRole.includes("professional");
  const roleLabel = isProfessional ? "Professional Worker" : "Student";
  const trustSource = { ...localProfile, ...currentUser };
  const trustScore = currentUser?.trustScore ?? calculateTrustScore(trustSource);
  const trustTier = getTrustTier(trustScore);
  const trustItems = getTrustImprovementItems(trustSource);
  const verifiedElite = trustTier.key === "elite";
  const lifestyleProfile = trustSource?.lifestyleProfile;
  const hasLifestyleProfile = Boolean(lifestyleProfile?.isProfileSaved);
  const lifestyleTags = [
    lifestyleProfile?.sleepSchedule ? `Sleep: ${String(lifestyleProfile.sleepSchedule).replace(/_/g, " ")}` : null,
    lifestyleProfile?.foodPreference ? `Food: ${String(lifestyleProfile.foodPreference).replace(/_/g, " ")}` : null,
    lifestyleProfile?.cleanliness ? `Cleanliness: ${String(lifestyleProfile.cleanliness).replace(/_/g, " ")}` : null,
    lifestyleProfile?.socialHabits ? `Social: ${String(lifestyleProfile.socialHabits).replace(/_/g, " ")}` : null,
    lifestyleProfile?.budget ? `Budget: INR ${Number(lifestyleProfile.budget).toLocaleString("en-IN")}` : null,
    lifestyleProfile?.examPrep ? `Focus: ${String(lifestyleProfile.examPrep).replace(/_/g, " ")}` : null,
  ].filter(Boolean);

  useEffect(() => {
    const startTime = performance.now();
    let animationFrameId = 0;

    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      const nextProgress = Math.min(elapsed / 1500, 1);
      setImpactProgress(nextProgress);

      if (nextProgress < 1) {
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isFirebaseConfigured || !db) {
        setRecommendedProperties([]);
        setRoommateMatches([]);
        return;
      }

      try {
        const [propertiesSnapshot, candidatesSnapshot] = await Promise.all([
          getDocs(query(collection(db, "properties"), limit(3))),
          getDocs(query(collection(db, "roommate_preferences"), limit(2))),
        ]);

        setRecommendedProperties(propertiesSnapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
        setRoommateMatches(candidatesSnapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setRecommendedProperties([]);
        setRoommateMatches([]);
      }
    };

    loadDashboardData();
  }, []);

  const impactStats = [
    { label: "Brokerage saved", target: 24000000, format: (value) => `INR ${(value / 10000000).toFixed(1)}Cr` },
    { label: "Happy users", target: 12400, format: (value) => `${value.toLocaleString("en-IN")}+` },
    { label: "Platform fee this month", target: 184000, format: (value) => `INR ${value.toLocaleString("en-IN")}` },
  ];

  const flashToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const roleSectionItems = isProfessional ? professionalStays : studentColleges;
  const roleHeroTitle = isProfessional ? "Office-first housing and roommate matching" : "Campus-first housing and roommate matching";
  const roleHeroDescription = isProfessional
    ? "Browse commute-friendly stays, match with working flatmates, and post spaces for professionals who want the same routine."
    : "Browse student-friendly stays, find roommates by college and exam goals, and post spaces that fit campus life.";
  const roleHighlights = isProfessional
    ? [
        { label: "Best for", value: "Commute + WFH" },
        { label: "Find roommates", value: "By office area" },
        { label: "Post listings", value: "Professional Worker" },
      ]
    : [
        { label: "Best for", value: "College + exam prep" },
        { label: "Find roommates", value: "By college / branch" },
        { label: "Post listings", value: "Student / Both" },
      ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-800 bg-[#0B1220] px-5 py-6 transition-transform duration-300 lg:sticky lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="mb-8 flex items-center justify-between lg:block">
            <Link to="/dashboard" className="text-2xl font-black tracking-tight text-indigo-300">
              habiwise
            </Link>
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          </div>

          <nav className="space-y-1.5">
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-white">{userName}</p>
            <p className="text-sm text-slate-400">{currentUser?.email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="border-b border-slate-800 bg-[#0D1117]/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 lg:hidden"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? "Close" : "Menu"}
              </button>

              <div className="ml-auto flex items-center gap-3">
                <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm font-semibold text-slate-200">
                  {roleLabel}
                </div>
                <div className="hidden text-sm text-slate-400 sm:block">{currentUser?.email}</div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace overview</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">Welcome back, {userName}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{roleHeroDescription}</p>
                </div>
                <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[360px]">
                  {quickActions.slice(0, 2).map((action) => (
                    <Link
                      key={action.label}
                      to={action.href}
                      className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3.5 transition hover:border-slate-600 hover:bg-slate-900"
                    >
                      <p className="text-sm font-semibold leading-5 text-slate-100">{action.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{action.hint}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {roleHighlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">{roleLabel}</p>
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{roleHeroTitle}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">You can keep the same dashboard, but the roommate and property suggestions will skew to your account type.</p>
                  </div>
                  <Link
                    to="/roommate-match"
                    className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                  >
                    Find Roommates
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                {statCards.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4.5">
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-[1.7rem] font-black leading-none text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 xl:col-span-2 sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Trust status</p>
                    <h2 className="mt-1 text-2xl font-black text-white sm:text-[1.75rem]">Trust Score: {trustScore}/100</h2>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${trustTier.badgeClass}`}>
                    {trustTier.icon} {trustTier.label}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full border border-slate-700 bg-slate-800/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{trustTier.benefit}</p>
                {verifiedElite && <p className="mt-1 text-sm font-semibold text-amber-200">Verified Elite status active.</p>}

                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Suggested improvements</p>
                    <button
                      type="button"
                      onClick={() => setShowTrustHelp((prev) => !prev)}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-slate-600"
                    >
                      {showTrustHelp ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className={`mt-3 space-y-2 overflow-hidden transition-all duration-300 ${showTrustHelp ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"}`}>
                    {trustItems.length > 0 ? (
                      trustItems.map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
                          <p className="text-sm leading-5 text-slate-200">{item.label}</p>
                          <button
                            type="button"
                            onClick={() => flashToast(`${item.action} started for ${item.label}`)}
                            className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20"
                          >
                            {item.action}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                        All trust actions are complete.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Platform impact</p>
                  <h2 className="mt-1 text-2xl font-black text-white sm:text-[1.75rem]">Monthly metrics</h2>
                </div>

                {isFirebaseConfigured ? (
                  <div className="mt-4 space-y-3">
                    {impactStats.map((stat) => {
                      const value = Math.round(stat.target * impactProgress);
                      return (
                        <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">{stat.label}</p>
                          <p className="mt-2 text-[1.65rem] font-black leading-tight text-white">{stat.format(value)}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                    Connect Firebase to enable live impact metrics.
                  </div>
                )}
              </div>
            </section>

            <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <ChatList />

                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-none text-white">Recommended Properties</h2>
                    <Link to="/listings" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                      View all
                    </Link>
                  </div>
                  {recommendedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                      {recommendedProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} theme="dark" />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                      No recommendations yet. Add listings to start seeing suggestions.
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-none text-white">Roommate Matches</h2>
                    <Link to="/roommate-match" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                      Explore
                    </Link>
                  </div>
                  {roommateMatches.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {roommateMatches.map((candidate, index) => (
                        <MatchCard key={candidate.id} candidate={candidate} matchScore={86 - index * 8} theme="dark" />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                      No roommate matches yet. Complete your profile to improve recommendations.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                  <h2 className="text-lg font-bold leading-none text-white">Quick Actions</h2>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        to={action.href}
                        className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3.5 transition hover:border-slate-600 hover:bg-slate-900"
                      >
                        <p className="text-sm font-semibold leading-5 text-slate-100">{action.label}</p>
                        <p className="mt-1 text-xs text-slate-400">{action.hint}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                  <h2 className="text-lg font-bold leading-none text-white">Shared Pods</h2>
                  <div className="mt-4">
                    <SharedPods compact />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                  <h2 className="text-lg font-bold leading-none text-white">Lifestyle Profile</h2>
                  {hasLifestyleProfile ? (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {lifestyleTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        to="/roommate-match?editLifestyle=1"
                        className="mt-4 inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                      >
                        Edit Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        Add your preferences to get better roommate recommendations.
                      </p>
                      <Link
                        to="/roommate-match"
                        className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                      >
                        Complete Profile
                      </Link>
                    </>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
                  <h2 className="text-lg font-bold leading-none text-white">{isProfessional ? "Office-nearby stays" : "Nearby colleges"}</h2>
                  <div className="mt-4 space-y-3">
                    {roleSectionItems.map((item) => (
                      <div key={item.name} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">
                          {isProfessional ? `${item.city} - Commute ${item.commute}` : `${item.city} - ${item.distance}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {!isProfessional && (
              <section className="mt-8">
                <MyConnections />
              </section>
            )}

            {isProfessional && (
              <section className="mt-8">
                <MyMatches />
              </section>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/30">
          {toast}
        </div>
      )}
    </div>
  );
}

