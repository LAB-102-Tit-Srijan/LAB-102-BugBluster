import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {currentUser?.displayName || currentUser?.email}</h2>
            <p className="text-gray-600">Manage your accommodations and roommate matching from here.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/listings" className="block text-indigo-600 hover:underline font-medium">
                ? Browse Listings
              </Link>
              <Link to="/roommate-match" className="block text-indigo-600 hover:underline font-medium">
                ? Find Roommates
              </Link>
              <Link to="/expenses" className="block text-indigo-600 hover:underline font-medium">
                ? Manage Expenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
