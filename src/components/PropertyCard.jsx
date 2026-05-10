import { Link } from "react-router-dom";

export default function PropertyCard({ property, theme = "dark", communityBadge = "" }) {
  const dark = theme === "dark";
  const cardClassName = "group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-indigo-500/40";
  const rent = property.rent ?? property.price ?? 0;
  const depositBadge = property.zeroDepositAvailable
    ? { text: "⚡ Zero Deposit — Elite members", className: "border-amber-400/40 bg-amber-500/20 text-amber-200" }
    : property.halfDepositAvailable
      ? { text: "💫 50% Deposit — Trusted members", className: "border-slate-300/40 bg-slate-300/15 text-slate-100" }
      : { text: "🔒 Full Deposit Required", className: "border-slate-600 bg-slate-700/30 text-slate-300" };
  const riskTone =
    property.scamRisk === "High"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : property.scamRisk === "Medium"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

  const amenityIcons = {
    WiFi: "📶",
    AC: "❄️",
    Food: "🍽️",
    Parking: "🅿️",
    Laundry: "🧺",
  };

  return (
    <div className={cardClassName}>
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(129,140,248,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.16),_transparent_30%)]" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              AI Verified
            </span>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskTone}`}>
              Scam Risk: {property.scamRisk || "Low"}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Property</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{property.title}</h3>
              <p className="mt-1 inline-flex rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-300">
                {property.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Rent</p>
            <p className="text-2xl font-black text-amber-400">₹{rent.toLocaleString()}/mo</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Safety Score</p>
            <p className="text-lg font-bold text-slate-100">🛡 {property.safetyScore?.toFixed ? property.safetyScore.toFixed(1) : property.safetyScore || "9.0"}/10</p>
          </div>
        </div>

        <div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${depositBadge.className}`}>
            {depositBadge.text}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
          <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">{property.type}</span>
          <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">{property.gender}</span>
          <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">{property.city}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {property.amenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-300"
            >
              <span>{amenityIcons[amenity] || "•"}</span>
              <span>{amenity}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskTone}`}>
            Scam Risk: {property.scamRisk || "Low"}
          </span>
        </div>

        {communityBadge && (
          <div>
            <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-[#1C2128] px-3 py-1 text-xs font-semibold text-amber-300">
              {communityBadge}
            </span>
          </div>
        )}

        <Link to={`/property/${property.id}`} className="block rounded-xl bg-indigo-600 py-3 text-center font-semibold text-white transition hover:bg-indigo-500">
          View Details
        </Link>
      </div>
    </div>
  );
}
