export default function FilterSidebar({ onFilterChange }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <h3 className="mb-4 text-lg font-semibold text-white">Filters</h3>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Budget Range</label>
          <select
            onChange={(e) => onFilterChange("budget", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          >
            <option>All</option>
            <option>Under 10k</option>
            <option>10k - 20k</option>
            <option>20k+</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">City</label>
          <select
            onChange={(e) => onFilterChange("city", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          >
            <option>All</option>
            <option>Bangalore</option>
            <option>Mumbai</option>
            <option>Delhi</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
          <select
            onChange={(e) => onFilterChange("role", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
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
