import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-br from-indigo-600 to-indigo-800">
        <div className="max-w-3xl text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to Habiwise</h1>
          <p className="text-xl mb-8">Find the perfect accommodation with smart matching for students and working professionals.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup" className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100">
              Get Started
            </Link>
            <Link to="/login" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
