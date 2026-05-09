import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-black tracking-tight text-indigo-400">
            Habiwise
          </Link>

          <div className="flex gap-6 items-center">
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
        </div>
      </div>
    </nav>
  );
}
