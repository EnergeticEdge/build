export default function InsightCard({ label, percentage, body, isFixFirst }) {
  return (
    <div className="rounded-xl border border-navy-100 p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl text-navy-700">{label}</p>
        <p className="font-display text-2xl text-orange">{percentage}%</p>
      </div>
      {isFixFirst && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-orange">Fix this first</p>
      )}
      <p className="mt-3 text-sm text-navy-600">{body}</p>
    </div>
  );
}
