import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import MatchCard from "../components/MatchCard";
import SharedPods from "../components/SharedPods";
import { useAuth } from "../context/AuthContext";
import { candidates } from "../data/candidates";
import { properties } from "../data/properties";

const sidebarLinks = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "🔍", label: "Search", href: "/listings" },
  { icon: "🧬", label: "Roommate Match", href: "/roommate-match" },
  { icon: "💸", label: "Expenses", href: "/expenses" },
  { icon: "🛠", label: "Maintenance", href: "/maintenance" },
  { icon: "🛡", label: "Safety", href: "/maintenance" },
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
          </div>
        </main>
      </div>
    </div>
  );
}
