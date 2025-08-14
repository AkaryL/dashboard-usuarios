export function TopList({ title, items = [], leftKey, rightKey }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="max-h-[280px] overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {safeItems.length ? safeItems.map((it, idx) => (
            <li key={idx} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50/50 transition-colors duration-150">
              <span className="truncate text-xs text-gray-600 mr-3">{it[leftKey]}</span>
              <span className="text-xs font-medium text-gray-900 flex-shrink-0">{it[rightKey]}</span>
            </li>
          )) : (
            <li className="px-4 py-6 text-gray-500 text-center text-xs">No data available</li>
          )}
        </ul>
      </div>
    </div>
  );
}