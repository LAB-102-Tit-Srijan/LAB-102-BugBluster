import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import CitySelector from "../components/CitySelector";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../firebase/config";

const amenityOptions = ["WiFi", "AC", "Food", "Parking", "Laundry"];
const propertyTypes = ["PG", "Hostel", "Flat", "Co-living", "Shared Flat"];
const studentBranchOptions = ["CSE", "ECE", "MBA", "Law", "Medical", "Commerce", "Arts", "Other"];
const studentExamOptions = ["UPSC", "CAT", "GATE", "JEE", "CA", "NEET"];
const workStyleOptions = ["WFH", "Office", "Hybrid"];
const stayDurationOptions = ["Long Term", "Short Term", "Very Short", "Flexible"];

const defaultFilters = {
  budget: 20000,
  gender: "Any",
  selectedAmenities: [],
  selectedTypes: [],
  sortBy: "",
  stayDuration: "",
  depositPreference: "all",
  people: {
    sameCollegeMatch: false,
    collegeName: "",
    sameBranchMatch: false,
    branch: "",
    examPrepBuddy: false,
    examPrepTags: [],
    internshipLocationMatch: false,
    internshipLocation: "",
    sameOfficeArea: false,
    officeArea: "",
    workStyleMatch: false,
    workStyles: [],
  },
};

const sortOptions = [
  { value: "rent_low", label: "🏷 Rent: Low to High" },
  { value: "rent_high", label: "🏷 Rent: High to Low" },
  { value: "safety", label: "🛡 Safety Score: High to Low" },
  { value: "commute", label: "🚗 Nearest to College / Office" },
  { value: "rating", label: "⭐ Top Rated" },
  { value: "scam", label: "🚨 Scam Risk: Lowest First" },
  { value: "newest", label: "🆕 Newest Listed" },
];

const scamRiskOrder = { Low: 0, Medium: 1, High: 2 };

const getRent = (property) => property.rent ?? property.price ?? 0;

const getCommuteScore = (property) => {
  if (typeof property.commuteScore === "number") {
    return property.commuteScore;
  }

  const nearbyDistances = (property.nearby || [])
    .map((item) => {
      const raw = String(item.distance || "");
      const parsed = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    })
    .filter((value) => value !== null);

  if (nearbyDistances.length > 0) {
    return Math.min(...nearbyDistances);
  }

  return Number.POSITIVE_INFINITY;
};

const getRating = (property) => property.rating ?? property.reviewRating ?? property.safetyScore ?? 0;

const getListedValue = (property) => {
  if (typeof property.createdAt?.seconds === "number") {
    return property.createdAt.seconds * 1000;
  }

  const parsed = Date.parse(property.listedDate || "");
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return Number(property.id) || 0;
};

const includesText = (value, target) => String(value || "").toLowerCase().includes(String(target || "").toLowerCase());

const toggleArrayValue = (arr, value) => (arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value]);

