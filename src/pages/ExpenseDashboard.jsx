import Navbar from "../components/Navbar";

export default function ExpenseDashboard() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Expense Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Total Monthly Rent</p>
            <p className="text-3xl font-bold text-indigo-600">Rs15,000</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Utilities & Bills</p>
            <p className="text-3xl font-bold text-indigo-600">Rs3,500</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Total Monthly Cost</p>
            <p className="text-3xl font-bold text-indigo-600">Rs18,500</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Breakdown</h2>
          <p className="text-gray-600">Expense tracking coming soon...</p>
        </div>
      </div>
    </>
  );
}
