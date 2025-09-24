export function StatCard({ title, value, hint }) {
  const NEON = "#6CFC4F";

  return (
    <div
      className="rounded-xl p-5 transition-shadow"
      style={{
        background: "rgba(10,13,22,0.75)", // glass oscuro
        border: "1px solid rgba(108,252,79,0.18)",
        boxShadow:
          "0 6px 24px rgba(0,0,0,.45), 0 0 0 1px rgba(108,252,79,.08) inset",
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: NEON, textShadow: `0 0 8px ${NEON}55` }}
      >
        {title}
      </div>
      <div
        className="text-2xl font-bold text-white mb-1"
        style={{ textShadow: `0 0 12px ${NEON}44` }}
      >
        {value ?? "—"}
      </div>
      {hint && (
        <div className="text-[11px] text-slate-400 mt-2">{hint}</div>
      )}
    </div>
  );
}
