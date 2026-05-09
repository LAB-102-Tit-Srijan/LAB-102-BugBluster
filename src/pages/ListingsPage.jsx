import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import { properties } from "../data/properties";

const amenityOptions = ["WiFi", "AC", "Food", "Parking", "Laundry"];
const propertyTypes = ["PG", "Hostel", "Shared Flat", "Co-living"];
const cityOptions = ["All Cities", "Bengaluru", "Pune", "Indore"];

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("All Cities");
  const [budget, setBudget] = useState(20000);
  const [gender, setGender] = useState("Any");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const rent = property.rent ?? property.price ?? 0;
      const matchesSearch =
        searchQuery.trim() === "" ||
        `${property.title} ${property.location} ${property.city} ${property.area}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCity = city === "All Cities" || property.city === city;
      const matchesBudget = rent <= budget;
      const matchesGender = gender === "Any" || property.gender === gender;
      const matchesAmenities =
        selectedAmenities.length === 0 || selectedAmenities.every((amenity) => property.amenities?.includes(amenity));
      const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(property.type);

      return matchesSearch && matchesCity && matchesBudget && matchesGender && matchesAmenities && matchesTypes;
    });
  }, [budget, city, gender, searchQuery, selectedAmenities, selectedTypes]);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((current) =>
      current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Browse stays</p>
            <h1 className="mt-2 text-3xl font-black text-white">Available Listings</h1>
          </div>
          <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
            Showing {filteredProperties.length} properties
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20 lg:sticky lg:top-24">
            <h2 className="mb-5 text-lg font-semibold text-white">Filters</h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Budget</label>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-400"
                />
                <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                  <span>₹2,000</span>
                  <span className="font-semibold text-amber-300">₹{budget.toLocaleString()}</span>
                  <span>₹20,000</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Any", "Male", "Female"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGender(option)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        gender === option
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                          : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Amenities</label>
                <div className="space-y-2">
                  {amenityOptions.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-400"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Property Type</label>
                <div className="space-y-2">
                  {propertyTypes.map((type) => (
                    <label key={type} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400 focus:ring-amber-400"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by property, area, or location"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                />

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                >
                  {cityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400 shadow-2xl shadow-black/20">
                No properties match your current filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
