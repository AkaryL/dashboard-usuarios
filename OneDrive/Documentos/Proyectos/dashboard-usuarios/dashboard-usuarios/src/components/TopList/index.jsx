import { useNavigate } from "react-router-dom";

const NEON = "#6CFC4F";

export function TopList({ title, items = [], leftKey, rightKey, name, risk, user }) {
  const safeItems = Array.isArray(items) ? items : [];
  const nav = useNavigate();

  const getRiskColor = (level) => {
    if (level === "Alto")
      return "px-2 py-1 text-red-400 border border-red-500 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse";
    if (level === "Medio")
      return "px-2 py-1 text-yellow-300 border border-yellow-400 rounded-lg shadow-[0_0_10px_rgba(253,224,71,0.5)]";
    return "px-2 py-1 text-green-400 border border-green-500 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  };

  return (
    <div
      className="rounded-xl overflow-hidden shadow-xl"
      style={{
        background: "rgba(10,13,22,0.75)",
        boxShadow:
          "0 6px 24px rgba(0,0,0,.45), 0 0 0 1px rgba(108,252,79,.08) inset",
      }}
    >
      {title && (
        <div
          className="px-4 py-2 text-sm font-semibold text-white"
          style={{ borderBottom: "1px solid rgba(108,252,79,0.18)" }}
        >
          {title}
        </div>
      )}

      <div className="max-h-[280px] overflow-y-auto">
        <ul className="divide-y divide-[rgba(108,252,79,0.1)]">
          {safeItems.length ? (
            safeItems.map((it, idx) => (
              <li
                key={idx}
                className="px-4 py-3 flex gap-4 justify-between items-center text-xs transition-colors duration-150"
                style={{
                  background: idx % 2 === 0 ? "rgba(12,18,27,0.75)" : "rgba(12,18,27,0.6)",
                }}
              >
                <p className="flex-1 flex flex-col truncate text-slate-300 mr-3">
                  <b className="text-slate-100">{it.name}</b>
                  <span className="text-[11px] text-slate-400">{it[leftKey]}</span>
                </p>

                {it.riesgo && (
                  <span className={`${getRiskColor(it.riesgo)} text-[11px] font-medium`}>
                    {it.riesgo}
                  </span>
                )}

                {rightKey && (
                  <span
                    className="text-xs font-medium text-slate-200 flex-shrink-0"
                    style={{ textShadow: `0 0 6px ${NEON}33` }}
                  >
                    {it[rightKey]}
                  </span>
                )}

                {user && (
                  <button
                    onClick={() => nav(`/usuarios/${encodeURIComponent(it.mac)}`)}
                    className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
                    style={{
                      border: `1px solid ${NEON}66`,
                      color: "#fff",
                      textShadow: `0 0 8px ${NEON}55`,
                    }}
                  >
                    Ver
                  </button>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-slate-400 text-center text-xs">
              No data available
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
