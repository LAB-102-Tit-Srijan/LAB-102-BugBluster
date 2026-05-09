import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { properties } from "../data/properties";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const property = properties.find((p) => p.id === parseInt(id));

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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black text-white">{property.title}</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <img src={property.image} alt={property.title} className="w-full rounded-2xl border border-slate-800" />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <p className="mb-4 text-slate-400">{property.location}</p>
            <p className="mb-4 text-3xl font-black text-amber-400">₹{(property.rent ?? property.price ?? 0).toLocaleString()}/month</p>
            <p className="mb-6 text-slate-300">
              {property.beds} Bedroom / {property.baths} Bathroom
            </p>

            <h3 className="mb-3 text-lg font-semibold text-white">Amenities</h3>
            <ul className="mb-6 list-inside list-disc space-y-2 text-slate-300">
              {property.amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>

            <button className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500">
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
