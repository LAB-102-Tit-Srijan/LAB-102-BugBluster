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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600">Property not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{property.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img src={property.image} alt={property.title} className="w-full rounded-lg mb-4" />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-4">{property.location}</p>
            <p className="text-3xl font-bold text-indigo-600 mb-4">Rs{property.price}/month</p>
            <p className="text-gray-700 mb-6">
              {property.beds} Bedroom ? {property.baths} Bathroom
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              {property.amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>

            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
