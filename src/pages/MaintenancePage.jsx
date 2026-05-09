import Navbar from "../components/Navbar";

export default function MaintenancePage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black text-white">Maintenance Issues</h1>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Report Issues</h2>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500">
              + Report Issue
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-slate-400">No active maintenance issues.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
