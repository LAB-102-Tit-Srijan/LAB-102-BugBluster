import Navbar from "../components/Navbar";
import { useState } from "react";

export default function SafetyPage() {
  const [toast, setToast] = useState("");

  function sendSOS() {
    setToast("Sending SOS...");
    // Mock network request to demonstrate a real POST
    fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "sos", timestamp: Date.now(), user: "demo" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(() => {
        setToast("SOS sent (mock) — help is on the way!");
        setTimeout(() => setToast(""), 3000);
      })
      .catch(() => {
        setToast("Failed to send SOS (mock). Try again.");
        setTimeout(() => setToast(""), 3000);
      });
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-black text-white">Safety</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-6 flex items-center justify-center">
              <button
                onClick={sendSOS}
                className="w-full py-8 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-2xl flex items-center justify-center gap-3 animate-pulse"
              >
                🚨 Emergency SOS
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-6">
              <h3 className="text-lg font-semibold text-white mb-3">DigiLocker Verification</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">✓</div>
                  <div>
                    <div className="text-white font-semibold">Aadhaar</div>
                    <div className="text-slate-400 text-sm">Verified</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">✓</div>
                  <div>
                    <div className="text-white font-semibold">PAN</div>
                    <div className="text-slate-400 text-sm">Verified</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">✓</div>
                  <div>
                    <div className="text-white font-semibold">College / Company ID</div>
                    <div className="text-slate-400 text-sm">Verified</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">✓</div>
                  <div>
                    <div className="text-white font-semibold">Owner Documents</div>
                    <div className="text-slate-400 text-sm">Verified</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Emergency Contacts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">🚑</div>
                    <div>
                      <div className="text-white font-semibold">Campus Security</div>
                      <div className="text-slate-400 text-sm">+91 98765 43210</div>
                    </div>
                  </div>
                  <a href="tel:+919876543210" className="rounded-md bg-amber-500 px-3 py-2 font-semibold text-black">Call</a>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">👮‍♀️</div>
                    <div>
                      <div className="text-white font-semibold">Local Police</div>
                      <div className="text-slate-400 text-sm">100</div>
                    </div>
                  </div>
                  <a href="tel:100" className="rounded-md bg-amber-500 px-3 py-2 font-semibold text-black">Call</a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Women Safety Score</h3>
              <div className="text-4xl font-extrabold text-amber-400">9.1/10</div>
              <div className="text-sm text-slate-400">Verified Safe Zone</div>
              <div className="mt-3 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.848 1.416 8.264L12 18.896 4.584 24.86 6 16.596 0 10.748l8.332-1.73z"/></svg>
                ))}
              </div>
              <div className="mt-4 text-xs text-slate-400">Verified Safe Zone</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#071022] p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Verified Parent Mode</h3>
              <p className="text-slate-300 text-sm">Parent Mode lets verified parent accounts receive emergency notifications and weekly safety summaries for their ward.</p>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-md bg-red-600 text-white px-4 py-2 font-semibold shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
