import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isFirebaseConfigured } from "../firebase/config";
import PropertyCard from "../components/PropertyCard";
import MatchCard from "../components/MatchCard";
import SharedPods from "../components/SharedPods";
import MyConnections from "../components/MyConnections";
import MyMatches from "../components/MyMatches";
import { useAuth } from "../context/AuthContext";
import { candidates } from "../data/candidates";
import { properties } from "../data/properties";
import { calculateTrustScore, getTrustImprovementItems, getTrustTier } from "../utils/trustScore";

const sidebarLinks = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "🔍", label: "Search", href: "/listings" },
  { icon: "🧬", label: "Roommate Match", href: "/roommate-match" },
  { icon: "💸", label: "Expenses", href: "/expenses" },
  { icon: "🛠", label: "Maintenance", href: "/maintenance" },
  { icon: "🛡", label: "Safety", href: "/safety" },
];

const quickActions = [
  { label: "Search Property", href: "/listings" },
  { label: "Find Roommate", href: "/roommate-match" },
  { label: "Add Expense", href: "/expenses" },
  { label: "Raise Complaint", href: "/maintenance" },
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
  const roleLabel = normalizedRole.includes("professional") ? "Professional" : "Student";
  const isProfessional = roleLabel === "Professional";
  const trustSource = { ...localProfile, ...currentUser };
  const trustScore = currentUser?.trustScore ?? calculateTrustScore(trustSource);
  const trustTier = getTrustTier(trustScore);
  const trustItems = getTrustImprovementItems(trustSource);
  const verifiedElite = trustTier.key === "elite";
  const lifestyleProfile = trustSource?.lifestyleProfile;
  const hasLifestyleProfile = Boolean(lifestyleProfile?.isProfileSaved);
  const lifestyleTags = [
    lifestyleProfile?.sleepSchedule ? `🌙 ${String(lifestyleProfile.sleepSchedule).replace(/_/g, " ")}` : null,
    lifestyleProfile?.foodPreference ? `🥗 ${String(lifestyleProfile.foodPreference).replace(/_/g, " ")}` : null,
    lifestyleProfile?.cleanliness ? `🧹 ${String(lifestyleProfile.cleanliness).replace(/_/g, " ")}` : null,
    lifestyleProfile?.socialHabits ? `🤫 ${String(lifestyleProfile.socialHabits).replace(/_/g, " ")}` : null,
    lifestyleProfile?.budget ? `💰 ₹${Number(lifestyleProfile.budget).toLocaleString("en-IN")}` : null,
    lifestyleProfile?.examPrep ? `📚 ${String(lifestyleProfile.examPrep).replace(/_/g, " ")}` : null,
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

  const impactStats = [
    { label: "Brokerage saved", target: 24000000, format: (value) => `₹${(value / 10000000).toFixed(1)}Cr` },
    { label: "Happy users", target: 12400, format: (value) => `${value.toLocaleString("en-IN")}+` },
    { label: "Platform fee this month", target: 184000, format: (value) => `₹${value.toLocaleString("en-IN")}` },
  ];

  const flashToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const recommendedProperties = properties.slice(0, 3);
  const roommateMatches = candidates.slice(0, 2);
  const roleSectionItems = isProfessional ? professionalStays : studentColleges;

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
            <Link to="/dashboard" className="text-2xl font-black tracking-tight text-indigo-400">
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

          <nav className="space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</p>
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

        <main className="flex-1 lg:ml-0">
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
                <div className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
                  {roleLabel}
                </div>
                <div className="hidden text-sm text-slate-400 sm:block">Hello, {userName} 👋</div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <section className="rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-950 via-[#0D1117] to-slate-900 p-6 shadow-2xl shadow-black/30 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overview</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Hello, {userName} 👋
                  </h1>
                </div>
                <div className="inline-flex w-fit rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
                  {roleLabel}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/20"
                  >
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-4 text-3xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quickActions.concat([{ label: 'Safety SOS', href: '/safety' }]).map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{action.label}</p>
                        <p className="text-xs text-slate-400 mt-1">Go to {action.label}</p>
                      </div>
                      {action.label === 'Safety SOS' ? (
                        <div className="rounded-full bg-red-600 px-3 py-2 text-white font-bold">🚨</div>
                      ) : (
                        <div className="rounded-full bg-amber-500 px-3 py-2 text-black font-semibold">→</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {isFirebaseConfigured ? (
              <section className="mt-6 rounded-[28px] border border-amber-500/20 bg-gradient-to-r from-[#0B1220] via-[#0D1117] to-[#121A2A] p-5 shadow-2xl shadow-black/25 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">HabiWise Impact</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Platform value in motion</h2>
                  </div>
                  <div className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                    Live ticker
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {impactStats.map((stat) => {
                    const value = Math.round(stat.target * impactProgress);
                    return (
                      <div key={stat.label} className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">
                        <p className="text-sm text-slate-400">{stat.label}</p>
                        <p className="mt-4 text-3xl font-black text-amber-300">{stat.format(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="mt-6 rounded-[28px] border border-slate-800 bg-gradient-to-br from-[#0B1220] via-[#0D1117] to-slate-900 p-5 shadow-2xl shadow-black/30 sm:p-6">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">HabiWise Impact</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Platform value (demo)</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-400">
                    <p className="text-sm">Brokerage saved</p>
                    <p className="mt-3 text-sm">Tip: Add a property under Listings to start tracking savings.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-400">
                    <p className="text-sm">Happy users</p>
                    <p className="mt-3 text-sm">Tip: Invite friends to HabiWise to build your roommate network.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-400">
                    <p className="text-sm">Platform fee this month</p>
                    <p className="mt-3 text-sm">Tip: Enable mock payments to preview fee flows (dev only).</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">Connect a Firebase project to enable live stats. These tips help beginners get started.</p>
              </section>
            )}

            <section className="mt-6 rounded-[28px] border border-slate-800 bg-gradient-to-br from-[#0B1220] via-[#0D1117] to-slate-900 p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400/60 bg-slate-950 text-2xl font-black text-white shadow-lg shadow-black/30 sm:h-28 sm:w-28 sm:text-3xl">
                    {trustScore}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Trust Score</p>
                      <h2 className="mt-1 text-2xl font-black text-white">Your Trust Score</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${trustTier.badgeClass}`}>
                        {trustTier.icon} {trustTier.label}
                      </span>
                      {verifiedElite && (
                        <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-200">
                          HabiWise Verified Elite
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{trustTier.benefit}</p>
                  </div>
                </div>

                <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                    <span>Progress to 100</span>
                    <span className="font-semibold text-amber-300">{trustScore}/100</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-slate-700 bg-slate-800/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
                      style={{ width: `${trustScore}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                    <span>Basic</span>
                    <span>Trusted</span>
                    <span>Elite</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Verification Checklist</p>
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      { label: "Email Verified", done: !!trustSource.emailVerified, action: null, points: null },
                      { label: "Profile Complete", done: !!trustSource.profileComplete, action: null, points: null },
                      { label: "Aadhaar Upload", done: !!trustSource.aadhaarUploaded, action: "Upload", points: "+20 pts" },
                      { label: "College/Work ID", done: !!trustSource.idUploaded, action: "Upload", points: "+15 pts" },
                      { label: "Roommate Review", done: Number(trustSource.roommateReviews) > 0, action: "Request", points: "+20 pts" },
                      { label: "Rent History", done: !!trustSource.rentPaidOnTime, action: "Add", points: "+15 pts" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 transition-all duration-300 ease-out hover:border-slate-700"
                      >
                        <div className="min-w-0">
                          <p className={item.done ? "text-slate-100" : "text-slate-200"}>
                            {item.done ? "✅" : "⬜"} {item.label}
                          </p>
                          {!item.done && item.points && <p className="text-xs text-slate-400">{item.points}</p>}
                        </div>

                        {item.done ? (
                          <span className="text-xs font-semibold text-emerald-300">Done</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => flashToast(`${item.action} requested for ${item.label}`)}
                            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20"
                          >
                            {item.action} →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">How to improve</p>
                    <button
                      type="button"
                      onClick={() => setShowTrustHelp((prev) => !prev)}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-amber-500/40 hover:text-amber-200"
                    >
                      {showTrustHelp ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className={`mt-4 space-y-3 overflow-hidden transition-all duration-300 ease-out ${showTrustHelp ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                    {trustItems.length > 0 ? (
                      trustItems.map((item) => (
                        <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="text-xs text-slate-400">Complete this to raise your score.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => flashToast(`${item.action} started for ${item.label}`)}
                            className="rounded-full bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/25"
                          >
                            {item.action} →
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                        All trust actions are complete. Keep it up.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:col-span-2 xl:col-span-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tier Benefits</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <p className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">Basic: Build up your profile to unlock deposit savings.</p>
                    <p className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">Trusted: 50% deposit waiver on eligible listings.</p>
                    <p className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">Elite: Zero deposit properties with top trust status.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Recommended Properties</h2>
                    <Link to="/listings" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                      View all
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {recommendedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} theme="dark" />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Roommate Matches</h2>
                    <Link to="/roommate-match" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                      Explore
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {roommateMatches.map((candidate, index) => (
                      <MatchCard key={candidate.id} candidate={candidate} matchScore={86 - index * 8} theme="dark" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/20">
                  <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        to={action.href}
                        className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-indigo-500/50 hover:bg-slate-800"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/20">
                  <h2 className="text-xl font-bold text-white">Find Your Community</h2>
                  <div className="mt-4">
                    <SharedPods />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/20">
                  <h2 className="text-xl font-bold text-white">Lifestyle Profile</h2>
                  {hasLifestyleProfile ? (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {lifestyleTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        to="/roommate-match?editLifestyle=1"
                        className="mt-4 inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
                      >
                        ✏️ Edit Lifestyle
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-sm text-slate-300">
                        Complete your lifestyle profile to get better matches.
                      </p>
                      <Link
                        to="/roommate-match"
                        className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                      >
                        Fill Now →
                      </Link>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/20">
                  <h2 className="text-xl font-bold text-white">
                    {isProfessional ? "Office-nearby Stays" : "Nearby Colleges"}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {roleSectionItems.map((item) => (
                      <div key={item.name} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">
                          {isProfessional ? `${item.city} · Commute ${item.commute}` : `${item.city} · ${item.distance}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* My Connections for Seekers */}
            {!isProfessional && (
              <section className="mt-8">
                <MyConnections />
              </section>
            )}

            {/* My Matches for Owners */}
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
