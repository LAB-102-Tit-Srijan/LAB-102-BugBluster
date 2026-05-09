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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            Habiwise
          </Link>

          <div className="flex gap-6 items-center">
            {currentUser ? (
              <>
                <Link to="/listings" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Listings
                </Link>
                <Link to="/roommate-match" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Roommates
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <span className="text-gray-700">{currentUser.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">
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