export default function ListingsPage() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("All Cities");
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [role, setRole] = useState("student");
  const [roleLoaded, setRoleLoaded] = useState(false);

  const localProfile = useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      const savedUsers = JSON.parse(localStorage.getItem("habiwise_demo_users") || "[]");
      return savedUsers.find((user) => user.email === currentUser?.email) || {};
    } catch {
      return {};
    }
  }, [currentUser?.email]);

  const normalizedRole = (currentUser?.role || localProfile.role || "Student").toLowerCase();
  const roleLabel = role === "professional" ? "Professional" : "Student";
  const isStudent = role !== "professional";

  useEffect(() => {
    const initialCity = location.state?.city;
    if (initialCity) {
      setCity(initialCity);
    }
  }, [location.state?.city]);

  useEffect(() => {
    const loadRole = async () => {
      if (!isFirebaseConfigured || !db || !currentUser?.uid) {
          const fallbackRole = normalizedRole.includes("professional") ? "professional" : "student";
        setRole(fallbackRole);
        setRoleLoaded(true);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const storedRole = String(userDoc.data()?.role || currentUser.role || localProfile.role || "student").toLowerCase();
        setRole(storedRole.includes("professional") ? "professional" : "student");
      } catch {
        setRole(normalizedRole.includes("professional") ? "professional" : "student");
      } finally {
        setRoleLoaded(true);
      }
    };

    loadRole();
  }, [currentUser?.uid, currentUser?.role, localProfile.role, normalizedRole]);

  useEffect(() => {
    if (!roleLoaded) return undefined;

    if (!isFirebaseConfigured || !db) {
      try {
        const demoProperties = JSON.parse(localStorage.getItem("habiwise_demo_properties") || "[]");
        const filteredDemo = demoProperties.filter((property) => {
          const audience = String(property.targetAudience || "both").toLowerCase();
          const matchesAudience = audience === role || audience === "both";
          const matchesCity = city === "All Cities" || String(property.city || "").toLowerCase() === city.toLowerCase();
          return matchesAudience && matchesCity;
        });
        setProperties(filteredDemo);
      } catch {
        setProperties([]);
      }
      setLoading(false);
      return undefined;
    }

    const cityFilter = city && city !== "All Cities" ? String(city).trim() : "";
    const baseQuery = cityFilter
      ? query(
          collection(db, "properties"),
          where("city", "==", cityFilter),
          where("targetAudience", "in", [role, "both"]),
          orderBy("createdAt", "desc")
        )
      : query(
          collection(db, "properties"),
          where("targetAudience", "in", [role, "both"]),
          orderBy("createdAt", "desc")
        );

    const unsub = onSnapshot(
      baseQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        setProperties(data);
        setLoading(false);
      },
      () => {
        setProperties([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [city, currentUser?.uid, isFirebaseConfigured, localProfile.role, normalizedRole, role, roleLoaded]);

  const filteredProperties = useMemo(() => {
    const result = properties.filter((property) => {
      const rent = getRent(property);
      const residentTypes = property.residentType || [];
      const people = appliedFilters.people;
      const matchesSearch =
        searchQuery.trim() === "" ||
        `${property.title} ${property.location} ${property.city} ${property.area}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCity = city === "All Cities" || (property.city || "").toLowerCase() === city.toLowerCase();
      const matchesBudget = rent <= appliedFilters.budget;
      const matchesGender = appliedFilters.gender === "Any" || property.gender === appliedFilters.gender;
      const matchesAmenities =
        appliedFilters.selectedAmenities.length === 0 ||
        appliedFilters.selectedAmenities.every((amenity) => property.amenities?.includes(amenity));
      const matchesTypes =
        appliedFilters.selectedTypes.length === 0 || appliedFilters.selectedTypes.includes(property.type);

      const matchesStudentPeople = isStudent
        ? (!people.sameCollegeMatch || !people.collegeName || residentTypes.some((item) => includesText(item, people.collegeName))) &&
          (!people.sameBranchMatch || !people.branch || residentTypes.some((item) => includesText(item, people.branch))) &&
          (!people.examPrepBuddy ||
            people.examPrepTags.length === 0 ||
            people.examPrepTags.some((exam) => residentTypes.some((item) => includesText(item, exam)))) &&
          (!people.internshipLocationMatch ||
            !people.internshipLocation ||
            includesText(`${property.location} ${property.area} ${property.title}`, people.internshipLocation))
        : true;

      const matchesProfessionalPeople = !isStudent
        ? (!people.sameOfficeArea || !people.officeArea || includesText(`${property.location} ${property.area} ${property.city}`, people.officeArea)) &&
          (!people.workStyleMatch ||
            people.workStyles.length === 0 ||
            people.workStyles.some((style) => residentTypes.some((item) => includesText(item, style))))
        : true;

      const matchesStayDuration =
        !appliedFilters.stayDuration ||
        appliedFilters.stayDuration === "Flexible" ||
        (appliedFilters.stayDuration === "Long Term" && property.shortTermFriendly !== true) ||
        ((appliedFilters.stayDuration === "Short Term" || appliedFilters.stayDuration === "Very Short") &&
          property.shortTermFriendly === true);

      const matchesDepositPreference =
        appliedFilters.depositPreference === "all" ||
        (appliedFilters.depositPreference === "zero" && property.zeroDepositAvailable) ||
        (appliedFilters.depositPreference === "half" && (property.zeroDepositAvailable || property.halfDepositAvailable)) ||
        (appliedFilters.depositPreference === "standard" && !property.zeroDepositAvailable && !property.halfDepositAvailable);

      return (
        matchesSearch &&
        matchesCity &&
        matchesBudget &&
        matchesGender &&
        matchesAmenities &&
        matchesTypes &&
        matchesStudentPeople &&
        matchesProfessionalPeople &&
        matchesStayDuration &&
        matchesDepositPreference
      );
    });

    if (!appliedFilters.sortBy) {
      return result;
    }

    const sorted = [...result];
    switch (appliedFilters.sortBy) {
      case "rent_low":
        sorted.sort((a, b) => getRent(a) - getRent(b));
        break;
      case "rent_high":
        sorted.sort((a, b) => getRent(b) - getRent(a));
        break;
      case "safety":
        sorted.sort((a, b) => (b.safetyScore ?? 0) - (a.safetyScore ?? 0));
        break;
      case "commute":
        sorted.sort((a, b) => getCommuteScore(a) - getCommuteScore(b));
        break;
      case "rating":
        sorted.sort((a, b) => getRating(b) - getRating(a));
        break;
      case "scam":
        sorted.sort((a, b) => (scamRiskOrder[a.scamRisk] ?? 99) - (scamRiskOrder[b.scamRisk] ?? 99));
        break;
      case "newest":
        sorted.sort((a, b) => getListedValue(b) - getListedValue(a));
        break;
      default:
        break;
    }

    return sorted;
  }, [appliedFilters, city, isStudent, properties, searchQuery]);

  const roleCityLabel = city === "All Cities" ? `All ${roleLabel.toLowerCase()} stays` : `${roleLabel} stays in ${city}`;
  const resultCountLabel = `Showing ${filteredProperties.length} properties for you`;
  const emptyStateLabel = city === "All Cities"
    ? `No properties found for ${roleLabel.toLowerCase()} stays yet. Try back soon!`
    : `No properties found in ${city} yet. Try a nearby city or check back soon!`;

  const toggleAmenity = (amenity) => {
    setDraftFilters((current) => ({
      ...current,
      selectedAmenities: current.selectedAmenities.includes(amenity)
        ? current.selectedAmenities.filter((item) => item !== amenity)
        : [...current.selectedAmenities, amenity],
    }));
  };

  const toggleType = (type) => {
    setDraftFilters((current) => ({
      ...current,
      selectedTypes: current.selectedTypes.includes(type)
        ? current.selectedTypes.filter((item) => item !== type)
        : [...current.selectedTypes, type],
    }));
  };

  const togglePeopleCheckbox = (key) => {
    setDraftFilters((current) => ({
      ...current,
      people: {
        ...current.people,
        [key]: !current.people[key],
      },
    }));
  };

  const togglePeopleTag = (key, value) => {
    setDraftFilters((current) => ({
      ...current,
      people: {
        ...current.people,
        [key]: toggleArrayValue(current.people[key], value),
      },
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsMobileFiltersOpen(false);
  };

  const resetAllFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setIsMobileFiltersOpen(false);
  };

  const filterContent = (
    <>
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-amber-300/80">Sort By</p>
        <div className="space-y-1.5">
          {sortOptions.map((option) => {
            const selected = draftFilters.sortBy === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraftFilters((current) => ({ ...current, sortBy: option.value }))}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] leading-snug transition-all duration-300 ease-out ${
                  selected
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70 hover:translate-x-0.5"
                }`}
              >
                <span className="min-w-0 flex-1 truncate whitespace-nowrap pr-1">{option.label}</span>
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border ${
                    selected ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-3 border-t border-[#30363D]" />

      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-amber-300/80">Find Your People</p>
        <div className="space-y-2">
          {isStudent ? (
            <>
              <button
                type="button"
                onClick={() => togglePeopleCheckbox("sameCollegeMatch")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition ${
                  draftFilters.people.sameCollegeMatch
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                <span>Same College Match</span>
                <span
                  className={`h-4 w-4 rounded border ${
                    draftFilters.people.sameCollegeMatch ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  draftFilters.people.sameCollegeMatch ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <input
                  type="text"
                  value={draftFilters.people.collegeName}
                  onChange={(e) =>
                    setDraftFilters((current) => ({
                      ...current,
                      people: { ...current.people, collegeName: e.target.value },
                    }))
                  }
                  placeholder="Enter your college name"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => togglePeopleCheckbox("sameBranchMatch")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition ${
                  draftFilters.people.sameBranchMatch
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                <span>Same Branch / Stream</span>
                <span
                  className={`h-4 w-4 rounded border ${
                    draftFilters.people.sameBranchMatch ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  draftFilters.people.sameBranchMatch ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <select
                  value={draftFilters.people.branch}
                  onChange={(e) =>
                    setDraftFilters((current) => ({
                      ...current,
                      people: { ...current.people, branch: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                >
                  <option value="">Select stream</option>
                  {studentBranchOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => togglePeopleCheckbox("examPrepBuddy")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition ${
                  draftFilters.people.examPrepBuddy
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                <span>Exam Prep Buddy</span>
                <span
                  className={`h-4 w-4 rounded border ${
                    draftFilters.people.examPrepBuddy ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  draftFilters.people.examPrepBuddy ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-1 flex flex-wrap gap-2">
                  {studentExamOptions.map((exam) => {
                    const selected = draftFilters.people.examPrepTags.includes(exam);
                    return (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => togglePeopleTag("examPrepTags", exam)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          selected
                            ? "border-amber-400 bg-amber-500/20 text-amber-300"
                            : "border-slate-700 bg-slate-950 text-slate-300"
                        }`}
                      >
                        {exam}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => togglePeopleCheckbox("internshipLocationMatch")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition ${
                  draftFilters.people.internshipLocationMatch
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                <span>Internship Location Match</span>
                <span
                  className={`h-4 w-4 rounded border ${
                    draftFilters.people.internshipLocationMatch
                      ? "border-amber-400 bg-amber-400"
                      : "border-slate-500"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  draftFilters.people.internshipLocationMatch ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <input
                  type="text"
                  value={draftFilters.people.internshipLocation}
                  onChange={(e) =>
                    setDraftFilters((current) => ({
                      ...current,
                      people: { ...current.people, internshipLocation: e.target.value },
                    }))
                  }
                  placeholder="Enter area or company name"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                />
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => togglePeopleCheckbox("sameOfficeArea")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-all duration-300 ease-out ${
                  draftFilters.people.sameOfficeArea
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70 hover:translate-x-0.5"
                }`}
              >
                <span>Same Office Area</span>
                <span
                  className={`h-4 w-4 rounded border ${
                    draftFilters.people.sameOfficeArea ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  draftFilters.people.sameOfficeArea ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <input
                  type="text"
                  value={draftFilters.people.officeArea}
                  onChange={(e) =>
                    setDraftFilters((current) => ({
                      ...current,
                      people: { ...current.people, officeArea: e.target.value },
                    }))
                  }
                  placeholder="Enter your office location"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => togglePeopleCheckbox("workStyleMatch")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-all duration-300 ease-out ${
                  draftFilters.people.workStyleMatch
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70 hover:translate-x-0.5"
                }`}
              >
                <span>Work Style Match</span>
                <span
                  className={`h-4 w-4 rounded border ${
                    draftFilters.people.workStyleMatch ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  draftFilters.people.workStyleMatch ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-1 flex flex-wrap gap-2">
                  {workStyleOptions.map((style) => {
                    const selected = draftFilters.people.workStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => togglePeopleTag("workStyles", style)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 ease-out ${
                          selected
                            ? "border-amber-400 bg-amber-500/20 text-amber-300"
                            : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="my-3 border-t border-[#30363D]" />

      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-amber-300/80">Stay Duration</p>
        <div className="space-y-1.5">
          {stayDurationOptions.map((option) => {
            const selected = draftFilters.stayDuration === option;
            const subtitle =
              option === "Long Term"
                ? "6+ months"
                : option === "Short Term"
                ? "1 to 3 months"
                : option === "Very Short"
                ? "2 to 4 weeks"
                : "No preference";
            return (
              <button
                key={option}
                type="button"
                onClick={() => setDraftFilters((current) => ({ ...current, stayDuration: option }))}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-all duration-300 ease-out ${
                  selected
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70 hover:translate-x-0.5"
                }`}
              >
                <span>
                  <span className="block text-[13px] leading-snug">{option}</span>
                  <span className="block text-[11px] text-slate-400">{subtitle}</span>
                </span>
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border ${
                    selected ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-3 border-t border-[#30363D]" />

      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-amber-300/80">💰 Deposit Preference</p>
        <div className="space-y-1.5">
          {[
            { value: "all", label: "All Properties" },
            { value: "zero", label: "Zero Deposit Only ⚡" },
            { value: "half", label: "50% or less Deposit 💫" },
            { value: "standard", label: "Standard Listings" },
          ].map((option) => {
            const selected = draftFilters.depositPreference === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraftFilters((current) => ({ ...current, depositPreference: option.value }))}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-all duration-300 ease-out ${
                  selected
                    ? "border-l-[3px] border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-l-[3px] border-transparent text-slate-300 hover:bg-slate-800/70 hover:translate-x-0.5"
                }`}
              >
                <span className="min-w-0 flex-1 truncate whitespace-nowrap pr-1 text-[13px] leading-snug">{option.label}</span>
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border ${
                    selected ? "border-amber-400 bg-amber-400" : "border-slate-500"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {draftFilters.depositPreference === "zero" && (
          <div className="mt-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            Available for Elite members (Score 71+)
          </div>
        )}
      </div>

      <div className="my-3 border-t border-[#30363D]" />

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Budget</label>
          <input
            type="range"
            min="2000"
            max="20000"
            step="500"
            value={draftFilters.budget}
            onChange={(e) => setDraftFilters((current) => ({ ...current, budget: Number(e.target.value) }))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-400"
          />
          <div className="mt-1.5 flex items-center justify-between text-sm text-slate-400">
            <span>₹2,000</span>
            <span className="font-semibold text-amber-300">₹{draftFilters.budget.toLocaleString()}</span>
            <span>₹20,000</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Gender</label>
          <div className="grid grid-cols-3 gap-2">
            {["Any", "Male", "Female"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraftFilters((current) => ({ ...current, gender: option }))}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ease-out ${
                  draftFilters.gender === option
                    ? "border-amber-500 bg-amber-500/10 text-amber-300"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:translate-y-[-1px]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Amenities</label>
          <div className="space-y-2">
            {amenityOptions.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm text-slate-300 transition-all duration-300 ease-out hover:border-slate-700 hover:translate-x-0.5"
              >
                <input
                  type="checkbox"
                  checked={draftFilters.selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-400"
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Property Type</label>
          <div className="space-y-2">
            {propertyTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm text-slate-300 transition-all duration-300 ease-out hover:border-slate-700 hover:translate-x-0.5"
              >
                <input
                  type="checkbox"
                  checked={draftFilters.selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-400"
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={resetAllFilters}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-slate-300 transition-all duration-300 ease-out hover:border-slate-500 hover:-translate-y-0.5"
        >
          Reset All
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg border border-amber-500 bg-amber-500/15 px-3 py-1.5 text-sm font-semibold text-amber-200 transition-all duration-300 ease-out hover:bg-amber-500/25 hover:-translate-y-0.5"
        >
          Apply Filters
        </button>
      </div>
    </>
  );

  const getCommunityBadge = (property) => {
    const people = appliedFilters.people;
    const resident = property.residentType || [];
    const hasPeopleFilter = isStudent
      ? people.sameCollegeMatch || people.sameBranchMatch || people.examPrepBuddy || people.internshipLocationMatch
      : people.sameOfficeArea || people.workStyleMatch;

    const hasDurationFilter =
      appliedFilters.stayDuration && appliedFilters.stayDuration !== "Flexible";

    if (!hasPeopleFilter && !hasDurationFilter) return "";

    if (hasDurationFilter && property.shortTermFriendly && appliedFilters.stayDuration !== "Long Term") {
      return "⏳ Short-term friendly";
    }

    if (isStudent && people.sameBranchMatch && people.branch) {
      return `🎓 2 ${people.branch} students already here`;
    }

    if (isStudent && people.examPrepBuddy && people.examPrepTags.length > 0) {
      return `📚 1 ${people.examPrepTags[0]} aspirant here`;
    }

    if (!isStudent && people.workStyleMatch && people.workStyles.length > 0) {
      return "💼 3 IT professionals here";
    }

    if (resident.length > 0) {
      return "🏠 Mixed community";
    }

    return "";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0D1117] text-slate-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Browse stays</p>
              <h1 className="mt-2 text-3xl font-black text-white">Available Listings</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 lg:hidden"
              >
                Filters & Sort
              </button>
              <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
                {loading ? "Loading properties..." : `Showing ${filteredProperties.length} properties`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="hidden h-fit rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20 lg:sticky lg:top-24 lg:block">
              <h2 className="mb-4 text-lg font-semibold text-white">Filters</h2>
              {filterContent}
            </aside>

            <section className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-200">
                    {isStudent ? "🎓" : "💼"} {roleCityLabel}
                  </span>
                  <span className="text-sm text-slate-400">{resultCountLabel}</span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by property, area, or location"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
                  />

                  <CitySelector value={city} onChange={setCity} />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20">
                      <div className="h-40 animate-pulse rounded-xl bg-slate-800" />
                      <div className="mt-4 space-y-3">
                        <div className="h-4 w-3/5 animate-pulse rounded bg-slate-800" />
                        <div className="h-4 w-2/5 animate-pulse rounded bg-slate-800" />
                        <div className="h-8 w-full animate-pulse rounded bg-slate-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300 shadow-2xl shadow-black/20">
                  No properties yet. Be the first to post!
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400 shadow-2xl shadow-black/20">
                  <p>{emptyStateLabel}</p>
                  <button
                    type="button"
                    onClick={() => setCity("All Cities")}
                    className="mt-4 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                  >
                    Change City
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} communityBadge={getCommunityBadge(property)} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {isMobileFiltersOpen && (
          <>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] rounded-t-3xl border border-slate-700 bg-[#0D1117] p-4 shadow-2xl animate-[sheetUp_300ms_ease-out] lg:hidden">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Filters</h2>
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-1">{filterContent}</div>
            </div>
          </>
        )}

      <style>{`\
        @keyframes sheetUp {\
          from { transform: translateY(18px); opacity: 0; }\
          to { transform: translateY(0); opacity: 1; }\
        }\
      `}</style>
      </div>
    </>
  );
}
