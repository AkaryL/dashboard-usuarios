export function StatCard({ title, value, hint }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4">
      <div className="text-xs text-gray-600 font-medium">{title}</div>
      <div className="text-xl font-light text-gray-900 mb-1">{value ?? "—"}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}