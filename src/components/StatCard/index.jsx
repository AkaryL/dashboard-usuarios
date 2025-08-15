export function StatCard({ title, value, hint }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-4">
      <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">{title}</div>
      <div className="text-xl font-light text-gray-900 dark:text-white mb-1">{value ?? "—"}</div>
      {hint && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}