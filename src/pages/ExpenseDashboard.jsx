import Navbar from "../components/Navbar";

export default function ExpenseDashboard() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-black text-white">Expense Dashboard</h1>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <p className="mb-2 text-slate-400">Total Monthly Rent</p>
            <p className="text-3xl font-black text-indigo-300">Rs15,000</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <p className="mb-2 text-slate-400">Utilities & Bills</p>
            <p className="text-3xl font-black text-indigo-300">Rs3,500</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <p className="mb-2 text-slate-400">Total Monthly Cost</p>
            <p className="text-3xl font-black text-indigo-300">Rs18,500</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
          <h2 className="mb-4 text-xl font-semibold text-white">Expense Breakdown</h2>
          <p className="text-slate-400">Expense tracking coming soon...</p>
        </div>
      </div>
    </>
  );
}
