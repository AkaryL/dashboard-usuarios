export function StatCard({ title, value, hint }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value ?? "—"}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}
