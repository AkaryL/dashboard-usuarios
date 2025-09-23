import { useNavigate } from "react-router-dom";

export function TopList({ title, items = [], leftKey, rightKey, name, risk, user }) {
  const safeItems = Array.isArray(items) ? items : [];
  const nav = useNavigate();

  const getRiskColor = (level) => {
    if (level === "Alto") return "px-2 py-1 text-red-600 border-2 border-red-600 rounded-xl shadow-md animate-pulse";
    if (level === "Medio") return "px-2 py-1 text-yellow-600 bg border-2 border-yellow-600 rounded-xl shadow-md animate-pulse";
    return "px-2 py-1 text-green-600 b border-2 border-green-600 rounded-xl shadow-md";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="max-h-[280px] overflow-y-auto">
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {safeItems.length ? safeItems.map((it, idx) => (
            <li key={idx} className="px-4 py-3 flex gap-4 justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
              <p className="flex-1 flex flex-col gap-1 truncate text-xs text-gray-600 dark:text-gray-300 mr-3">
                <b>{it.name}</b>
                <span>{it[leftKey]}</span>
              </p>
              <span className="text-xs font-medium text-gray-900 dark:text-white flex-shrink-0"></span>
              {it.riesgo && <span className={`${getRiskColor(it.riesgo)} text-xs font-medium border-2 text-gray-900 dark:text-white flex-shrink-0`}>{it.riesgo}</span>}
              {rightKey && <span className="text-xs font-medium text-gray-900 dark:text-white flex-shrink-0">{it[rightKey]}</span>}
              {user && <button onClick={() => nav(`/usuarios/${encodeURIComponent(it.mac)}`)} className="text-xs px-2 py-1 rounded-xl border-2 border-border-gray-700 dark:border-white font-medium text-gray-900 dark:text-white cursor-pointer">Ver</button>}
            </li>
          )) : (
            <li className="px-4 py-6 text-gray-500 dark:text-gray-400 text-center text-xs">No data available</li>
          )}
        </ul>
      </div>
    </div>
  );
}