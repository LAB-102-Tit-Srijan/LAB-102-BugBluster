import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="border-b border-slate-800 bg-[#0b1220]/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="text-2xl font-black tracking-tight text-indigo-400">
            HabiWise
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {currentUser ? (
              <>
                <Link to="/listings" className="font-medium text-slate-300 hover:text-indigo-300">
                  Listings
                </Link>
                <Link to="/roommate-match" className="font-medium text-slate-300 hover:text-indigo-300">
                  Roommates
                </Link>
                <Link to="/dashboard" className="font-medium text-slate-300 hover:text-indigo-300">
                  Dashboard
                </Link>
                <span className="text-slate-400">{currentUser.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium text-slate-300 hover:text-indigo-300">
                  Login
                </Link>
                <Link to="/signup" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-800 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {currentUser ? (
                <>
                  <Link
                    to="/listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-indigo-300"
                  >
                    Listings
                  </Link>
                  <Link
                    to="/roommate-match"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-indigo-300"
                  >
                    Roommates
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-indigo-300"
                  >
                    Dashboard
                  </Link>
                  <span className="px-3 py-2 text-slate-400">{currentUser.email}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-indigo-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
