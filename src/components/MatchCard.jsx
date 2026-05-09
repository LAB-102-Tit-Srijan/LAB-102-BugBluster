export default function MatchCard({ candidate, matchScore, theme = "dark" }) {
  const dark = theme === "dark";
  const cardClassName = dark
    ? "rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center text-slate-100 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-indigo-500/40"
    : "rounded-lg bg-white p-6 text-center shadow transition-shadow hover:shadow-lg";
  const occupationClassName = dark ? "mb-2 text-sm text-slate-300" : "mb-2 text-gray-600";
  const scoreCardClassName = dark ? "mb-4 rounded-xl bg-slate-800 p-3" : "mb-4 rounded-lg bg-indigo-100 p-3";
  const scoreClassName = dark ? "text-2xl font-bold text-indigo-300" : "text-2xl font-bold text-indigo-600";
  const detailClassName = dark ? "space-y-1 text-sm text-slate-300" : "space-y-1 text-sm text-gray-600";
  const buttonClassName = dark
    ? "mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
    : "mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700";

  return (
    <div className={cardClassName}>
      <img
        src={candidate.image}
        alt={candidate.name}
        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
      />
      <h3 className="mb-1 text-lg font-semibold text-inherit">{candidate.name}</h3>
      <p className={occupationClassName}>{candidate.occupation}</p>
      <div className={scoreCardClassName}>
        <p className={scoreClassName}>{matchScore}%</p>
        <p className={dark ? "text-sm text-slate-300" : "text-sm text-gray-600"}>Match Score</p>
      </div>
      <div className={detailClassName}>
        <p>Budget: Rs{candidate.budget}</p>
        <p>City: {candidate.city}</p>
      </div>
      <button className={buttonClassName}>Connect</button>
    </div>
  );
}
