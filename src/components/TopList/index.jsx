export function TopList({ title, items = [], leftKey, rightKey }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="font-medium mb-2">{title}</div>
      <ul className="divide-y">
        {safeItems.length ? safeItems.map((it, idx) => (
          <li key={idx} className="py-2 flex justify-between text-sm">
            <span className="truncate">{it[leftKey]}</span>
            <span className="font-semibold">{it[rightKey]}</span>
          </li>
        )) : (
          <li className="py-2 text-gray-400 text-sm">Sin datos</li>
        )}
      </ul>
    </div>
  );
}
