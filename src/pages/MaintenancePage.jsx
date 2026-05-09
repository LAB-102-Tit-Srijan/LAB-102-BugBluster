import Navbar from "../components/Navbar";

export default function MaintenancePage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Maintenance Issues</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Report Issues</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
              + Report Issue
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">No active maintenance issues.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
