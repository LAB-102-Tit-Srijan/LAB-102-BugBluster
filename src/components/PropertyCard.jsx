import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
      <img src={property.image} alt={property.title} className="w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
      <p className="text-gray-600 mb-2">{property.location}</p>
      <div className="flex justify-between mb-4">
        <span className="font-bold text-indigo-600">Rs{property.price}/mo</span>
        <span className="text-gray-700">{property.beds} bed ? {property.baths} bath</span>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {property.amenities.map((amenity) => (
          <span key={amenity} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
            {amenity}
          </span>
        ))}
      </div>
      <Link to={`/property/${property.id}`} className="block text-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 font-medium">
        View Details
      </Link>
    </div>
  );
}
