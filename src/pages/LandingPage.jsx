import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CitySelector from "../components/CitySelector";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const navigate = useNavigate();

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen scroll-smooth bg-[#0D1117] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#0b1220]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-black tracking-tight text-indigo-400">
            habiwise
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
              Testimonials
            </a>
          </nav>

          <Link
            to="/signup"
            className="hidden rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 md:inline-flex"
          >
            Get Started
          </Link>

          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-800 bg-[#0b1220] px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <a href="#features" onClick={handleMobileNavClick} className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
                Features
              </a>
              <a href="#how-it-works" onClick={handleMobileNavClick} className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
                How It Works
              </a>
              <a href="#testimonials" onClick={handleMobileNavClick} className="text-sm font-medium text-slate-300 transition hover:text-indigo-300">
                Testimonials
              </a>
              <Link
                to="/signup"
                onClick={handleMobileNavClick}
                className="mt-1 inline-flex w-fit rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0D1117] to-[#0D1117]">
          <div className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
            <p className="mb-4 rounded-full border border-indigo-500/30 bg-slate-900/80 px-4 py-1 text-sm font-medium text-indigo-300">
              Smart Housing for Students and Professionals
            </p>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Smart. Live Better.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
              Discover verified homes, match with compatible roommates, and manage living costs in one place.
            </p>

            <div className="mt-8 grid w-full max-w-2xl gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-lg shadow-black/20 sm:grid-cols-[1fr_auto]">
              <CitySelector value={selectedCity} onChange={setSelectedCity} />
              <button
                type="button"
                onClick={() => navigate("/listings", { state: { city: selectedCity } })}
                className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Search
              </button>
            </div>

            <div className="mt-6 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/listings" className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
                Find Accommodation
              </Link>
              <Link to="/roommate-match" className="rounded-lg border border-indigo-400 px-6 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/10">
                Find Roommate
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">Features</h2>
            <p className="mt-2 text-slate-400">Everything you need to find and manage your ideal shared living setup.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="text-lg font-semibold text-white">Verified Listings</h3>
              <p className="mt-2 text-sm text-slate-400">Browse reliable and quality-checked accommodations with transparent pricing and amenities.</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="text-lg font-semibold text-white">AI Roommate Matching</h3>
              <p className="mt-2 text-sm text-slate-400">Match with people based on budget, lifestyle, and preferences for smoother shared living.</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="text-lg font-semibold text-white">Expense Splitting</h3>
              <p className="mt-2 text-sm text-slate-400">Track shared payments and split rent and utility costs fairly with your flatmates.</p>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-28 bg-[#0b1220]">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white">How It Works</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
                <p className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">1</p>
                <h3 className="text-lg font-semibold text-white">Signup</h3>
                <p className="mt-2 text-sm text-slate-400">Create your profile and add your housing and lifestyle preferences.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
                <p className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">2</p>
                <h3 className="text-lg font-semibold text-white">Search and Match</h3>
                <p className="mt-2 text-sm text-slate-400">Explore listings and discover roommate matches aligned with your needs.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
                <p className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">3</p>
                <h3 className="text-lg font-semibold text-white">Move In</h3>
                <p className="mt-2 text-sm text-slate-400">Finalize your choice, connect with housemates, and settle in stress-free.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">Testimonials</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <blockquote className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <p className="text-slate-300">"I found a clean and affordable place near my campus in less than a week. The roommate match was surprisingly accurate."</p>
              <footer className="mt-4 text-sm font-semibold text-indigo-300">Aarav, Engineering Student</footer>
            </blockquote>
            <blockquote className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <p className="text-slate-300">"Habiwise made moving to a new city easy. I got verified options and a friendly flatmate with similar habits."</p>
              <footer className="mt-4 text-sm font-semibold text-indigo-300">Neha, MBA Student</footer>
            </blockquote>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-[#0b1220]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>Copyright 2026 habiwise. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-indigo-300">Privacy</a>
            <a href="#" className="transition hover:text-indigo-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
