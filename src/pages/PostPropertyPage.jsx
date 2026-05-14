import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";
import CitySelector from "../components/CitySelector";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../firebase/config";

const amenityOptions = ["WiFi", "AC", "Food", "Parking", "Laundry", "Gym", "Power Backup"];

const initialForm = {
  title: "",
  type: "PG",
  city: "Indore",
  area: "",
  rent: "",
  securityDeposit: "",
  amenities: [],
  gender: "Any",
  targetAudience: "Both",
  availableFrom: "",
  description: "",
  shortTermFriendly: false,
};

const toggleValue = (arr, value) =>
  arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];

export default function PostPropertyPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const normalizedRole = String(currentUser?.role || "Student").toLowerCase();
  const defaultAudience = normalizedRole.includes("professional") ? "Professional" : "Student";

  useEffect(() => {
    setForm((current) => {
      if (current.targetAudience !== "Both") {
        return current;
      }

      return { ...current, targetAudience: defaultAudience };
    });
  }, [defaultAudience]);

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Property name is required.";
    if (!form.area.trim()) nextErrors.area = "Area or locality is required.";
    if (!form.rent || Number(form.rent) <= 0) nextErrors.rent = "Enter a valid monthly rent.";
    if (!form.securityDeposit || Number(form.securityDeposit) < 0) {
      nextErrors.securityDeposit = "Enter a valid security deposit.";
    }
    if (!form.availableFrom) nextErrors.availableFrom = "Please select availability date.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (form.amenities.length === 0) nextErrors.amenities = "Select at least one amenity.";

    return nextErrors;
  };

  const flashToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm();
    setFieldErrors(nextErrors);

    if (!currentUser?.uid) {
      setError("Please login to post a property.");
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const propertyData = {
        id: Date.now().toString(),
        title: form.title.trim(),
        type: form.type,
        city: form.city,
        area: form.area.trim(),
        location: `${form.area.trim()}, ${form.city}`,
        rent: Number(form.rent),
        securityDeposit: Number(form.securityDeposit),
        amenities: form.amenities,
        gender: form.gender,
        targetAudience: form.targetAudience,
        availableFrom: form.availableFrom,
        description: form.description.trim(),
        shortTermFriendly: form.shortTermFriendly,
        ownerId: currentUser.uid,
        ownerName: currentUser.name || currentUser.displayName || currentUser.email?.split("@")[0] || "HabiWise User",
        safetyScore: 8.5,
        scamRisk: "Low",
        rating: 4.0,
        createdAt: new Date().toISOString(),
        verified: false,
        occupancy: "Shared",
        ownerPhone: "Contact in app",
        zeroDepositAvailable: false,
        halfDepositAvailable: false,
        residentType:
          form.targetAudience === "Student"
            ? ["Students"]
            : form.targetAudience === "Professional"
            ? ["Professionals"]
            : ["Students", "Professionals"],
        images: ["https://via.placeholder.com/800x500?text=HabiWise+Property"],
        roomTypes: [{ type: "Shared", price: Number(form.rent), bedCount: 2 }],
        nearby: [],
      };

      // Try Firestore first
      if (db) {
        await addDoc(collection(db, "properties"), propertyData);
      } else {
        // Demo mode: save to localStorage
        const properties = JSON.parse(localStorage.getItem("habiwise_demo_properties") || "[]");
        properties.push(propertyData);
        localStorage.setItem("habiwise_demo_properties", JSON.stringify(properties));
      }

      flashToast("Property listed! 🎉");
      setShowSuccessAnimation(true);
      window.setTimeout(() => {
        setShowSuccessAnimation(false);
        navigate("/listings");
      }, 1000);
    } catch (submitError) {
      setError(submitError?.message || "Could not save property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0D1117] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Owner Panel</p>
            <h1 className="mt-2 text-3xl font-black text-white">Post Property</h1>
            <p className="mt-2 text-slate-400">List your space for students and professionals in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-300">Property Name *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, title: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                  placeholder="Example: Lake View PG"
                  required
                />
                {fieldErrors.title && <span className="text-xs font-medium text-red-300">{fieldErrors.title}</span>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-300">Property Type *</span>
              </label>
                <CitySelector
                  value={form.city}
                  onChange={(city) => setForm((prev) => ({ ...prev, city }))}
                />

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-300">City *</span>
                <select
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                >
                  {["Indore", "Pune", "Bengaluru"].map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-300">Area / Locality *</span>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, area: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, area: "" }));
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                  placeholder="Example: Koramangala 5th Block"
                  required
                />
                {fieldErrors.area && <span className="text-xs font-medium text-red-300">{fieldErrors.area}</span>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-300">Monthly Rent ₹ *</span>
                <input
                  type="number"
                  min="0"
                  value={form.rent}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, rent: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, rent: "" }));
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                  required
                />
                {fieldErrors.rent && <span className="text-xs font-medium text-red-300">{fieldErrors.rent}</span>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-300">Security Deposit ₹ *</span>
                <input
                  type="number"
                  min="0"
                  value={form.securityDeposit}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, securityDeposit: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, securityDeposit: "" }));
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                  required
                />
                {fieldErrors.securityDeposit && (
                  <span className="text-xs font-medium text-red-300">{fieldErrors.securityDeposit}</span>
                )}
              </label>

              <fieldset className="space-y-2 sm:col-span-2">
                <legend className="text-sm font-semibold text-slate-300">Amenities *</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {amenityOptions.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={form.amenities.includes(amenity)}
                        onChange={() => {
                          setForm((prev) => ({ ...prev, amenities: toggleValue(prev.amenities, amenity) }));
                          setFieldErrors((prev) => ({ ...prev, amenities: "" }));
                        }}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-500"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
                {fieldErrors.amenities && (
                  <span className="text-xs font-medium text-red-300">{fieldErrors.amenities}</span>
                )}
              </fieldset>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-300">Gender Preference *</span>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                >
                  {["Any", "Male", "Female"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-300">Target Audience *</span>
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                >
                  {["Student", "Professional", "Both"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-300">Available From *</span>
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, availableFrom: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, availableFrom: "" }));
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                  required
                />
                {fieldErrors.availableFrom && (
                  <span className="text-xs font-medium text-red-300">{fieldErrors.availableFrom}</span>
                )}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-300">Description *</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, description: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none focus:border-amber-500"
                  placeholder="Share key details about furnishing, rules, and connectivity"
                  required
                />
                {fieldErrors.description && (
                  <span className="text-xs font-medium text-red-300">{fieldErrors.description}</span>
                )}
              </label>

              <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Short Term Friendly</p>
                  <p className="text-xs text-slate-400">Allow 1-3 month stays</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, shortTermFriendly: !prev.shortTermFriendly }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    form.shortTermFriendly
                      ? "bg-amber-500 text-black"
                      : "border border-slate-600 bg-slate-900 text-slate-300"
                  }`}
                >
                  {form.shortTermFriendly ? "Yes" : "No"}
                </button>
              </div>
            </div>

            {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-black text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Listing Property..." : "List Property"}
            </button>
          </form>
        </div>

        {toast && (
          <div className="fixed bottom-5 right-5 rounded-full border border-amber-400/50 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-200 shadow-2xl">
            {toast}
          </div>
        )}

        {showSuccessAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-amber-500/40 bg-[#0D1117] p-8 text-center shadow-2xl">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500/10 text-4xl text-amber-300 animate-pulse">
                ✓
              </div>
              <p className="mt-5 text-xl font-black text-white">Property listed!</p>
              <p className="mt-2 text-sm text-slate-300">Redirecting to listings...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
