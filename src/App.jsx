import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import RoommateMatchPage from "./pages/RoommateMatchPage";
import RoommateResultsPage from "./pages/RoommateResultsPage";
import ExpenseDashboard from "./pages/ExpenseDashboard";
import MaintenancePage from "./pages/MaintenancePage";
import SafetyPage from "./pages/SafetyPage";
import PostPropertyPage from "./pages/PostPropertyPage";
import { seedDemoData } from "./utils/seedData";

export default function App() {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    seedDemoData().catch((error) => {
      console.error("Unable to seed demo data:", error);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"></div></div>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/listings" element={<ProtectedRoute><ListingsPage /></ProtectedRoute>} />
      <Route path="/post-property" element={<ProtectedRoute><PostPropertyPage /></ProtectedRoute>} />
      <Route path="/property/:id" element={<ProtectedRoute><PropertyDetailPage /></ProtectedRoute>} />
      <Route path="/roommate-match" element={<ProtectedRoute><RoommateMatchPage /></ProtectedRoute>} />
      <Route path="/roommate-results" element={<ProtectedRoute><RoommateResultsPage /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><ExpenseDashboard /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
      <Route path="/safety" element={<ProtectedRoute><SafetyPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
