import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { properties } from "../data/properties";
import { useAuth } from "../context/AuthContext";
import { calculateTrustScore, getTrustTier } from "../utils/trustScore";
import { calculateBookingFee, calculateDepositFee } from "../utils/feeCalculator";

const AmenityIcons = {
  WiFi: "📶",
  AC: "❄️",
  Food: "🍽️",
  Parking: "🅿️",
  Laundry: "🧺",
  Gym: "💪",
  Cafe: "☕",
  "Common Area": "👥",
  "Study Room": "📚",
  Terrace: "🌳",
  "Sports": "⚽",
  Balcony: "🏠",
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const property = properties.find((p) => p.id === parseInt(id));
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);

  const trustScore = currentUser?.trustScore ?? calculateTrustScore(currentUser || {});
  const trustTier = getTrustTier(trustScore);
  const bookingFee = calculateBookingFee(property.rent);
  const depositFee = calculateDepositFee(property.securityDeposit);
  const eliteDiscountAmount = trustTier.key === "elite" ? Math.round(bookingFee.platformFee * 0.2) : 0;
  const totalPayable = bookingFee.rent + bookingFee.platformFee - eliteDiscountAmount + depositFee.handlingFee;
  const traditionalBrokerLow = property.rent;
  const traditionalBrokerHigh = property.securityDeposit;
  const estimatedSavings = Math.max(traditionalBrokerHigh - totalPayable, 0);

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-slate-400">Property not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header with Save Button */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{property.title}</h1>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                isSaved
                  ? "bg-amber-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {isSaved ? "💛 Saved" : "🤍 Save Property"}
            </button>
          </div>

          {/* Image Gallery */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <img
                src={property.images[mainImageIdx]}
                alt="Main"
                className="w-full h-96 object-cover rounded-2xl border border-slate-700 shadow-2xl shadow-black/40"
              />
            </div>
            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible">
              {property.images.slice(1).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImageIdx(idx + 1)}
                  className={`flex-shrink-0 h-24 w-24 rounded-lg border-2 overflow-hidden transition ${
                    mainImageIdx === idx + 1
                      ? "border-amber-400"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info & AI Badges Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left: Property Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">LOCATION</p>
                    <p className="text-white text-lg font-semibold">{property.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">PROPERTY TYPE</p>
                    <p className="text-white text-lg font-semibold">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">MONTHLY RENT</p>
                    <p className="text-amber-400 text-2xl font-black">₹{property.rent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">SECURITY DEPOSIT</p>
                    <p className="text-white text-lg font-semibold">₹{property.securityDeposit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">OCCUPANCY</p>
                    <p className="text-white text-lg font-semibold">{property.occupancy}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">GENDER</p>
                    <p className="text-white text-lg font-semibold">{property.gender}</p>
                  </div>
                </div>
              </div>

              {/* AI Smart Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Safety Score */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center">
                  <p className="text-emerald-400 text-3xl mb-2">🛡</p>
                  <p className="text-slate-300 text-sm">Safety Score</p>
                  <p className="text-emerald-400 text-2xl font-black">{property.safetyScore}/10</p>
                </div>

                {/* Scam Risk */}
                <div
                  className={`rounded-xl border p-4 text-center ${
                    property.scamRisk === "Low"
                      ? "border-emerald-500/30 bg-emerald-950/40"
                      : property.scamRisk === "Medium"
                      ? "border-amber-500/30 bg-amber-950/40"
                      : "border-red-500/30 bg-red-950/40"
                  }`}
                >
                  <p className="text-2xl mb-2">🚨</p>
                  <p className="text-slate-300 text-sm">Scam Risk</p>
                  <p
                    className={`text-xl font-black ${
                      property.scamRisk === "Low"
                        ? "text-emerald-400"
                        : property.scamRisk === "Medium"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {property.scamRisk}
                  </p>
                </div>

                {/* Commute Score */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-4 text-center">
                  <p className="text-indigo-400 text-3xl mb-2">🚗</p>
                  <p className="text-slate-300 text-sm">Commute Score</p>
                  <p className="text-indigo-400 text-sm font-semibold">{property.commuteHours}</p>
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <h3 className="text-xl font-black text-white mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-center hover:border-amber-400 transition"
                    >
                      <p className="text-2xl mb-1">{AmenityIcons[amenity] || "✓"}</p>
                      <p className="text-slate-300 text-sm font-medium">{amenity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Types */}
              <div>
                <h3 className="text-xl font-black text-white mb-4">Room Types & Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.roomTypes.map((room, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 hover:border-indigo-500 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold">{room.type}</p>
                        <p className="text-amber-400 font-black">₹{room.price.toLocaleString()}</p>
                      </div>
                      <p className="text-slate-400 text-xs">
                        {room.bedCount} {room.bedCount === 1 ? "bed" : "beds"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Essentials */}
              <div>
                <h3 className="text-xl font-black text-white mb-4">Nearby Essentials</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {property.nearby.map((place, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-center"
                    >
                      <p className="text-3xl mb-2">{place.icon}</p>
                      <p className="text-slate-300 text-sm font-medium line-clamp-2">{place.name}</p>
                      <p className="text-amber-400 text-xs font-semibold">{place.distance}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

              {/* Booking Summary */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-500/25 bg-[#0D1117] p-6 shadow-xl shadow-black/30">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Booking Summary</p>
                    <h3 className="mt-2 text-2xl font-black text-white">💳 Booking Summary</h3>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                    No Broker Fee. Ever.
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Monthly Rent</span>
                    <span className="font-semibold text-white">₹{bookingFee.rent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Security Deposit</span>
                    <span className="font-semibold text-white">₹{property.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Platform Fee (5%)</span>
                    <span className="font-semibold text-amber-300">₹{bookingFee.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Deposit Handling (3%)</span>
                    <span className="font-semibold text-amber-300">₹{depositFee.handlingFee.toLocaleString()}</span>
                  </div>
                  {trustTier.key === "elite" ? (
                    <>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Elite Discount (20%)</span>
                        <span className="font-semibold text-emerald-300">-₹{eliteDiscountAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-amber-200">
                        <span className="font-semibold">You Pay</span>
                        <span className="font-black">₹{totalPayable.toLocaleString()}</span>
                      </div>
                      <p className="text-xs font-semibold text-amber-300">🥇 Elite Member Benefit</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                      <span className="font-semibold">First Month Total</span>
                      <span className="font-black">₹{totalPayable.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-amber-200">🏷 No Broker Fee. Ever.</p>
                  <p className="mt-2 text-slate-400">
                    Traditional broker: ₹{traditionalBrokerLow.toLocaleString()} - ₹{traditionalBrokerHigh.toLocaleString()}
                  </p>
                  <p className="mt-2 font-semibold text-emerald-300">You save: ₹{estimatedSavings.toLocaleString()} 💚</p>
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/roommate-match")}
                    className="rounded-xl border border-amber-500/30 bg-transparent px-4 py-3 font-black text-amber-300 transition hover:bg-amber-500/10"
                  >
                    📅 Book Visit - Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReserveModal(true)}
                    className="rounded-xl bg-amber-500 px-4 py-3 font-black text-black transition hover:bg-amber-400"
                  >
                    🔒 Reserve Room - ₹{totalPayable.toLocaleString()}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>Higher Trust Score = Lower fees</span>
                  <button type="button" onClick={() => navigate("/dashboard")} className="font-semibold text-amber-300 hover:text-amber-200">
                    View Your Score →
                  </button>
                </div>
              </div>

              {/* Owner Card */}
              <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 flex items-center justify-center">
                    <p className="text-2xl">👤</p>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{property.ownerName}</h3>
                  <div className="flex justify-center mb-3">
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40">
                      ✓ AI Verified Owner
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition">
                    📞 Contact Owner
                  </button>
                  <p className="text-slate-400 text-xs text-center">{property.ownerPhone}</p>
                </div>
              </div>

              {/* Find Roommate CTA */}
              <button
                onClick={() => navigate("/roommate-match")}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black py-3 rounded-lg transition transform hover:scale-105"
              >
                🤝 Find Compatible Roommate
              </button>

              {/* Info Box */}
              <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
                <p className="text-slate-400 text-xs leading-relaxed">
                  All properties on HabiWise are verified by AI. Contact owner for more details, site visits, or to book immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/25 bg-[#0D1117] p-6 text-slate-100 shadow-2xl shadow-black/40">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Success</p>
            <h3 className="mt-3 text-2xl font-black text-white">🎉 Room Reserved!</h3>
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
              <p>HabiWise Fee: ₹{bookingFee.platformFee.toLocaleString()}</p>
              <p className="mt-2">Booking confirmed - owner will contact you in 24hrs</p>
            </div>
            <button
              type="button"
              onClick={() => setShowReserveModal(false)}
              className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-black transition hover:bg-amber-400"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
