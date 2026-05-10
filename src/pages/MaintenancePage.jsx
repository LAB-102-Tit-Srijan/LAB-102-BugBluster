import Navbar from "../components/Navbar";
import { useEffect, useMemo, useState } from "react";

const ISSUE_TYPES = ["Electricity", "Water", "WiFi", "AC", "Furniture", "Other"];

function priorityFor(type) {
  if (type === "Electricity" || type === "Water") return { label: "Urgent", color: "bg-red-600 text-white" };
  if (type === "WiFi" || type === "AC") return { label: "Moderate", color: "bg-amber-500 text-black" };
  return { label: "Low", color: "bg-emerald-600 text-white" };
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleString();
}

export default function MaintenancePage() {
  const [complaints, setComplaints] = useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("habiwise_complaints");
    if (saved) return JSON.parse(saved);
    const now = Date.now();
    return [
      {
        id: `c-${now}-1`,
        type: "Electricity",
        description: "Intermittent power cuts in Block A corridor every evening.",
        date: now - 1000 * 60 * 60 * 24 * 2,
        priority: "Urgent",
        status: "Pending",
      },
      {
        id: `c-${now}-2`,
        type: "WiFi",
        description: "WiFi speed drops after 9pm making remote work difficult.",
        date: now - 1000 * 60 * 60 * 24 * 5,
        priority: "Moderate",
        status: "In Progress",
      },
      {
        id: `c-${now}-3`,
        type: "Furniture",
        description: "Wardrobe door hinge is broken in room 203.",
        date: now - 1000 * 60 * 60 * 24 * 10,
        priority: "Low",
        status: "Resolved",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("habiwise_complaints", JSON.stringify(complaints));
    } catch {}
  }, [complaints]);

  const [form, setForm] = useState({ type: "Electricity", description: "" });
  const [toast, setToast] = useState("");

  const aiPriority = useMemo(() => priorityFor(form.type), [form.type]);

  function handleSubmit(e) {
    e.preventDefault();
    const id = `c-${Date.now()}`;
    const newComplaint = {
      id,
      type: form.type,
      description: form.description || "No description provided",
      date: Date.now(),
      priority: aiPriority.label,
      status: "Pending",
    };
    setComplaints((s) => [newComplaint, ...s]);
    setForm({ type: "Electricity", description: "" });
    setToast("Complaint raised! 🛠");
    setTimeout(() => setToast(""), 3000);
  }

  function statusIndex(status) {
    const steps = ["Pending", "Assigned", "In Progress", "Resolved"];
    return steps.indexOf(status);
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-black text-white">Maintenance & Safety</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="col-span-1 lg:col-span-1 rounded-2xl border border-slate-800 bg-[#071022] p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-3">Raise Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm text-slate-300">Issue type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-white"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <label className="block text-sm text-slate-300">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-white"
              />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded ${aiPriority.color} text-sm font-semibold`}>{aiPriority.label}</div>
                  <div className="text-xs text-slate-400">AI Priority</div>
                </div>
                <button type="submit" className="ml-auto rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400">
                  Submit
                </button>
              </div>
            </form>
          </div>

          {/* Complaints list */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Complaint History</h3>
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-700 to-slate-700 flex items-center justify-center text-white font-bold">
                          {c.type.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold">{c.type}</h4>
                            <div className="text-xs text-slate-400">• {formatDate(c.date)}</div>
                          </div>
                          <p className="text-slate-300 mt-1">{c.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${priorityFor(c.type).color}`}>{c.priority}</div>
                        <div className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{c.status}</div>
                      </div>
                    </div>

                    {/* Mini timeline */}
                    <div className="mt-4">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {[["Raised",0],["Assigned",1],["In Progress",2],["Resolved",3]].map(([label,idx]) => {
                          const current = statusIndex(c.status) >= idx;
                          return (
                            <div key={label} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${current ? 'bg-amber-400' : 'bg-slate-700'}`} />
                              <div>{label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-md bg-emerald-600 text-white px-4 py-2 font-semibold shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
