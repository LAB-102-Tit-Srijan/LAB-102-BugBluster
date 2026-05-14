import { useState, useRef, useEffect, useMemo } from "react";

export const CITIES = [
  "Indore",
  "Pune",
  "Bengaluru",
  "Delhi",
  "Mumbai",
  "Hyderabad",
  "Chennai",
  "Kota",
  "Jaipur",
  "Bhopal",
  "Nagpur",
  "Vellore",
  "Manipal",
  "Coimbatore",
  "Dehradun",
  "Gurgaon",
  "Noida",
  "Ahmedabad",
  "Kochi",
  "Kolkata",
  "Chandigarh",
];

const CITY_DETAILS = {
  Indore: "IIT Indore, IIM Indore",
  Pune: "VIT, MIT, Symbiosis | Infosys, TCS, Capgemini",
  Bengaluru: "IISc, Christ, RV College | TCS, Infosys, Google, Amazon",
  Delhi: "IIT Delhi, JNU, DU | Deloitte, EY, Accenture",
  Mumbai: "IIT Bombay, NMIMS | JP Morgan, Goldman Sachs",
  Hyderabad: "IIT Hyd, BITS Hyderabad | Microsoft, Google, Deloitte",
  Chennai: "IIT Madras, Anna University | TCS, Zoho, Freshworks",
  Kota: "Allen, Resonance",
  Jaipur: "Manipal Jaipur, LNM IIT",
  Bhopal: "IIT Bhopal, NIT Bhopal",
  Nagpur: "VNIT, RCOEM",
  Vellore: "VIT Vellore",
  Manipal: "Manipal University",
  Coimbatore: "PSG Tech, Amrita",
  Dehradun: "UPES, DIT University",
  Gurgaon: "Google, Microsoft, BCG",
  Noida: "HCL, Tech Mahindra, Samsung",
  Ahmedabad: "Adani, Zydus, TCS",
  Kochi: "TCS, UST Global, Infopark",
  Kolkata: "TCS, Wipro, Cognizant",
  Chandigarh: "Infosys, TCS IT Park",
};

export default function CitySelector({ value = "All Cities", onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredCities = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    return [...CITIES].sort((a, b) => a.localeCompare(b)).filter((city) => {
      if (!lowerSearch) return true;
      return city.toLowerCase().includes(lowerSearch) || String(CITY_DETAILS[city] || "").toLowerCase().includes(lowerSearch);
    });
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleCitySelect = (cityName) => {
    onChange(cityName);
    setIsOpen(false);
    setSearchTerm("");
  };

  const displayLabel = value === "All Cities" ? "All Cities" : value;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
      >
        <span className="truncate text-left">{displayLabel}</span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50">
          {/* Search Input */}
          <div className="border-b border-slate-700 p-3">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
            />
          </div>

          <div className="border-b border-slate-700 p-2">
            <button
              type="button"
              onClick={() => handleCitySelect("All Cities")}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                value === "All Cities"
                  ? "border-l-4 border-amber-500 bg-amber-500/10 text-amber-300"
                  : "border-l-4 border-transparent text-slate-300 hover:bg-slate-800"
              }`}
            >
              All Cities
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-all ${
                    value === city
                      ? "border-l-4 border-amber-500 bg-amber-500/10 text-amber-300"
                      : "border-l-4 border-transparent text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-medium">{city}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">No cities found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
