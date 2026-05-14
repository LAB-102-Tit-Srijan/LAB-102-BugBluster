import { useState, useRef, useEffect } from "react";

const CITY_GROUPS = [
  {
    group: "🎓 Student Hubs",
    cities: [
      { name: "Indore", desc: "IIT Indore, IIM Indore" },
      { name: "Pune", desc: "VIT, MIT, Symbiosis" },
      { name: "Bengaluru", desc: "IISc, Christ, RV College" },
      { name: "Delhi", desc: "IIT Delhi, JNU, DU" },
      { name: "Mumbai", desc: "IIT Bombay, NMIMS" },
      { name: "Hyderabad", desc: "IIT Hyd, BITS Hyderabad" },
      { name: "Chennai", desc: "IIT Madras, Anna University" },
      { name: "Kota", desc: "Allen, Resonance" },
      { name: "Jaipur", desc: "Manipal Jaipur, LNM IIT" },
      { name: "Bhopal", desc: "IIT Bhopal, NIT Bhopal" },
      { name: "Nagpur", desc: "VNIT, RCOEM" },
      { name: "Vellore", desc: "VIT Vellore" },
      { name: "Manipal", desc: "Manipal University" },
      { name: "Coimbatore", desc: "PSG Tech, Amrita" },
      { name: "Dehradun", desc: "UPES, DIT University" },
    ],
  },
  {
    group: "💼 Professional Hubs",
    cities: [
      { name: "Bengaluru", desc: "TCS, Infosys, Google, Amazon" },
      { name: "Pune", desc: "Infosys, TCS, Capgemini" },
      { name: "Hyderabad", desc: "Microsoft, Google, Deloitte" },
      { name: "Chennai", desc: "TCS, Zoho, Freshworks" },
      { name: "Mumbai", desc: "JP Morgan, Goldman Sachs" },
      { name: "Gurgaon", desc: "Google, Microsoft, BCG" },
      { name: "Noida", desc: "HCL, Tech Mahindra, Samsung" },
      { name: "Delhi", desc: "Deloitte, EY, Accenture" },
      { name: "Ahmedabad", desc: "Adani, Zydus, TCS" },
      { name: "Kochi", desc: "TCS, UST Global, Infopark" },
      { name: "Kolkata", desc: "TCS, Wipro, Cognizant" },
      { name: "Chandigarh", desc: "Infosys, TCS IT Park" },
    ],
  },
];

export default function CitySelector({ value = "All Cities", onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get all unique cities
  const allCities = [...new Set(CITY_GROUPS.flatMap((g) => g.cities.map((c) => c.name)))].sort();

  // Filter cities based on search
  const filteredGroups = CITY_GROUPS.map((group) => ({
    ...group,
    cities: group.cities.filter(
      (city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.desc.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((group) => group.cities.length > 0);

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

          {/* "All Cities" Option */}
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

          {/* City Groups */}
          <div className="max-h-72 overflow-y-auto">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {/* Group Header */}
                  <div className="border-b border-slate-800 px-4 py-2 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/80">{group.group}</p>
                  </div>

                  {/* Group Cities */}
                  <div className="space-y-1 px-2 py-1">
                    {group.cities.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleCitySelect(city.name)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-all ${
                          value === city.name
                            ? "border-l-4 border-amber-500 bg-amber-500/10 text-amber-300"
                            : "border-l-4 border-transparent text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-xs text-slate-500">{city.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
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
