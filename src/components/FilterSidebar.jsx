export default function FilterSidebar({ onFilterChange }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
          <select
            onChange={(e) => onFilterChange("budget", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          >
            <option>All</option>
            <option>Under 10k</option>
            <option>10k - 20k</option>
            <option>20k+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <select
            onChange={(e) => onFilterChange("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          >
            <option>All</option>
            <option>Bangalore</option>
            <option>Mumbai</option>
            <option>Delhi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            onChange={(e) => onFilterChange("role", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
          >
            <option>All</option>
            <option>Student</option>
            <option>Professional</option>
          </select>
        </div>
      </div>
    </div>
  );
}
